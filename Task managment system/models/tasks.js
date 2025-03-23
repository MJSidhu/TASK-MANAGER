import mongoose from "mongoose";

const taskSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "User" },
    description: { type: String, required: true },
    status: { type: String, default: "pending" },
    category: { type: String, required: true, enum: ["Daily", "Primary", "Secondary"] },
});

const Task = mongoose.model("Task", taskSchema);
export default Task;
