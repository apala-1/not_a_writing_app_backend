const asyncHandler = require("../middleware/async");
const User = require("../models/user_model");
const path = require("path");
const fs = require("fs");

// @desc    Register user
// @route   POST /api/users
// @access  Public
exports.createUser = asyncHandler(async (req, res) => {
  const { name, email, password, profilePicture, bio, occupation } = req.body;
  // Check if email exists
  const existingEmail = await User.findOne({ email });
  if (existingEmail) {
    return res.status(400).json({ message: "Email already exists" });
  }

  const user = await User.create({ name, email, password, profilePicture: profilePicture || "default-picture.png", bio: bio || "", occupation: occupation || "", role: "user" });
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

// get all users
exports.getAllUsers = asyncHandler(async(req, res) => {
  const users = await User.find();

  res.status(200).json({
    success: true,
    count: users.length,
    data: users,
  });
});

// get user by ID
exports.getUserById = asyncHandler(async(req, res) => {
  const user = await User.findById(req.params.id);

  if(!user) {
    return res.status(404).json({message: "User not found"});
  }

  res.status(200).json({
    success: true,
    data: user,
  });
});


// update user
exports.updateUser = asyncHandler(async(req, res) => {
  const { name, email, password, bio, occupation } = req.body;
  const user = await User.findById(req.params.id);

  if(!user) return res.status(404).json({ message: "User not found" });

  // Allow admins to update any user
  if(user._id.toString() !== req.user._id.toString() && req.user.role !== "admin") {
    return res.status(403).json({ message: "Not authorized" });
  }

  // Update fields
  user.name = name || user.name;
  user.email = email || user.email;
  user.bio = bio || user.bio;
  user.occupation = occupation || user.occupation;
  if(password) user.password = password;

  // Multer file
  if(req.file){
    // delete old file
    if(user.profilePicture && user.profilePicture !== "default-picture.png"){
      const oldImagePath = path.join(__dirname, "../public/profile_pictures", user.profilePicture.split("/").pop());
      if(fs.existsSync(oldImagePath)) fs.unlinkSync(oldImagePath);
    }
    user.profilePicture = `/profile_pictures/${req.file.filename}`; 
  }

  await user.save();

  res.status(200).json({
    success: true,
    data: user
  });
});


// delete user
exports.deleteUser = asyncHandler(async(req, res) => {
  const user = await User.findById(req.params.id);

  if(!user) {
    return res.status(404).json({message: "User not found"});
  }

  // Authorization: allow admin or the user themselves
if (user._id.toString() !== req.user._id.toString() && req.user.role !== "admin") {
  return res.status(403).json({
    message: "Not authorized to delete this user profile"
  });
}


  if(user.profilePicture &&
    user.profilePicture !== "default-picture.png"
  ){
    const profilePicturePath = path.join(
      __dirname,
      "../public/profile_pictures",
      user.profilePicture
    );
    if(fs.existsSync(profilePicturePath)){
      fs.unlinkSync(profilePicturePath);
    }
  }
  await User.findByIdAndDelete(req.params.id);

  res.status(200).json({
    success: true,
    message: "User deleted successfully",
  });
});

// upload profile picture
exports.uploadProfilePicture = asyncHandler(async(req, res, next) => {
  if(!req.file){
    return res.ststus(400).send({message: "Please upload a file"});
  }

  // to check file size ani send error msg
  if(req.file.size > process.env.MAX_FILE_UPLOAD){
    return res.status(400).send({
      message: `Please upload an image less than ${process.env.MAX_FILE_UPLOAD} bytes`
    });
  }
  res.status(200).json({
    success: true,
    data: req.file.filename,
  });
});

// @desc    Get current logged-in user
// @route   GET /api/users/me
// @access  Private
exports.getMe = asyncHandler(async (req, res) => {
  if (!req.user || !req.user.id) {
    return res.status(401).json({ message: "Not logged in or invalid token" });
  }

  const user = await User.findById(req.user.id);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  const userResponse = user.toObject();
  delete userResponse.password;

  res.status(200).json({
    success: true,
    data: userResponse,
  });
});

// update logged-in user
exports.updateMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) return res.status(404).json({ message: "User not found" });

  const { name, email, password, bio, occupation } = req.body;

  // Update fields
  user.name = name || user.name;
  user.email = email || user.email;
  user.bio = bio || user.bio;
  user.occupation = occupation || user.occupation;
  if (password) user.password = password;

  // Multer file
  if (req.file) {
    const oldImagePath = path.join(
      __dirname,
      "../public/profile_pictures",
      user.profilePicture.split("/").pop()
    );
    if (fs.existsSync(oldImagePath) && user.profilePicture !== "default-picture.png")
      fs.unlinkSync(oldImagePath);

    user.profilePicture = `/profile_pictures/${req.file.filename}`;
  }

  await user.save();

  const userResponse = user.toObject();
  delete userResponse.password;

  res.status(200).json({ success: true, data: userResponse });
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