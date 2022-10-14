const express = require("express");
const router = express.Router();

const {
  createTask,
  getTasks,
  updateTask,
  deleteTask,
} = require("../controllers/task.controller");

//CREAT
/**
 * @route POST api/tasks
 * @description Create new task
 * @access private, assigner
 */

router.post("/", createTask);

//READ
/**
 * @route GET API/tasks
 * @description Get a list of tasks
 * @access public
 * @parameters : "status", "createdAt", "updatedAt", "name"
 */
router.get("/", getTasks);

//UPDATE
/**
 * @route PUT api/tasks/:id
 * @description Update a task's status
 * @access private, assigner
 * @allowedUpdates : {"description": string, 
 *                    "newStatus": string, 
 *                   "newAssignee": objectID string to assign task,
 *                   "removeAssignee": objectID string to unassign}
 */
router.put("/:id", updateTask);

//DELETE
/**
 * @route DELETE api/tasks/:id
 * @description Delete a task
 * @access private, assigner
 */
router.delete("/:id", deleteTask);

module.exports = router;
