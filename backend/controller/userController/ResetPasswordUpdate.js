const bcrypt = require("bcryptjs");
const userModel = require("../../model/UserModel");
const Token = require("../../model/PasswordRestTokenModel");
const { check, validationResult } = require("express-validator");

const passwordUpdateValidationRules = () => {
  return [
    check("password")
      .notEmpty()
      .isLength({ min: 8 })
      .withMessage("Password must be at least 8 characters long"),
    check("confirmPassword")
      .notEmpty()
      .custom((value, { req }) => {
        if (value !== req.body.password) {
          throw new Error("passwords do not match");
        }
        return true;
      }),
  ];
};

const UpdateResetPassword = async (req, res) => {
  const { password, confirmPassword } = req.body;
  const { userId, tokenId } = req.params;

  try {
    if (!password || !confirmPassword) {
      return res
        .status(400)
        .json({ error: "Both password fields are required" });
    }

    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errorMessages = errors.array().map((error) => error.msg);
      return res.status(400).json({ errors: errorMessages });
    }

    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "Invalid link or expired" });
    }

    const token = await Token.findOne({
      userId: user._id,
      token: tokenId,
    });
    if (!token) {
      return res.status(404).json({ error: "Invalid link or expired" });
    }

    // Check if token is expired
    if (token.expires < new Date()) {
      await token.deleteOne();
      return res.status(400).json({ error: "Reset link has expired" });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    await user.save();
    await token.deleteOne();

    res.json({ message: "Password reset successfully" });
  } catch (error) {
    console.error("Error in UpdateResetPassword:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  UpdateResetPassword,
  passwordUpdateValidationRules,
};
