// import vision from "@google-cloud/vision";
const vision = require("@google-cloud/vision");
// Creates a client
const client = new vision.ImageAnnotatorClient({
  keyFilename: "./config/clothing.json",
});

async function detectClothingLabels(imagePath) {
  const [result] = await client.labelDetection(imagePath);
  const labels = result.labelAnnotations;

  console.log("Clothing Labels:");
  labels?.forEach((label) => {
    if (
      label.description?.match(
        /shirt|dress|jacket|jeans|skirt|clothing|fashion/i
      )
    ) {
      console.log(`${label.description} `);
    }
  });
}

module.exports = { detectClothingLabels };
