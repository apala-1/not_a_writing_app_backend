const express = require("express");
const router = express.Router();
const upload = require("../middleware/uploads");
const { protect } = require("../middleware/auth");

const {
  createUser,
  loginUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  uploadProfilePicture
} = require("../controllers/user_controller");

router.post("/upload", upload.single("profilePicture"), uploadProfilePicture);

router.post("/", createUser);       // Register
router.post("/login", loginUser);   // Login
router.get("/", protect, getAllUsers);
router.get("/:id", getUserById);
router.put("/:id", protect, updateUser);
router.delete("/:id", protect, deleteUser);

module.exports = router;
