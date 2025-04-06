const mongoose = require("mongoose");

const ModuleSchema = new mongoose.Schema({
    title: { type: String, required: true },
    isFinished: { type: Boolean, default: false }
});

const CourseSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: {type: String, default: ""},
    progress: {
        type: Number,
        default: 0,
        min: 0,
        max: 100,
    },
    // Add whatever else you want here
    modules: [ModuleSchema]
});

const UserSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    hash: { type: String, required: true },
    courses: [CourseSchema]
});

const User = mongoose.model("User", UserSchema);

module.exports = User;
