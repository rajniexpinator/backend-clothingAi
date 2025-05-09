const response = require("../../helpers/response");
const UserModel = require("../../models/userModels");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const moment = require("moment");
const nodemailer = require("nodemailer");
const smtpTransport = require("nodemailer-smtp-transport");
const {
  uploadToS3Bucket,
  uploadBase64ToS3Bucket,
} = require("../../config/S3ImageUpload");
const Wardrobe = require("../../models/wardrobeModal");
const SavedSuit = require("../../models/savedSuitModel");
const transporter = nodemailer.createTransport(
  smtpTransport({
    service: "gmail",
    auth: {
      user: process.env.NODEMAILER_EMAIL,
      pass: process.env.NODEMAILER_PASSWORD, // Make sure this is an app password, not your actual Gmail password
    },
    tls: {
      rejectUnauthorized: false, // 👈 This bypasses the cert validation
    },
  })
);

async function UsersignUp(req, res) {
  const { password, email, ...rest } = req.body;
  const saltRounds = 10;

  if (!password || !email) {
    return res
      .status(400)
      .send(response.error(400, "Password and email are required.", {}));
  }

  try {
    const otp = crypto.randomInt(1000, 9999); // Generate 4-digit OTP
    const otpExpiry = moment().add(5, "minutes").toDate(); // Set OTP expiration time
    const existingUser = await UserModel.findOne({ email });

    if (existingUser && existingUser.isVerified) {
      return res.status(401).send(
        response.error(401, "User already verified. Please login.", {
          email,
          isVerified: true,
        })
      );
    }
    if (existingUser && !existingUser.isVerified) {
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
      existingUser.otp = otp;
      existingUser.otpExpiry = otpExpiry;
      await existingUser.save();
      return res
        .status(403)
        .send(
          response.error(
            403,
            "OTP sent to email. Please verify your account.",
            { email, isVerified: false, otpExpiry }
          )
        );
    }

    const hash = bcrypt.hashSync(password, saltRounds);

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
      return res
        .status(400)
        .send(response.error(400, "Validation failed.", error));
    }
    res.status(500).send(response.error(500, error.message, error));
  }
}

async function verifyOtp(req, res) {
  const { email, otp } = req.body;

  try {
    const user = await UserModel.findOne({ email });
    if (!user) {
      return res.status(400).send(response.error(400, "User not found.", {}));
    }

    if (user.isVerified) {
      return res
        .status(400)
        .send(response.error(400, "User already verified.", {}));
    }
    console.log(user.otp, otp);

    if (user.otp !== +otp || moment().isAfter(user.otpExpiry)) {
      return res
        .status(400)
        .send(response.error(400, "Invalid or expired OTP.", {}));
    }

    user.isVerified = true;
    user.otp = null;
    user.otpExpiry = null;
    await user.save();

    res.send(response.success(200, "User verified successfully.", {}));
  } catch (error) {
    res.status(500).send(response.error(500, error.message, error));
  }
}
async function imageUpdate(req, res) {
  try {
    let keys = {};
    const userId = req.user.userId;
    console.log(req.body);
    if (!req.body.image) {
      return res.status(400).send(response.error(400, "No file uploaded"));
    }

    if (req.params.type === "fittingroom") {
      const img = await uploadBase64ToS3Bucket(req.body.image);
      keys.fittingRoomModel = img.url;
      const wardrobe = new Wardrobe({
        image: img.url,
        userId: userId,
      });
      await wardrobe.save();
    } else if (req.params.type === "homemodel") {
      const img = await uploadBase64ToS3Bucket(req.body.image);
      keys.homeModel = img.url;
    } else if (req.params.type === "profile") {
      const img = await uploadBase64ToS3Bucket(req.body.image);
      keys.profilePicture = img.url;
    } else if (req.params.type === "wardrobe") {
      const img = await uploadBase64ToS3Bucket(req.body.image);
      const wardrobe = new Wardrobe({
        image: img.url,
        userId: userId,
      });
      await wardrobe.save();
    } else if (req.params.type === "savedsuits") {
      const img = await uploadBase64ToS3Bucket(req.body.image);
      const savedsuits = new SavedSuit({
        image: img.url,
        userId: userId,
      });
      await savedsuits.save();
    } else {
      return res.status(400).send(response.error(400, "Invalid model type"));
    }
    console.log(keys);

    const updatedUser = await UserModel.findByIdAndUpdate(
      req.user.userId,
      { $set: keys },
      { new: true, upsert: true }
    );

    if (!updatedUser) {
      return res.status(404).send(response.error(404, "User not found"));
    }

    return res
      .status(200)
      .send(response.success(200, "User updated successfully", updatedUser));
  } catch (err) {
    console.error("Error in imageUpdate:", err);
    return res.status(500).send(response.error(500, "Internal server error"));
  }
}

