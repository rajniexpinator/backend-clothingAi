const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fieldSize: 15 * 1024 * 1024, // 10MB for base64 strings
  },
});
module.exports = upload;
