const { ClarifaiStub, grpc } = require("clarifai-nodejs-grpc");

const stub = ClarifaiStub.grpc();

const metadata = new grpc.Metadata();
metadata.set("authorization", "Key b7299116dc064ca39094c46fc76916a4"); // Replace with your real PAT

stub.PostModelOutputs(
  {
    user_app_id: {
      user_id: "clarifai",
      app_id: "main",
    },
    model_id: "apparel-detection", // Clothing classification model
    inputs: [
      {
        data: {
          image: {
            url: "https://s3.amazonaws.com/samples.clarifai.com/people_walking2.jpeg",
          },
        },
      },
    ],
  },
  metadata,
  (err, response) => {
    if (err) {
      console.error("Error:", err);
      return;
    }

    if (response.status.code !== 10000) {
      console.error("Clarifai failed:", response.status.description);
      return;
    }

    const regions = response.outputs[0].data.regions;
    let tags = [];

    console.log("Detected clothing items:");
    regions.forEach((region, idx) => {
      const concepts = region.data.concepts;
      concepts.forEach((concept) => {
        console.log(
          `- [${idx}] ${concept.name} (${(concept.value * 100).toFixed(2)}%)`
        );
        if ((concept.value * 100).toFixed(2) > 70) {
          tags.push(concept.name);
        }
      });
    });
    console.log(tags);
  }
);
