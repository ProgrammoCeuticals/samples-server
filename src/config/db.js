const mongoose = require("mongoose");

const DEFAULT_MONGO_URI = "mongodb://127.0.0.1:27017/samples_app";

async function connectDb(mongoUri) {
  const resolvedMongoUri = `${mongoUri || ""}`.trim() || DEFAULT_MONGO_URI;

  mongoose.set("strictQuery", true);
  await mongoose.connect(resolvedMongoUri);
}

module.exports = {
  connectDb,
};
