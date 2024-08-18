const express = require("express");
const router = express.Router();
const { auth } = require("../controller/middelware/auth");
const userRegister = require("../controller/userController/UserRegister");
const userLogin = require("../controller/userController/UserLogin");
const forgetPassword = require("../controller/userController/ForgetPassword");
const resetPasswordUpdate = require("../controller/userController/ResetPasswordUpdate");
const UserProfileController = require("../controller/userController/UserProfile");

router.post(
  "/register",
  userRegister.userRegisterValidationRules(),
  userRegister.userRegister
);

// OTP verification route
router.post("/verifyOtpAndRegister", userRegister.verifyOtpAndRegister);

router.post("/login", userLogin.Login);
router.get("/logout", userLogin.Logout);

//forget password
router.post("/password-reset", forgetPassword.forgotPassword);
//update reset password
router.post(
  "/update-reset-password/:userId/:tokenId",
  resetPasswordUpdate.passwordUpdateValidationRules(),
  resetPasswordUpdate.UpdateResetPassword
);

//getUserById
router.get("/getUserById/:id", auth, UserProfileController.getUserById);

//update user
router.put(
  "/update-user/:id",
  auth,
  UserProfileController.userUpdateValidationRules(),
  UserProfileController.updateUser
);

//update password
router.put(
  "/update-user-password/user/:id",
  auth,
  UserProfileController.passwordUpdateValidationRules(),
  UserProfileController.updatePassword
);

//delete user by id
router.delete("/deleteUserById/:id", auth, UserProfileController.deleteUser);

//get all user for admin
router.get("/get-all-user", auth, UserProfileController.getAllUser);

module.exports = router;
