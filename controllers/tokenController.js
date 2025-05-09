const response = require("../helpers/response");
const UserModel = require("../models/userModels");

const getUserToken = async (req, res) => {
  try {
    const userId = req.user.userId;
    const user = await UserModel.findById(userId);
    res.send(
      response.success(200, "Token fetched successfully", { token: user.token })
    );
  } catch (error) {
    res.send(response.error(500, "Internal Server Error", error.message));
  }
};

module.exports = { getUserToken };
