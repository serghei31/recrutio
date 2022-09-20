const express = require('express');
const {
  createUser,
  getUsers,
  login,
  forgotPassword,
  resetPassword,
} = require('../controllers/userController');

const userRouter = express.Router();

userRouter.route('/').get(getUsers);
userRouter.route('/signup').post(createUser);
userRouter.route('/login').post(login);
userRouter.patch('/resetpassword/:token', resetPassword);
userRouter.post('/forgotpassword', forgotPassword);

module.exports = userRouter;
