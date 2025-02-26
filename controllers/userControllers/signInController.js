const bcrypt = require("bcrypt");
const response = require("../../helpers/response");
const UserModel = require("../../models/userModels");
const jwt = require("jsonwebtoken");

const authenticateUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if email and password are provided
    if (!email || !password) {
      return res.send(response.error(400, "Email and password are required"));
    }

    // Find user by email
    const user = await UserModel.findOne({ email });

    console.log(user);

    if (!user.isVerified) {
      return res.send(response.error(401, "User is not verified"));
    }
    if (!user) {
      return res.send(response.error(401, "Invalid email"));
    }

    // Compare the entered password with the stored hashed password
    let compare = await bcrypt.compare(password, user.password);

    if (!compare) {
      return res.send(response.error(401, "Invalid password"));
    }

    // Generate JWT Token
    let secret = process.env.jwt_secret || "secret";

    let token = await jwt.sign(
      {
        userId: user._id,
        username: user.name,
        email: user.email,
        role: user.role,
      },
      secret
    );

    // Return success response
    return res.send(
      response.success(200, "Login Successfully", {
        login: true,
        token: token,
        userDetails: {
          userId: user._id,
          email: user.email,
          role: user.role,
          userName: `${user.name}`,
          isPremium: user.isPremium,
          profilePicture: user.profilePicture,
        },
      })
    );
  } catch (error) {
    console.error("Error during authentication:", error);
    return res.send(response.error(500, error.message, error));
  }
};

const getAllUsers = async (req, res) => {
  try {
    const users = await UserModel.find();

    if (!users || users.length === 0) {
      return res.send(response.error(404, "No users found"));
    }

    // Return success response with the list of users
    return res.send(
      response.success(200, "Users fetched successfully", {
        users,
      })
    );
  } catch (error) {
    console.error("Error fetching users:", error);
    return res.send(
      response.error(500, "Internal server error", error.message)
    );
  }
};

module.exports = {
  authenticateUser,
  getAllUsers,
};
