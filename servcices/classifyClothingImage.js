const { ClarifaiStub, grpc } = require("clarifai-nodejs-grpc");

const stub = ClarifaiStub.grpc();

const metadata = new grpc.Metadata();
metadata.set("authorization", `Key ${process.env.CLARIFAI_API_KEY}`);

function classifyClothingFromImage(imageUrl) {
  return new Promise((resolve, reject) => {
    stub.PostModelOutputs(
      {
        user_app_id: {
          user_id: "clarifai",
          app_id: "main",
        },
        model_id: "apparel-detection",
        inputs: [
          {
            data: {
              image: {
                url: imageUrl,
              },
            },
          },
        ],
      },
      metadata,
      (err, response) => {
        if (err) {
          return reject(`Clarifai API error: ${err.message}`);
        }

        if (response.status.code !== 10000) {
          return reject(
            `Clarifai request failed: ${response.status.description}`
          );
        }

        const regions = response.outputs[0].data.regions || [];
        const tagSet = new Set();

        regions.forEach((region) => {
          const concepts = region.data.concepts || [];
          concepts.forEach((concept) => {
            const confidence = concept.value * 100;
            if (confidence > 70) {
              tagSet.add(concept.name);
            }
          });
        });

        resolve(Array.from(tagSet));
      }
    );
  });
}

module.exports = { classifyClothingFromImage };
