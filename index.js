require("dotenv").config();
const express = require("express");
const cors = require("cors");
require("./config/dbConfig.js");
const path = require("path");

const app = express();
app.use(express.json());
const bodyParser = require("body-parser");
const port = process.env.PORT || 5050;

app.use("/uploads", express.static(path.join(__dirname, "uploads")));
// app.use((req, res, next) => {
//   let size = 0;
//   req.on("data", (chunk) => (size += chunk.length));
//   req.on("end", () => {
//     console.log(`Request size: ${size / (1024 * 1024)} MB`);
//     next();
//   });
// });

app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));

app.use(cors({ origin: "*" }));

app.get("/", (req, res) => {
  res.send("Hello, World!");
});

app.use("/api/v1", require("./routes/index"));

// Start the server

app.listen(port, "0.0.0.0", () => {
  console.log(`Server running on port ${port}`);
});

module.exports = app;
