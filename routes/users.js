var express = require('express');
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
var router = express.Router();

const User = require('../models/User'); 
const authenticateToken = require("../middleware/auth");

router.post("/signup", async (req, res) => {
  const { username, email, password } = req.body;

  try {
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const saltRounds = 10;
    const hash = bcrypt.hashSync(password, saltRounds);

    console.log(hash); 
    // Create new user
    const newUser = new User({ username, email, hash }); // Hash password in real use
    await newUser.save();

    res.status(201).json({ message: "User created successfully", user: newUser });
  } catch (err) {
    console.log(err); 
    res.status(500).json({ error: "Failed to create user" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: "Invalid email or password" });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.hash);
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid email or password" });
    }

    // Generate JWT token
    const token = jwt.sign({ userId: user._id, email: user.email }, process.env.JWT_SECRET, {
      expiresIn: "24h",
    });

    res.json({ message: "Login successful", token, userId: user._id });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

router.get("/userinfo", authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select("-hash"); // remove sensitive info
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
