const { check, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const { sendOtp, verifyOtp } = require("../../config/OtpService");
const userModel = require("../../model/UserModel");

// Register field validation rules
const userRegisterValidationRules = () => {
  return [
    check("name").notEmpty().withMessage("Name is required"),
    check("email")
      .isEmail()
      .withMessage("Invalid email")
      .custom(async (email) => {
        const existingUser = await userModel.findOne({ email });
        if (existingUser) {
          throw new Error("Email already registered");
        }
      }),
    check("phone")
      .notEmpty()
      .withMessage("Phone is required")
      .isNumeric()
      .withMessage("Phone must contain only numbers")
      .isLength({ min: 10, max: 15 })
      .withMessage("Phone number must be between 10 to 15 digits"),
    check("gender").notEmpty().withMessage("Gender is required"),
    check("password")
      .isLength({ min: 8 })
      .withMessage("Password must be at least 6 characters long"),
    check("confirmPassword").custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error("Passwords do not match");
      }
      return true;
    }),
  ];
};

// User registration and send OTP
const userRegister = async (req, res) => {
  // Validate the request
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { name, email, phone, gender, password } = req.body;

    // Temporarily store user data and send OTP
    await sendOtp(email, { name, email, phone, gender, password });

    res.status(201).json({
      message: "OTP sent to email. Please verify to complete registration.",
    });
  } catch (error) {
    console.error("Error registering user:", error);
    res
      .status(500)
      .json({ message: "Internal server error. Please try again later." });
  }
};

// Verify OTP and save user to database
const verifyOtpAndRegister = async (req, res) => {
  try {
    const { otp } = req.body;
    const email = req.body.email.trim().toLowerCase();

    console.log(`Verifying OTP for email: ${email}, OTP: ${otp}`);

    const userData = await verifyOtp(email, otp);

    if (userData) {
      const salt = await bcrypt.genSalt(10);
      const hashPassword = await bcrypt.hash(userData.password, salt);

      const user = new userModel({
        name: userData.name,
        email: userData.email,
        phone: userData.phone,
        gender: userData.gender,
        password: hashPassword,
      });

      await user.save();
      res.status(200).json({ message: "OTP verified and user registered." });
    } else {
      res.status(400).json({ message: "Invalid OTP. Please try again." });
    }
  } catch (error) {
    console.error("Error verifying OTP and registering user:", error);
    res
      .status(500)
      .json({ message: "Internal server error. Please try again later." });
  }
};

module.exports = {
  userRegister,
  verifyOtpAndRegister,
  userRegisterValidationRules,
};
