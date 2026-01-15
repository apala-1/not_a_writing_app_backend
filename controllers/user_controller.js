const asyncHandler = require("../middleware/async.js");
const User = require("../models/user_model.js");
const path = require("path");
const fs = require("fs");

// @desc    Create a new user
// @route   POST /api/users
// @access  Public
exports.createUser = asyncHandler(async (req, res) => {
  const { fullname, email, username, password, phoneNumber, profilePicture } = req.body;

  console.log("Creating user with fullname:", fullname);

  // Check if the email already exists
  const existingEmail = await User.findOne({ email });
  if (existingEmail) {
    return res.status(400).json({ message: "Email already exists" });
  }

  // Check if the username already exists (case-insensitive)
  const existingUsername = await User.findOne({ username }).collation({
    locale: "en",
    strength: 2,
  });
  if (existingUsername) {
    return res.status(400).json({ message: "Username already exists" });
  }

  // Create the user
  const user = await User.create({
    fullname,
    email,
    username,
    password, // Password will be hashed automatically by pre-save hook
    phoneNumber,
    profilePicture: profilePicture || "default-profile.png",
  });

  // Remove password from response
  const userResponse = user.toObject();
  delete userResponse.password;

  res.status(201).json({
    success: true,
    data: userResponse,
  });
});

// @desc    Login user
// @route   POST /api/users/login
// @access  Public
exports.loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Please provide an email and password" });
  }

  // Check if user exists
  const user = await User.findOne({ email }).select("+password");

  if (!user || !(await user.matchPassword(password))) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  sendTokenResponse(user, 200, res);
});

// @desc    Get all users
// @route   GET /api/users
// @access  Private
exports.getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find();

  res.status(200).json({
    success: true,
    count: users.length,
    data: users,
  });
});

// @desc    Get a user by ID
// @route   GET /api/users/:id
// @access  Private
exports.getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  res.status(200).json({
    success: true,
    data: user,
  });
});

// @desc    Update a user
// @route   PUT /api/users/:id
// @access  Private
exports.updateUser = asyncHandler(async (req, res) => {
  const { fullname, email, username, password, phoneNumber, profilePicture } = req.body;

  const user = await User.findById(req.params.id);

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  // Authorization check: Make sure user is updating their own profile
  if (user._id.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: "Not authorized to update this user profile" });
  }

  // Update fields
  user.fullname = fullname || user.fullname;
  user.email = email || user.email;
  user.username = username || user.username;
  user.phoneNumber = phoneNumber || user.phoneNumber;
  user.profilePicture = profilePicture || user.profilePicture;

  if (password) {
    user.password = password;
  }

  await user.save();

  res.status(200).json({
    success: true,
    data: user,
  });
});

// @desc    Delete a user
// @route   DELETE /api/users/:id
// @access  Private
exports.deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  // Authorization check
  if (user._id.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: "Not authorized to delete this user profile" });
  }

  // Remove profile picture if exists
  if (user.profilePicture && user.profilePicture !== "default-profile.png") {
    const profilePicturePath = path.join(__dirname, "../public/profile_pictures", user.profilePicture);
    if (fs.existsSync(profilePicturePath)) {
      fs.unlinkSync(profilePicturePath);
    }
  }

  await User.findByIdAndDelete(req.params.id);

  res.status(200).json({
    success: true,
    message: "User deleted successfully",
  });
});

// @desc    Upload profile picture
// @route   POST /api/users/upload
// @access  Private
exports.uploadProfilePicture = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).send({ message: "Please upload a file" });
  }

  if (req.file.size > process.env.MAX_FILE_UPLOAD) {
    return res.status(400).send({
      message: `Please upload an image less than ${process.env.MAX_FILE_UPLOAD} bytes`,
    });
  }

  res.status(200).json({
    success: true,
    data: req.file.filename,
  });
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

  res
    .status(statusCode)
    .cookie("token", token, options)
    .json({
      success: true,
      token,
      data: userResponse,
    });
};
