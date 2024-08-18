const userModel = require("../../model/UserModel");
const nodemailer = require("nodemailer");
const Token = require("../../model/PasswordRestTokenModel");
const crypto = require("crypto");

const sendEmail = async (email, subject, text) => {
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: "suryaprakashmessi99@gmail.com",
        pass: "uagqkczjdvznzahk",
      },
    });

    await transporter.sendMail({
      from: "suryaprakashmessi99@gmail.com",
      to: email,
      subject: subject,
      html: `<a href="${text}">Reset your password.valid for 15 mins</a>`,
    });

    console.log("Email sent successfully");
  } catch (error) {
    console.log(error, "Email not sent");
  }
};

const forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await userModel.findOne({ email });
    if (!user) {
      return res
        .status(404)
        .json({ error: "User with given email doesn't exist" });
    }
    const now = new Date();
    const expirationTime = new Date(now.getTime() + 15 * 60 * 1000);
    let token = await Token.findOne({ userId: user._id });
    if (!token) {
      token = await new Token({
        userId: user._id,
        token: crypto.randomBytes(32).toString("hex"),
        expires: expirationTime,
      }).save();
    }

    // Corrected URL for the password reset link

    // const link = `https://www.eherbals.in/password-reset/${user._id}/${token.token}`;
    const link = `https://www.eherbals.in/password-reset/${user._id}/${token.token}`;

    await sendEmail(user.email, "Password Reset", link);

    res.status(200).send({
      message: "Password reset link sent to your email account",
      userId: user._id,
      token: token.token,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  forgotPassword,
};
