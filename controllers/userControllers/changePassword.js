const bcrypt = require("bcrypt");
const response = require("../../helpers/response");
const UserModel = require("../../models/userModels");

const ChangePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword, confirmNewPassword } = req.body;
    const userId = req.user.userId;

    // Validate input fields
    if (!oldPassword || !newPassword || !confirmNewPassword) {
      return res.status(400).send(response.error(400, "All password fields are required"));
    }
    if (newPassword !== confirmNewPassword) {
      return res.status(400).send(response.error(400, "New password and confirm new password do not match"));
    }
    if (newPassword.length < 6) {
      return res.status(400).send(response.error(400, "New password must be at least 6 characters long"));
    }

    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).send(response.error(404, "User not found"));
    }
    const passwordMatch = await bcrypt.compare(oldPassword, user.password);
    if (!passwordMatch) {
      return res.status(401).send(response.error(401, "Invalid old password"));
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    user.password = hashedPassword;
    await user.save();

    return res.status(200).send(response.success(200, "Password changed successfully"));
  } catch (error) {
    console.error("Error changing password:", error);
    return res.status(500).send(response.error(500, "Internal server error", error.message));
  }
};

module.exports = {
  ChangePassword,
};