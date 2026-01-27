const asyncHandler = require("../middleware/async");
const User = require("../models/user_model");

// @desc    Register user
// @route   POST /api/users
// @access  Public
exports.createUser = asyncHandler(async (req, res) => {
  const { name, email, password, profilePicture } = req.body;

  // Check if email exists
  const existingEmail = await User.findOne({ email });
  if (existingEmail) {
    return res.status(400).json({ message: "Email already exists" });
  }

  const user = await User.create({ name, email, password, profilePicture: profilePicture || "default-picture.png" });

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
  const { name, email, password, profilePicture } = req.body;

  const user = await User.findById(req.params.id);

  if(!user) {
    return res.status(404).json({ message: "User not found" });
  }

  // authorization check to make sure user is updating own profille
  if(user._id.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      message: "Not authorized to update this user profile"
    });
  }

    // Update the student fields
    user.name = name || user.name;
    user.email = email || user.email;
    user.profilePicture = profilePicture || user.profilePicture;

    if(password){
      user.password = password;
    }

    await user.save();

    res.status(200).json({
      success: true,
      data: user,
    });
});

// delete user
exports.deleteUser = asyncHandler(async(req, res) => {
  const user = await User.findById(req.params.id);

  if(!user) {
    return res.status(404).json({message: "User not found"});
  }

  // Authorization
  if (user._id.toString() !== req.user._id.toString()) {
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