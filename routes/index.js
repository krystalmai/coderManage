var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.status(200).send("Welcome!")
});

const userAPI = require('./user.api');
router.use('/users', userAPI);
const taskAPI = require('./task.api');
router.use('/tasks', taskAPI)
module.exports = router;
