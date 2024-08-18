const jwt = require("jsonwebtoken");
const userModel = require("../../model/UserModel");
// const adminModel = require('../../model/AdminModel');

const { secretKey } = require("../../config/AccessKeys");

const auth = async (req, res, next) => {
  try {
    let token = req.headers.authorization?.split(" ")[1] || req.cookies.token;

    if (!token) {
      return res.status(401).json({ message: "No access token provided" });
    }

    jwt.verify(token, secretKey, async (err, decoded) => {
      if (err) {
        console.error("Token verification error:", err);
        return res.status(401).json({ message: "Invalid access token" });
      }

      try {
        let user;
        if (decoded.role === "admin") {
          user = await adminModel
            .findOne({ email: decoded.email })
            .select("-password");
        } else {
          user = await userModel
            .findOne({ email: decoded.email })
            .select("-password");
        }

        if (!user) {
          return res.status(401).json({ message: "User not found" });
        }

        req.user = user;
        next();
      } catch (error) {
        console.error("Error fetching user:", error);
        return res.status(500).json({ message: "Internal Server Error" });
      }
    });
  } catch (error) {
    console.error("Error in auth middleware:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = { auth };
