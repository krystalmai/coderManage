const mongoose = require("mongoose");
const User = require("../models/User");
const Task = require("../models/Task");
const taskController = {};
const { sendResponse, AppError } = require("../helpers/utils");
const { update } = require("../models/User");

taskController.createTask = async (req, res, next) => {
  try {
    if (!req.body) throw new AppError(400, "No request body", "Bad Request");
    const created = await Task.create(req.body);
    sendResponse(
      res,
      200,
      true,
      { data: created },
      null,
      "Create Task Success"
    );
  } catch (err) {
    next(err);
  }
};

taskController.getTasks = async (req, res, next) => {
  try {
    const allowedFilters = ["status", "createdAt", "updatedAt", "name"];
    const { ...queryFilters } = req.query;
    

    //validate if query keys are allowed
    const queryKeys = Object.keys(queryFilters);
    queryKeys.forEach((key) => {
      if (!allowedFilters.includes(key))
        throw new AppError(400, `query ${key} is not allowed`, "Bad request");
      //delete query without value
      if (!queryFilters[key]) delete queryFilters[key];
    });
    queryFilters.isDeleted = false;
    const listOfTasks = await Task.find(queryFilters).populate("assignee");

    // pagination
    const page = req.query.page || 1;
    const limit = req.query.limit || 10; //how many items in a response
    let offset = limit * (page - 1);
    let tasks = listOfTasks.slice(offset, offset + limit);
    let totalTasks = await Task.count({isDeleted: false});
    let data = { tasks, totalTasks };
    sendResponse(res, 200, true, data, null, "Found list of tasks success");
  } catch (err) {
    next(err);
  }
};

taskController.updateTask = async (req, res, next) => {
  const allowedUpdates = ["newStatus", "newAssignee", "removeAssignee", "description"]
  try{
    if (!req.body || !req.params.id)
      throw new AppError(400, "No request body or no task id", "Bad Request");

    const { id } = req.params;
    //validate request body
    const updateFields = Object.keys(req.body);
    updateFields.forEach((key) => {
      if (!allowedUpdates.includes(key)) throw new AppError(400, `${key} is not an allowed update`, "Bad Request")
      if(!req.body[key]) delete req.body[key]
    })
    const { newStatus, newAssignee, removeAssignee, description } = req.body; //will be validated by mongoose schema
    let task = await Task.findById(id);
    if (!task)
      sendResponse(
        res,
        404,
        false,
        null,
        null,
        "Can't find a task with this id"
      );

    if (newStatus) await updateStatus(res, task, newStatus);
    if (newAssignee) await assignUser(res, task, newAssignee);
    if (removeAssignee) await unassignUser(res, task, removeAssignee);
    if (description) {
      task.description = description;
      await task.save()
      
    }
    sendResponse(
      res,
      200,
      true,
      { data: task },
      null,
      "Update Task Status success"
    );
  
  } catch (err) {
    next(err);
  }
};

taskController.deleteTask = async (req, res, next) => {
  try {
    if (!req.params.id) throw new AppError(400, "No task id", "Bad Request");

    const { id } = req.params;
    const options = { new: true };

    const updated = await Task.findByIdAndUpdate(
      id,
      { isDeleted: true },
      options
    ); //soft delete
    sendResponse(
      res,
      200,
      true,
      { data: updated },
      null,
      "Delete Task success"
    );
  } catch (err) {
    next(err);
  }
};




const updateStatus = async (res, task, newStatus) => {
  // check if current status is done
  if (task.status === "done") {
    if (newStatus !== "archive") {
      throw new AppError(400, "This task can only be changed to 'archive'");
    } else {
      task.status = "archive";
    }
  } else {
    task.status = newStatus;
  }
  task = await task.save();
};



const assignUser = async (res, task, newAssignee) => {
  if (task.assignee) {
    throw new AppError(400, "Task can only have one assignee", "Bad request" )
    
  }
  else {
    let foundUser = await User.findById(newAssignee);
    if (!foundUser) { sendResponse(res, 404, false, null, null, "Can't find user") }
    else {
      task.assignee = newAssignee;
      task = await task.save()
      foundUser.tasks.push(task._id);
      foundUser = await foundUser.save();
    }
  }
};
const unassignUser = async (res, task, removeAssignee) => {
  if (!task.assignee) {
    throw new AppError(
      400,
      "This task hasn't been assigned to anyone",
      "Bad request"
    );
  } else {
    let foundUser = await User.findById(removeAssignee);
    if (!foundUser) {
      throw AppError(404, "Can't find user", "Not found");
    } else {
      task.assignee = null
      task = await task.save();
      foundUser.tasks = foundUser.tasks.filter((item) => item.valueOf() !== task._id.valueOf());
      foundUser = await foundUser.save();
      
    }
  }
    
    
};


module.exports = taskController;
