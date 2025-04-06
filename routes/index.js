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

router.get("/courses/:id", authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId); 

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const course = user.courses.find(c => c.id === req.params.id);

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    res.status(200).json({ message: "Course found", course: course });
  } catch (err) {
    console.error("Unable to find course:", err);
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/courses/:id/modules", authenticateToken, async (req, res) => {
  const { title } = req.body;

  try {
    const user = await User.findById(req.user.userId); 

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const course = user.courses.find(c => c.id === req.params.id);

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    course.modules.push({ title }); 

    await user.save(); // Save changes to DB

    res.status(201).json({ message: "Module added successfully", modules: course.modules });
  } catch (err) {
    console.error("Error adding course:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
