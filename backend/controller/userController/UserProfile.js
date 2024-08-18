const userModel = require("../../model/UserModel");
const bcrypt = require("bcryptjs");

const { check, validationResult } = require("express-validator");

// validation rule
const userUpdateValidationRules = () => {
  return [
    check("name").optional().notEmpty().withMessage("Name is required"),
    check("phone")
      .optional()
      .notEmpty()
      .withMessage("Phone is required")
      .isNumeric()
      .withMessage("Phone must contain only numbers"),
    check("gender").optional().notEmpty().withMessage("Gender is required"),
  ];
};

// validation rule for password update

const passwordUpdateValidationRules = () => {
  return [
    check("oldPassword").notEmpty().withMessage("Old password is required"),
    check("newPassword")
      .notEmpty()
      .isLength({ min: 6 })
      .withMessage("New password must be at least 6 characters long"),
    check("confirmNewPassword")
      .notEmpty()
      .custom((value, { req }) => {
        if (value !== req.body.newPassword) {
          throw new Error("New passwords do not match");
        }
        return true;
      }),
  ];
};

const getUserById = async (req, res) => {
  try {
    const id = req.params.id;
    const user = await userModel.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Error fetching user" });
  }
};

//update user account
const updateUser = async (req, res) => {
  const { id } = req.params;
  const { name, phone, gender } = req.body;

  // Validate input
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map((error) => error.msg);
    return res.status(400).json({ errors: errorMessages });
  }

  try {
    const userData = { name, phone, gender };

    const user = await userModel.findByIdAndUpdate(id, userData, { new: true });

    if (user) {
      res.status(200).json({ message: "updated successfully", user });
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (err) {
    res.status(500).json({
      message: "Error occurred while updating user",
      error: err.message,
    });
  }
};

// update user password

const updatePassword = async (req, res) => {
  const { id } = req.params;
  const { oldPassword, newPassword } = req.body;

  // Validate input
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map((error) => error.msg);
    return res.status(400).json({ errors: errorMessages });
  }

  try {
    const user = await userModel.findById(id);
    console.log(user);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid old password" });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);

    await user.save();
    res.status(200).json({ message: "Password updated successfully" });
  } catch (err) {
    res.status(500).json({
      message: "Error occurred while updating password",
      error: err.message,
    });
  }
};

//get all user

const getAllUser = async (req, res) => {
  try {
    const users = await userModel.find();
    res.status(200).json(users);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error occurred while fetching users", error: err });
  }
};

//delete user account
const deleteUser = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await userModel.findByIdAndDelete(id);
    if (user) {
      res.status(200).json({ message: "User deleted successfully" });
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error occurred while deleting user", error: err });
  }
};

module.exports = {
  userUpdateValidationRules,
  passwordUpdateValidationRules,
  getUserById,
  getAllUser,
  updateUser,
  updatePassword,
  deleteUser,
};
