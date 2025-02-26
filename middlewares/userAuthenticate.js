const jwt = require("jsonwebtoken");
const response = require("../helpers/response");

async function userAuthenticate(req, res, next) {
  try {
    const token = req.headers["authorization"].split(" ")[1];
    if (!token) {
      res.status(401).json({ error: "No token provided" });
      return;
    }
    let secret = process.env.jwt_secret || "secret";
    var decoded = await jwt.verify(token, secret);

    if (decoded?.role === "user") {
      req.user = decoded;
      next();
    } else {
      res
        .status(401)
        .json(response.error(401, "Unauthorized Invalid user token"));
    }
  } catch (err) {
    res
      .status(401)
      .json(response.error(401, "Unauthorized Invalid user token"));
    return;
  }
}

module.exports = { userAuthenticate };
