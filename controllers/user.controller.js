const mongoose = require("mongoose");
const User = require("../models/User");
const userController = {};
const { sendResponse, AppError } = require("../helpers/utils");

userController.createUser = async (req, res, next) => {
  try {
    if (!req.body) throw new AppError(400, "No request body", "Bad Request");
    const created = await User.create(req.body);
    sendResponse(
      res,
      200,
      true,
      { data: created },
      null,
      "Create User Success"
    );
  } catch (err) {
    next(err);
  }
};

userController.getUsers = async (req, res, next) => {
  try {
    const allowedFilters = ["name", "role"];
    const { ...queryFilters } = req.query;

    //validate if query keys are allowed
    const queryKeys = Object.keys(queryFilters);
    queryKeys.forEach((key) => {
      if (!allowedFilters.includes(key))
        throw new AppError(400, `query ${key} is not allowed`, "Bad request");
      //delete query without value
      if (!queryFilters[key]) delete queryFilters[key];
    });

    queryFilters.isDeleted = false; //only show non-deleted
    const listOfUsers = await User.find(queryFilters).populate("tasks");

    // pagination
    const page = req.query.page || 1;
    const limit = req.query.limit || 10; //how many items in a response
    let offset = limit * (page - 1);
    let users = listOfUsers.slice(offset, offset + limit);
    let totalUsers = await User.count({isDeleted: false});
    let data = { users, totalUsers };
    sendResponse(res, 200, true, data, null, "Found list of users success");
  } catch (err) {
    next(err);
  }
};

userController.getUserById = async (req, res, next) => {
  try {
    if (!req.params.id)
      throw new AppError(400, "Missing user id", "Bad Request");
    const { id } = req.params;

    const user = await User.findById(id).populate("tasks");
    if (!user)
      sendResponse(
        res,
        404,
        false,
        null,
        "Not found",
        "Can't find user with this id"
      );
    sendResponse(res, 200, true, { user }, null, "User found");
  } catch (error) {
    next(error);
  }
};

userController.editUser = async (req, res, next) => {
  const allowedEdits = ["role", "name"];
  try {
    if (!req.body || !req.params.id)
      throw new AppError(400, "No request body or no User id", "Bad Request");

    const { id } = req.params;
    const updateInfo = req.body;
    //validate id
    const found = await User.findById(id);
    if (!found) throw new AppError(404, "User does not exist", "Not Found")

    //validate updateInfo
    const updateFields = Object.keys(updateInfo);
    console.log(updateFields);
    updateFields.forEach((field) => {
      if (!allowedEdits.includes(field))
        throw new AppError(
          400,
          `${field} is not an updatable field. Try 'role' or 'name'`,
          "Bad request"
        );
      if (!updateInfo[field]) delete updateInfo[field]; // remove empty field
    });

    const options = { new: true };

    const updated = await User.findByIdAndUpdate(id, updateInfo, options);
    sendResponse(
      res,
      200,
      true,
      { user: updated },
      null,
      "Update User success"
    );
  } catch (err) {
    next(err);
  }
};

userController.deleteUser = async (req, res, next) => {
  try {
    if (!req.params.id) throw new AppError(400, "No User id", "Bad Request");

    const { id } = req.params;
    const options = { new: true };

    const updated = await User.findByIdAndUpdate(
      id,
      { isDeleted: true },
      options
    ); //soft delete
    sendResponse(
      res,
      200,
      true,
      { user: updated },
      null,
      "Delete User success"
    );
  } catch (err) {
    next(err);
  }
};
userController.getTasksByUserId = async (req, res, next) => {
  try {
    if (!req.params.id)
      throw new AppError(400, "Missing user id", "Bad request");
    const { id } = req.params;
    const userFound = await User.findById(id).populate("tasks");
    if (!userFound) sendResponse(res, 404, false, null, null, "No user found");
    sendResponse(
      res,
      200,
      true,
      { tasks: userFound.tasks },
      null,
      "Found user's tasks"
    );
  } catch (error) {
    next(error);
  }
};
module.exports = userController;
