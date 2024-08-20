const mongoose = require("mongoose");

const TaskSchema = mongoose.Schema({
  StudentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  StudentName: { type: String, required: true },
  TaskList: [
    {
      TaskName: { type: String, required: true },
      date: { type: Date, required: true },
      Days: { type: Number, required: true },
      Status: { type: String, enum: ["COMPLETE", "PENDING"], required: true },
    },
  ],
});

const TaskModel = mongoose.model("Task", TaskSchema);
module.exports = TaskModel;
