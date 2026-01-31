const express = require("express");
const router = express.Router();

const upload = require("../middleware/multer");
const { protect } = require("../middleware/auth");
const isAdmin = require("../middleware/isAdmin");

const {
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
} = require("../controllers/admin_controller");

// Protect ALL admin routes
router.use(protect, isAdmin);

// CREATE USER
router.post("/", upload.single("profilePicture"), createUser);

// GET ALL USERS
router.get("/", getAllUsers);

// GET USER BY ID
router.get("/:id", getUserById);

// UPDATE USER
router.put("/:id", upload.single("profilePicture"), updateUser);

// DELETE USER
router.delete("/:id", deleteUser);

module.exports = router;
