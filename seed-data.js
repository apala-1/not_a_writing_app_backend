const mongoose = require("mongoose");
const colors = require("colors");
const dotenv = require("dotenv");
const User = require("./models/user_model");

// Load env vars
dotenv.config({ path: "./config/config.env" });

// Connect to database
const connectDB = async () => {
  const conn = await mongoose.connect(process.env.LOCAL_DATABASE_URI);
  console.log(`MongoDB Connected: ${conn.connection.host}`.cyan.underline.bold);
};

// User seed data
const users = [
  {
    name: "Kiran Rana",
    email: "kiranrana@gmail.com",
    username: "kiranr",
    password: "password123",
    phoneNumber: "+977-9801234500",
    profilePicture: "default-profile.png",
  },
  {
    name: "Sarah Johnson",
    email: "sarah.johnson@gmail.com",
    username: "sarahj",
    password: "password123",
    phoneNumber: "+977-9801234501",
    profilePicture: "default-profile.png",
  },
  {
    name: "Michael Chen",
    email: "michael.chen@gmail.com",
    username: "mikechen",
    password: "password123",
    phoneNumber: "+977-9801234502",
    profilePicture: "default-profile.png",
  },
  {
    name: "Emily Rodriguez",
    email: "emily.rodriguez@gmail.com",
    username: "emilyrod",
    password: "password123",
    phoneNumber: "+977-9801234503",
    profilePicture: "default-profile.png",
  },
  {
    name: "James Wilson",
    email: "james.wilson@gmail.com",
    username: "jameswilson",
    password: "password123",
    phoneNumber: "+977-9801234504",
    profilePicture: "default-profile.png",
  },
  {
    name: "Priya Patel",
    email: "priya.patel@gmail.com",
    username: "priyap",
    password: "password123",
    phoneNumber: "+977-9801234505",
    profilePicture: "default-profile.png",
  },
  {
    name: "David Kim",
    email: "david.kim@gmail.com",
    username: "davidkim",
    password: "password123",
    phoneNumber: "+977-9801234506",
    profilePicture: "default-profile.png",
  },
  {
    name: "Olivia Martinez",
    email: "olivia.martinez@gmail.com",
    username: "oliviam",
    password: "password123",
    phoneNumber: "+977-9801234507",
    profilePicture: "default-profile.png",
  },
  {
    name: "Ryan Thompson",
    email: "ryan.thompson@gmail.com",
    username: "ryant",
    password: "password123",
    phoneNumber: "+977-9801234508",
    profilePicture: "default-profile.png",
  },
  {
    name: "Sophia Lee",
    email: "sophia.lee@gmail.com",
    username: "sophialee",
    password: "password123",
    phoneNumber: "+977-9801234509",
    profilePicture: "default-profile.png",
  },
  {
    name: "Alex Garcia",
    email: "alex.garcia@gmail.com",
    username: "alexg",
    password: "password123",
    phoneNumber: "+977-9801234510",
    profilePicture: "default-profile.png",
  },
  {
    name: "Emma Brown",
    email: "emma.brown@gmail.com",
    username: "emmab",
    password: "password123",
    phoneNumber: "+977-9801234511",
    profilePicture: "default-profile.png",
  },
  {
    name: "Daniel Singh",
    email: "daniel.singh@gmail.com",
    username: "daniels",
    password: "password123",
    phoneNumber: "+977-9801234512",
    profilePicture: "default-profile.png",
  },
];

// Import data
const importData = async () => {
  try {
    await connectDB();

    await User.deleteMany();
    const createdUsers = await User.insertMany(users);

    console.log(`${createdUsers.length} Users created`.green.inverse);
    console.log("\n✅ User data imported successfully!".green.bold);

    process.exit();
  } catch (error) {
    console.error(`Error: ${error}`.red.inverse);
    process.exit(1);
  }
};

// Delete data
const deleteData = async () => {
  try {
    await connectDB();

    await User.deleteMany();

    console.log("User data destroyed...".red.inverse);
    process.exit();
  } catch (error) {
    console.error(`Error: ${error}`.red.inverse);
    process.exit(1);
  }
};

// Run functions based on command line argument
if (process.argv[2] === "-i") {
  importData();
} else if (process.argv[2] === "-d") {
  deleteData();
} else {
  console.log("Please use -i to import or -d to delete user data".yellow);
  process.exit();
}
