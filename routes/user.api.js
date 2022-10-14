const express = require("express");
const router = express.Router();

const {
  createUser,
  getUsers,
  getUserById,
  editUser,
  deleteUser,
  getTasksByUserId,
} = require("../controllers/user.controller");

//Create
/**
 * @route POST api/users
 * @description Create new user
 * @access private, assigner
 */

router.post('/', createUser);

//Read
/**
 * @route GET API/users
 * @description Get a list of users
 * @access public
 */
router.get('/', getUsers)


/**
 * @route GET api/users/:id
 * @description Get user by id
 * @access public
 */

router.get('/:id', getUserById)

/**
 * @route GET api/users/:id/tasks
 * @description Get tasks user by id
 * @access public
 */
router.get('/:id/tasks', getTasksByUserId)


//Update
/**
 * @route PUT api/users/:id
 * @description Edit a user
 * @access private, assigner
 * @allowedEdits : {"role": String enum ["manager", "employee"], 
 *                  "name": String}
 */
 router.put('/:id', editUser)

//Delete
/**
 * @route DELETE api/users/:id
 * @description Delete an user
 * @access private, assigner
 * 
 */
router.delete('/:id', deleteUser)

module.exports = router;