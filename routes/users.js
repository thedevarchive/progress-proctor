var express = require('express');
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
var router = express.Router();

const User = require('../models/User'); 

router.post("/signup", async (req, res) => {
  const { username, email, password } = req.body;

  console.log(email); 

  try {
    console.log(username); 
    // Check if user already exists
    const existingUser = await User.findOne({ email });

    console.log(username); 
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

  console.log(username); 

    const saltRounds = 10;
    const hash = bcrypt.hashSync(password, saltRounds);

    console.log(hash); 
    // Create new user
    const newUser = new User({ username, email, hash, courses: [] }); // Hash password in real use
    await newUser.save();

    console.log("success"); 

    res.status(201).json({ message: "User created successfully", user: newUser });
  } catch (err) {
    console.log(err); 
    res.status(500).json({ error: "Failed to create user" });
  }
});


module.exports = router;
