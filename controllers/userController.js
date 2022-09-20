const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/userModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const sendEmail = require('../utils/email');

const getUsers = catchAsync(async (req, res, next) => {
  const users = await User.find();

  if (users) {
    res.status(200).json({
      status: 'success',
      results: users.length,
      data: {
        data: users,
      },
    });
  } else {
    return next(new AppError('There are no users in your DB', 404));
  }
});

const createTokenAndCookies = (user, res, statusCode) => {
  const token = jwt.sign({ id: user._id }, process.env.JWT_secret, {
    expiresIn: process.env.JWT_expiresIn,
  });

  //remove the password from output
  user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    token: token,
    data: {
      data: user,
    },
  });
};

const createUser = catchAsync(async (req, res, next) => {
  const user = await User.create(req.body);

  createTokenAndCookies(user, res, 201);
});

const login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError('Please enter an email and password', 400));
  }

  const user = await User.findOne({ email }).select('+password');
  const correct = await user.correctPassword(password, user.password);

  if (!user || !correct) {
    return next(new AppError('Incorrect email or password!', 401)); //it is better as attacker does not know if user or pass is incorrect
  }

  createTokenAndCookies(user, res, 200);
});

const protect = catchAsync(async (req, res, next) => {
  //1) Getting token and check if it's there
  let token;
  if (
    req.headers.authorization ||
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    next(
      new AppError('Your are not logged in! Please login to get access!', 401)
    );
  }
  //verify a token symmetric
  const decoded = jwt.verify(token, process.env.JWT_secret);

  //3) Check if user still exists
  const currentUser = await User.findOne({ _id: decoded.id });
  if (!currentUser) {
    next(new AppError('This user is no longer existing', 401));
  }

  //4) Check if user changed password since token wass issued
  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError('Password was changed. Please log in again.'),
      401
    );
  }
  //Grant access to the protected route
  req.user = currentUser;
  next();
});

const forgotPassword = catchAsync(async (req, res, next) => {
  //1) Get user based on the specified email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError('This user does not exist', 404));
  }
  //2) Generate the random reset token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false }); //otherwise validation will not allow to update the user, we need to pass all required params
  //3) Send it to user's email address
  const resetUrl = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/users/resetpassword/${resetToken}`;
  const message = `Forgot your password? Submit a patch request with your new password and password confirm to <a href="${resetUrl}">LINK</a> \n If you didn't forgot your password, please ignore this email!`;

  try {
    await sendEmail({
      email: user.email,
      subject: 'Your password reset token (valid for 10 minutes)',
      message: message,
    });

    res.status(200).json({
      status: 'success',
      message: 'Token sent to email successfully',
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(
      new AppError(
        'There was an error sending the email. Please try again later.',
        500
      )
    );
  }
});

const resetPassword = catchAsync(async (req, res, next) => {
  //1) Get user based on the token
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });
  //2) If token has not expired and there is user, set new password
  if (!user) {
    return next(new AppError('Token is invalid or has expired', 400));
  }
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  //3) log the user in, set JWT
  createTokenAndCookies(user, res, 200);
});

module.exports = {
  createUser,
  getUsers,
  login,
  protect,
  forgotPassword,
  resetPassword,
};
