const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");

const {
  createUser,
  loginUser,
} = require("../controllers/user_controller");

router.post("/", createUser);       // Register
router.post("/login", loginUser);   // Login

module.exports = router;
