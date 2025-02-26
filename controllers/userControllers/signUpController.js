const response = require("../../helpers/response");
const UserModel = require("../../models/userModels");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const moment = require("moment");
const nodemailer = require("nodemailer");
const smtpTransport = require("nodemailer-smtp-transport");

const transporter = nodemailer.createTransport(
  smtpTransport({
    service: "gmail",
    auth: {
      user: "testexpinator@gmail.com",
      pass: "sbhm xfpb wefn ccdl",
    },
  })
);

async function UsersignUp(req, res) {
  const { password, email, ...rest } = req.body;
  const saltRounds = 10;

  if (!password || !email) {
    return res.send(
      response.error(400, "Password and email are required.", {})
    );
  }

  try {
    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      return res.send(
        response.error(400, "User with this email already exists.", {})
      );
    }

    const hash = bcrypt.hashSync(password, saltRounds);
    const otp = crypto.randomInt(100000, 999999); // Generate 6-digit OTP
    const otpExpiry = moment().add(5, "minutes").toDate(); // Set OTP expiration time

    const user = new UserModel({
      password: hash,
      email,
      otp,
      otpExpiry,
      isVerified: false,
      ...rest,
    });
    await user.save();

    // Send OTP to user's email
    const mailOptions = {
      from: "testexpinator@gmail.com",
      to: email,
      subject: "Your OTP Code",
      text: `Your OTP code is ${otp}. It will expire in 5 minutes.`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Error sending email:", error);
      } else {
        console.log("Email sent:", info.response);
      }
    });

    res.send(
      response.success(200, "OTP sent to email. Please verify your account.", {
        email,
      })
    );
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.send(response.error(400, "Validation failed.", error));
    }
    res.send(response.error(500, error.message, error));
  }
}

async function verifyOtp(req, res) {
  const { email, otp } = req.body;

  try {
    const user = await UserModel.findOne({ email });
    if (!user) {
      return res.send(response.error(400, "User not found.", {}));
    }

    if (user.isVerified) {
      return res.send(response.error(400, "User already verified.", {}));
    }
    console.log(user.otp, otp);

    if (user.otp !== +otp || moment().isAfter(user.otpExpiry)) {
      return res.send(response.error(400, "Invalid or expired OTP.", {}));
    }

    user.isVerified = true;
    user.otp = null;
    user.otpExpiry = null;
    await user.save();

    res.send(response.success(200, "User verified successfully.", {}));
  } catch (error) {
    res.send(response.error(500, error.message, error));
  }
}

module.exports = { UsersignUp, verifyOtp };
