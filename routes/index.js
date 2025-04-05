var express = require('express');
var router = express.Router();

const User = require('../models/User'); 
const authenticateToken = require("../middleware/auth");

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.post("/courses", authenticateToken, async (req, res) => {
  const { title } = req.body;

  try {
    const user = await User.findById(req.user.userId); 

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Add new course to user's courses array
    user.courses.push({ title });

    await user.save(); // Save changes to DB

    res.status(201).json({ message: "Course added successfully", courses: user.courses });
  } catch (err) {
    console.error("Error adding course:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
