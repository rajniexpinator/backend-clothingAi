const response = require("../helpers/response");
const UserModel = require("../models/userModels");


const checkAndDeductToken = async (req, res, next) => {
    try {
        const userId = req?.user?.userId; // Assume user is authenticated

        const user = await UserModel.findById(userId);

      
        if (!user) {
            return res.status(404).send(response.error(404, "User not found", "No user exists with this ID"));
        }

        if (user.token <= 0) {
            return res.status(403).send(response.error(403, "Insufficient Tokens", "Please purchase more tokens to continue."));
        }
        if (!user.token) {
            return res.status(403).send(response.error(403, "Token system is not enabled for this account", "Please contact to customer support."));
        }

        // Deduct 1 coin atomically
        await UserModel.findByIdAndUpdate(userId, { $inc: { token: -1 } });

        // Call next() to pass control to the next middleware or route handler
        next();
    } catch (error) {
        console.error("Token Deduction Error:", error);
        return res.status(500).send(response.error(500, "Internal server error", error.message));
    }
};

module.exports = checkAndDeductToken;
