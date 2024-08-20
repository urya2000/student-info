const userModel = require("../../model/UserModel");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { secretKey } = require("../../config/AccessKeys");

const Login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "user not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid password" });
    }

    const token = jwt.sign({ email: user.email, role: "user" }, secretKey, {
      expiresIn: "30d",
    });
    const userData = {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      gender: user.gender,
      address: user.address,
    };

    return res
      .status(200)
      .cookie("token", token, {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
      })
      .json({
        success: true,
        user: userData,
        token,
      });
  } catch (err) {
    res.status(500).json({ message: "server error" + err });
  }
};

//logout
const Logout = async (req, res) => {
  const { id } = req.params;

  try {
    const user = await userModel.findById(id);
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    const token = req.cookies.token;
    if (!token) {
      return res.status(400).json({ message: "Token not found" });
    }

    // Clear the cookie
    res.clearCookie("token", {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
    });

    return res.status(200).json({ message: "Logout successful" });
  } catch (error) {
    console.error("Error in logout:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = { Login, Logout };
