require("dotenv").config();
const express = require("express");
const cors = require("cors");
require("./config/dbConfig.js");
const path = require("path");
const Clarifai = require("clarifai");

const app = express();
app.use(express.json());
const bodyParser = require("body-parser");
const multer = require("multer");
const upload = require("./middlewares/uploadMiddleware.js");
const {
  uploadBase64ToS3Bucket,
  uploadToS3Bucket,
} = require("./config/S3ImageUpload.js");
const { default: axios } = require("axios");
const classifyClothingImage = require("./servcices/classifyClothingImage.js");
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

app.use(bodyParser.json({ limit: "550mb" }));
app.use(bodyParser.urlencoded({ limit: "505mb", extended: true }));

app.use(cors({ origin: "*" }));

app.get("/", (req, res) => {
  res.send("Hello, World!");
});

app.use("/api/v1", require("./routes/index"));

// Start the server

app.post("/upload", upload.single("file"), async (req, res) => {
  // console.log(req.file);

  if (!req.file) return res.status(400).json({ error: "No file uploaded" });
  let r = await uploadToS3Bucket(req.file);

  const url = `http://localhost:${5050}/uploads/${req.file.filename}`;
  res.json({ message: "Upload successful", url, r });
});
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.get("/search", async (req, res) => {
  const query = req.query.q;
  const page = parseInt(req.query.page) || 1;

  const { GOOGLE_API_KEY, GOOGLE_CSE_ID } = process.env;
  const resultsPerPage = 10;
  const startIndex = (page - 1) * resultsPerPage + 1;

  if (!query) {
    return res.status(400).json({ error: "Missing search query" });
  }

  try {
    const response = await axios.get(
      "https://www.googleapis.com/customsearch/v1",
      {
        params: {
          key: GOOGLE_API_KEY,
          cx: GOOGLE_CSE_ID,
          q: query,
          searchType: "image",
          start: startIndex,
          num: resultsPerPage,
        },
      }
    );

    const results =
      response.data.items?.map((item) => ({
        title: item.title,
        link: item.link || item.image.thumbnailLink,
        thumbnail: item.image.thumbnailLink,
        contextLink: item.image.contextLink,
      })) || [];
    console.log(results);

    res.json({
      query,
      page,
      resultsPerPage,
      results,
    });
  } catch (err) {
    console.error(err.response.data.error.errors);
    res.status(500).json({ error: "Something went wrong" });
  }
});

// const imageUrl =
//   "https://clothingaiimage.s3.eu-north-1.amazonaws.com/1747650084974_CjikY2gHPbcAAAAAB-u_Gg-0.png";
// const { detectClothingLabels } = require("./config/detectClothingLabels.js");
// detectClothingLabels(imageUrl);
// .then((results) => {
//   console.log("Clothing classification results:", results);
//   results.forEach(({ name, confidence }) => {
//     console.log(`${name}: ${Math.round(confidence * 100)}%`);
//   });
// })
// .catch((error) => {
//   console.error("Error:", error);
// });
app.listen(port, "0.0.0.0", () => {
  console.log(`Server running on port ${port}`);
});

module.exports = app;
