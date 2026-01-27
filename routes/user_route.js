const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");

const {
  createUser,
  loginUser,
  getAllUsers,
  getUserById
} = require("../controllers/user_controller");

router.post("/", createUser);       // Register
router.post("/login", loginUser);   // Login
router.get("/", protect, getAllUsers);
router.get("/:id", getUserById);

module.exports = router;
