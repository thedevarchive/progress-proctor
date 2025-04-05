const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    hash: { type: String, required: true }, // Hash this later
    courses: [
        {
            type: [
                {
                    courseName: { type: String, required: true },
                    progress: {type: Number, required: true, default: 0, min: 0, max: 100}, 
                    modules: [
                        {
                            moduleName: { type: String, required: true },
                            isFinished: { type: Boolean, default: false } // Track module completion
                        }
                    ]
                }
            ],
            default: []
        }
    ]
});

const User = mongoose.model("User", UserSchema);

module.exports = User;
