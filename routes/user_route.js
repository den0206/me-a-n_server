const express = require('express');
const router = express.Router();

const userController = require('../controllers/user_controller');

router.get('/', userController.getUsers);

router.post('/signup', userController.signUp);

router.post(`/login`, userController.login);

module.exports = router;
