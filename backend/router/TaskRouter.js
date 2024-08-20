const express = require("express");
const router = express.Router();
const TaskController = require("../controller/taskController/TaskController");

router.post("/add-task/:id", TaskController.addTask);
router.get("/student-all-task", TaskController.getStudentAllTask);
router.get("/student-task/:id", TaskController.getUserTaskWithId);
router.put(
  "/student-update-task/:studentId/:taskListId",
  TaskController.updateStudentTaskList
);
router.delete(
  "/student-delete-task/:studentId/:taskListId",
  TaskController.studentDeleteWithTaskListId
);

module.exports = router;