async function updateUser(req, res) {
  try {
    const userId = req.user.userId;
    const { gender, region, birthday, name } = req.body;

    if (!gender || !region || !birthday) {
      return res
        .status(400)
        .send(
          response.error(
            400,
            "All fields (Gender, Region, Birthday) are required"
          )
        );
    }
    const user = await UserModel.findByIdAndUpdate(
      userId,
      {
        gender,
        region,
        name,
        birthday,
      },
      { new: true }
    );
    if (!user) {
      return res.status(404).send(response.error(404, "User not found"));
    }
    return res
      .status(200)
      .send(response.success(200, "User updated successfully", user));
  } catch (error) {
    console.error("Error updating user:", error);
    return res
      .status(500)
      .send(response.error(500, "Internal server error", error.message));
  }
}

async function getUser(req, res) {
  try {
    const userId = req.user.userId;
    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).send(response.error(404, "User not found"));
    }
    return res
      .status(200)
      .send(response.success(200, "User fetched successfully", user));
  } catch (error) {
    console.error("Error fetching user:", error);
    return res
      .status(500)
      .send(response.error(500, "Internal server error", error.message));
  }
}

async function resendOtp(req, res) {
  const { email } = req.body;

  if (!email) {
    return res.status(400).send(response.error(400, "Email is required.", {}));
  }

  try {
    const user = await UserModel.findOne({ email });

    if (!user) {
      return res.status(404).send(response.error(404, "User not found.", {}));
    }

    const otp = crypto.randomInt(1000, 9999); // New OTP
    const otpExpiry = moment().add(5, "minutes").toDate();

    user.otp = otp;
    user.otpExpiry = otpExpiry;
    await user.save();

    const mailOptions = {
      from: "testexpinator@gmail.com",
      to: email,
      subject: "Resend OTP Code",
      text: `Your OTP code is ${otp}. It will expire in 5 minutes.`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Error sending email:", error);
      } else {
        console.log("Resend OTP email sent:", info.response);
      }
    });

    return res.send(
      response.success(200, "OTP resent to email.", {
        email,
        otpExpiry,
        isVerified: user.isVerified,
      })
    );
  } catch (error) {
    return res.status(500).send(response.error(500, error.message, error));
  }
}

async function forgotPassword(req, res) {
  const { email, newPassword, confirmPassword } = req.body;

  if (!email || !newPassword || !confirmPassword) {
    return res
      .status(400)
      .send(
        response.error(
          400,
          "Email, new password, and confirm password are required.",
          {}
        )
      );
  }

  if (newPassword !== confirmPassword) {
    return res
      .status(400)
      .send(response.error(400, "Passwords do not match.", {}));
  }

  try {
    const user = await UserModel.findOne({ email });

    if (!user) {
      return res
        .status(404)
        .send(response.error(404, "User not found with this email.", {}));
    }

    const hashedPassword = bcrypt.hashSync(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    return res.send(
      response.success(200, "Password updated successfully.", { email })
    );
  } catch (error) {
    console.error("Forgot Password Error:", error);
    return res
      .status(500)
      .send(response.error(500, "Internal server error.", error));
  }
}
module.exports = {
  UsersignUp,
  verifyOtp,
  updateUser,
  resendOtp,
  imageUpdate,
  getUser,
  forgotPassword,
};
