const UserModel = require("../../model/UserModel");
const TaskModel = require("../../model/TaskModel");

//ADD TASK
const addTask = async (req, res) => {
  const { TaskName, Status } = req.body;
  const { id } = req.params;

  try {
    const user = await UserModel.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Validate Status
    if (!["COMPLETE", "PENDING"].includes(Status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    // Check if a task document already exists for this user
    let task = await TaskModel.findOne({ StudentId: id });

    if (!task) {
      // If no task document exists, create a new one
      task = new TaskModel({
        StudentId: id,
        StudentName: user.name,
        TaskList: [],
      });
    }

    // Add the new task to the TaskList
    task.TaskList.push({
      TaskName,
      date: new Date(),
      Days: 1,
      Status,
    });

    const savedTask = await task.save();

    res.status(201).json(savedTask);
  } catch (error) {
    res.status(500).json({ message: "Error adding task", error });
  }
};

//GET STUDENT ALL TASK
const getStudentAllTask = async (req, res) => {
  try {
    const user = await TaskModel.find();
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: "Error fetching user tasks", error });
  }
};

//GET STUDENT TASK BY ID
const getUserTaskWithId = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await TaskModel.findOne({ StudentId: id });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: "Error fetching user task", error });
  }
};

// UPDATE STUDENT TASK LIST
const updateStudentTaskList = async (req, res) => {
  const { studentId, taskListId } = req.params;
  const { Status, Days } = req.body;

  try {
    const taskDocument = await TaskModel.findOne({ StudentId: studentId });

    if (!taskDocument) {
      return res.status(404).json({ message: "Student not found" });
    }

    // Find and update the specific task in the TaskList
    const updatedTask = await TaskModel.findOneAndUpdate(
      { StudentId: studentId, "TaskList._id": taskListId },
      {
        $set: {
          "TaskList.$.Status": Status,
          "TaskList.$.Days": Days,
        },
      },
      { new: true }
    );

    if (!updatedTask) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Return the updated task list
    res.status(200).json(updatedTask);
  } catch (error) {
    res.status(500).json({ message: "Error updating task", error });
  }
};

//DELETE TASK LIST ID WITH STUDENT
const studentDeleteWithTaskListId = async (req, res) => {
  const { studentId, taskListId } = req.params;

  try {
    if (!studentId || !taskListId) {
      return res.status(400).json({ message: "Invalid parameters" });
    }

    const student = await UserModel.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    const taskDocument = await TaskModel.findOne({ StudentId: studentId });
    if (!taskDocument) {
      return res
        .status(404)
        .json({ message: "Task list not found for the student" });
    }

    const taskExists = taskDocument.TaskList.some(
      (task) => task._id.toString() === taskListId
    );
    if (!taskExists) {
      return res
        .status(404)
        .json({ message: "Task not found in the task list" });
    }

    const updatedTaskDocument = await TaskModel.findOneAndUpdate(
      { StudentId: studentId },
      { $pull: { TaskList: { _id: taskListId } } },
      { new: true }
    );

    if (!updatedTaskDocument) {
      return res.status(500).json({ message: "Failed to delete the task" });
    }

    res
      .status(200)
      .json({ message: "Task deleted successfully", updatedTaskDocument });
  } catch (error) {
    console.error("Error details:", error);
    res
      .status(500)
      .json({ message: "Error deleting task", error: error.message });
  }
};



module.exports = {
  addTask,
  getStudentAllTask,
  getUserTaskWithId,
  updateStudentTaskList,
  studentDeleteWithTaskListId,
};
