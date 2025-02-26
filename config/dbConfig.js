const mangoose = require("mongoose");

mangoose
  .connect(process.env.MongoDb_URI)
  .then(() => console.log("Success :- Connected to database Successfully"))
  .catch((err) => console.log("Error :- Not connected to database :-", err));
