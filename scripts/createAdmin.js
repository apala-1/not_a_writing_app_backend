// scripts/createAdmin.js
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const User = require("../models/user_model");

dotenv.config({ path: "./config/config.env" });
mongoose.connect(process.env.LOCAL_DATABASE_URI);

async function createAdmin() {
    const adminExists = await User.findOne({ email: "admin@gmail.com" });
    if (adminExists) {
        console.log("Admin already exists");
        process.exit();
    }

    const admin = await User.create({
        name: "Admin User",
        email: "admin@gmail.com",
        password: "admin123",
        role: "admin",
        profilePicture: "default-picture.png",
        bio: "I am admin",
        occupation: "Administrator"
    });

    console.log("Admin created:", admin);
    process.exit();
}

createAdmin().catch(err => {
    console.error(err);
    process.exit(1);
});
