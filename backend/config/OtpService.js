const nodemailer = require("nodemailer");
const crypto = require("crypto");

// In-memory store for OTPs and user data
const otpStore = new Map();
const userDataStore = new Map();

// Generate a random OTP
const generateOtp = () => {
  return crypto.randomInt(100000, 999999).toString();
};

// Configure nodemailer
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: "suryaprakashmessi99@gmail.com",
    pass: "uagqkczjdvznzahk",
  },
});

// Function to send OTP via email
const sendOtp = async (email, userData) => {
  try {
    const otp = generateOtp();

    // Store OTP and user data in memory with expiration time
    otpStore.set(email, { otp, expires: Date.now() + 15 * 60 * 1000 });

    console.log(`Stored OTP for ${email}: ${otp}`);
    console.log(`Current otpStore:`, Array.from(otpStore.entries()));

    userDataStore.set(email, userData);

    const mailOptions = {
      from: "suryaprakashmessi99@gmail.com",
      to: email,
      subject: "Your OTP Code",
      text: `Your OTP code is ${otp}. It is valid for 15 mins.`,
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error("Error sending OTP:", error);
    throw new Error("Error sending OTP. Please try again.");
  }
};

const verifyOtp = async (email, otp) => {
  try {
    // console.log(`Verifying OTP for email: ${email}`);
    // console.log(`Current otpStore:`, Array.from(otpStore.entries()));

    const otpData = otpStore.get(email);
    // console.log(`Retrieved OTP data for ${email}:`, otpData);

    if (!otpData) {
      //   throw new Error("");
      return res.status(400).send("OTP not found");
    }

    if (otpData.otp !== otp.toString()) {
      return res.status(400).send("Invalid OTP");
    }

    if (Date.now() > otpData.expires) {
      return res.status(400).send("OTP has expired");
    }

    // Retrieve user data and clear OTP and user data from store after successful verification
    const userData = userDataStore.get(email);
    otpStore.delete(email);
    userDataStore.delete(email);

    return userData;
  } catch (error) {
    console.error("Error verifying OTP:", error);
    return res.status(500).send("Error verifying OTP. Please try again.");
  }
};

module.exports = { sendOtp, verifyOtp };
