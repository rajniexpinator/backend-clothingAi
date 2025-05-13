const bcrypt = require("bcrypt");
const response = require("../../helpers/response");
const UserModel = require("../../models/userModels");
const jwt = require("jsonwebtoken");

const authenticateUser = async (req, res) => {
  try {
    console.log("hiii i am called");
    const { email, password } = req.body;
    if (!email || !password) {
      return res
        .status(400)
        .send(response.error(400, "Email and password are required"));
    }
    const user = await UserModel.findOne({ email });
    if (!user) {
      return res.status(401).send(response.error(401, "Invalid email"));
    }
    let compare = await bcrypt.compare(password, user.password);
    if (!compare) {
      return res.status(401).send(response.error(401, "Invalid password"));
    }
    if (!user.isVerified) {
      return res.status(401).send(response.error(401, "User is not verified"));
    }
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
          number: user.number,
          homeModel: user.homeModel,
          gender: user.gender,
          region: user.region,
          birthday: user.birthday,
        },
      })
    );
  } catch (error) {
    console.error("Error during authentication:", error);
    return res.status(500).send(response.error(500, error.message, error));
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
      response.status(500).error(500, "Internal server error", error.message)
    );
  }
};

const authenticateUseSocial = async (req, res) => {
  try {
    const { email, name, password } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email are required" });
    }

    let user = await UserModel.findOne({ email });

    if (!user) {
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);
      user = new UserModel({ ...req.body, password: hashedPassword });
      await user.save();
    }
    let secret = process.env.jwt_secret || "secret";
    // Generate JWT Token
    let token = await jwt.sign(
      {
        userId: user._id,
        username: user.name,
        email: user.email,
        role: user.role,
      },
      secret
    );

    res.send(
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
    console.error("Auth Error:", error);
    return res
      .status(500)
      .send(response.error(500, "Internal server error", error.message));
  }
};

module.exports = {
  authenticateUser,
  getAllUsers,
  authenticateUseSocial,
};
