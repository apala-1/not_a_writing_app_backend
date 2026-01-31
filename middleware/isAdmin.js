const jwt = require("jsonwebtoken");
const User = require("../models/user_model");

const isAdmin = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1]; // Bearer token
    if (!token) return res.status(401).json({ message: "Not authorized" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.role !== "admin")
      return res.status(403).json({ message: "Admin access required" });

    req.user = user; // attach user to request
    next();
  } catch (error) {
    return res.status(401).json({ message: "Not authorized" });
  }
};

module.exports = isAdmin;
