var express = require('express');
var router = express.Router();

const User = require('../models/User');
const authenticateToken = require("../middleware/auth");

/* GET home page. */
router.get('/', function (req, res, next) {
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

router.put("/courses/:id", authenticateToken, async (req, res) => {
  const { title, description } = req.body;

  try {
    const user = await User.findById(req.user.userId); // find user (top level)

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const course = user.courses.find(c => c.id === req.params.id); // find course (array inside top level schema User)

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    // Modify details of course through JavaScript, NOT using mongoose syntax/queries
    if (title) course.title = title;
    if (description) course.description = description;

    await user.save(); // Save changes to the user's document

    res.status(200).json({ message: "Course edited successfully", course: course });
  } catch (err) {
    console.error("Error editing course:", err);
    res.status(500).json({ message: "Server error" });
  }
});

router.delete("/courses/:id", authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId); // find user (top level)

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const course = user.courses.find(c => c.id === req.params.id); // find course (array inside top level schema User)

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    user.courses = user.courses.filter(course => course._id.toString() !== req.params.id);

    await user.save();

    res.status(200).json({ message: "Course deleted" });
  } catch (err) {
    console.error("Error deleting course:", err);
    res.status(500).json({ message: "Server error" });
  }
});

async function updateProgress(course) {
  const completedCount = course.modules.filter(m => m.isFinished).length;
  const moduleCount = course.modules.length;

  if(moduleCount === 0 || completedCount === 0) {
    course.progress = 0; 
  }
  else {
    course.progress = Math.round((completedCount / moduleCount) * 100); 
  }

  console.log(completedCount, moduleCount, course.progress); 
}

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

    await updateProgress(course); // update course progress
    await user.save(); // Save changes to progress after 

    res.status(201).json({ message: "Module added successfully", progress: course.progress, modules: course.modules });
  } catch (err) {
    console.error("Error adding module:", err);
    res.status(500).json({ message: "Server error" });
  }
});

router.put("/courses/:c_id/modules/:m_id/finished", authenticateToken, async (req, res) => {
  console.log(req.params);
  try {
    const user = await User.findById(req.user.userId); // find user (top level)

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const course = user.courses.find(c => c.id === req.params.c_id); // find course (array inside top level schema User)

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    const module = course.modules.find(c => c.id === req.params.m_id); // find module (not top level so also use find)

    if (!module) {
      return res.status(404).json({ message: "Course not found" });
    }

    // Modify completion status of module
    module.isFinished = !module.isFinished;

    await user.save(); // Save changes to the user's document

    await updateProgress(course); // update course progress
    await user.save(); // Save changes to progress after 

    res.status(200).json({ message: "Module completion validated", progress: course.progress }); //only return course to update progress bar
  } catch (err) {
    console.error("Error editing module:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
