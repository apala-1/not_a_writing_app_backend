const asyncHandler = require("../middleware/async");
const User = require("../models/user_model");

// @desc    Register user
// @route   POST /api/users
// @access  Public
exports.createUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  // Check if email exists
  const existingEmail = await User.findOne({ email });
  if (existingEmail) {
    return res.status(400).json({ message: "Email already exists" });
  }

  const user = await User.create({ name, email, password });

  const userResponse = user.toObject();
  delete userResponse.password;

  res.status(201).json({ success: true, data: userResponse });
});

// @desc    Login user
// @route   POST /api/users/login
// @access  Public
exports.loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Please provide email and password" });
  }

  const user = await User.findOne({ email }).select("+password");

  if (!user || !(await user.matchPassword(password))) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  sendTokenResponse(user, 200, res);
});

// Helper: send token response
const sendTokenResponse = (user, statusCode, res) => {
  const token = user.getSignedJwtToken();

  const options = {
    expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000),
    httpOnly: true,
  };

  if (process.env.NODE_ENV === "production") {
    options.secure = true;
  }

  const userResponse = user.toObject();
  delete userResponse.password;

  res.status(statusCode).cookie("token", token, options).json({
    success: true,
    token,
    data: userResponse,
  });
};
