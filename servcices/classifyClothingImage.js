// clarifai-classifier.js

const { ClarifaiStub, grpc } = require("clarifai-nodejs-grpc");

// Your Personal Access Token from Clarifai
const PAT = "1b3cdfb2557540ed94bb3a4c462551d3";

// Clarifai App Info
const USER_ID = "clarifai";
const APP_ID = "main";
const MODEL_ID = "apparel-detection";
const MODEL_VERSION_ID = "1ed35c3d176f45d69d2aa7971e6ab9fe";

// Initialize gRPC stub and metadata
const stub = ClarifaiStub.grpc();
const metadata = new grpc.Metadata();
metadata.set("authorization", "Key " + PAT);

/**
 * Classify clothing image and return detected concepts with bounding boxes
 * @param {string} imageUrl - The public URL of the clothing image
 * @returns {Promise<Array<{concepts: Array<{name: string, confidence: number}>, boundingBox: {topRow: number, leftCol: number, bottomRow: number, rightCol: number}}>>}
 */
const classifyClothingImageWithBoundingBoxes = async (imageUrl) => {
  return new Promise((resolve, reject) => {
    stub.PostModelOutputs(
      {
        user_app_id: {
          user_id: USER_ID,
          app_id: APP_ID,
        },
        model_id: MODEL_ID,
        version_id: MODEL_VERSION_ID,
        inputs: [
          {
            data: {
              image: {
                url: imageUrl,
                allow_duplicate_url: true,
              },
            },
          },
        ],
      },
      metadata,
      (err, response) => {
        if (err) {
          return reject("Clarifai API error: " + err);
        }

        if (response.status.code !== 10000) {
          return reject("Clarifai API failed: " + response.status.description);
        }

        const results = response.outputs[0].data.regions.map((region) => {
          const boundingBox = region.region_info.bounding_box;
          const concepts = region.data.concepts.map((concept) => ({
            name: concept.name,
            confidence: parseFloat(concept.value.toFixed(4)),
          }));

          return {
            boundingBox: {
              topRow: parseFloat(boundingBox.top_row.toFixed(3)),
              leftCol: parseFloat(boundingBox.left_col.toFixed(3)),
              bottomRow: parseFloat(boundingBox.bottom_row.toFixed(3)),
              rightCol: parseFloat(boundingBox.right_col.toFixed(3)),
            },
            ...concepts,
          };
        });

        resolve(results);
      }
    );
  });
};

// Export the function to be used elsewhere
module.exports = classifyClothingImageWithBoundingBoxes;
