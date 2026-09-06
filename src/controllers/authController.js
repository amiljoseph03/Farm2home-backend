const User = require('../models/userModel');
const jwt = require('jsonwebtoken');
const AppError = require('../utils/appError');

// JWT Token ഉണ്ടാക്കുന്ന ഫംഗ്ഷൻ
const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

// Response-ൽ Token അയക്കുന്ന ഫംഗ്ഷൻ
const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);

  // Password റെസ്‌പോൺസിൽ നിന്ന് ഒഴിവാക്കാൻ
  user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
};

// 1. User Registration Controller
exports.register = async (req, res, next) => {
  try {
    console.log("received body",req.body)
    const { name, email, phone, password, role } = req.body;

    // ഇമെയിൽ അല്ലെങ്കിൽ ഫോൺ നമ്പർ നിലവിലുണ്ടോ എന്ന് പരിശോധിക്കുന്നു
    const existingUser = await User.findOne({ $or: [{ email }, { phone }] });
    if (existingUser) {
      return next(
        new AppError('User with this email or phone already exists', 400),
      );
    }

    const newUser = await User.create({
      name,
      email,
      phone,
      password,
      role,
    });

    createSendToken(newUser, 201, res);
  } catch (error) {
    next(error);
  }
};

// 2. User Login Controller
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // 1. ഇമെയിലും പാസ്‌വേഡും നൽകാതിരുന്നാൽ
    if (!email || !password) {
      return next(new AppError('Please provide email and password!', 400));
    }

    // 2. User ഡാറ്റാബേസിൽ ഉണ്ടോ എന്ന് പരിശോധിക്കുന്നു (+password)
    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.correctPassword(password, user.password))) {
      return next(new AppError('Incorrect email or password', 401));
    }

    // 3. ക്രെഡൻഷ്യലുകൾ ശരിയാണെങ്കിൽ Token അയക്കുക
    createSendToken(user, 200, res);
  } catch (error) {
    next(error);
  }
};
