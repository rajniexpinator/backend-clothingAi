require("dotenv").config();
const express = require("express");
const cors = require("cors");
require("./config/dbConfig.js");
const app = express();
app.use(express.json());

const port = process.env.PORT || 5050;

app.use(cors({ origin: "*" }));

app.get("/", (req, res) => {
  res.send("Hello, World!");
});

app.use("/api/v1", require("./routes/index"));

// Start the server
app.listen(port, () => {
  console.log(`Success :- Server is running on http://localhost:${port}`);
});

module.exports = app;
