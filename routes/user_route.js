const express = require("express");
const router = express.Router();
const upload = require("../middleware/uploads");
const { protect } = require("../middleware/auth");
const isAdmin = require("../middleware/isAdmin");

const {
  createUser,
  loginUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  uploadProfilePicture,
  getMe,
  updateMe,
} = require("../controllers/user_controller");

// Public routes
router.post("/", createUser);       // Register
router.post("/login", loginUser);   // Login

// Upload profile picture (logged-in users)
router.post("/upload", protect, upload.single("profilePicture"), uploadProfilePicture);

// Get current logged-in user
router.get("/me", protect, getMe);
router.put("/me", protect, upload.single("profilePicture"), updateMe); // <-- new route

// Update logged-in user
router.put("/me", protect, upload.single('profilePicture'), updateUser);

// Admin routes
router.get("/", protect, isAdmin, getAllUsers);          // Admin: get all users
router.get("/:id", protect, isAdmin, getUserById);      // Admin: get any user by ID
router.put("/:id", protect, isAdmin, upload.single('profilePicture'), updateUser); // Admin: update any user
router.delete("/:id", protect, isAdmin, deleteUser);    // Admin: delete any user

module.exports = router;
