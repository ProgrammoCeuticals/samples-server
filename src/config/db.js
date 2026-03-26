const mongoose = require("mongoose");

const DEFAULT_MONGO_URI =
  "mongodb+srv://programmoceuticals:%40ProgrammoCeuticals@cluster0.fnahhcq.mongodb.net/samples_app";
let connectPromise = null;

async function connectDb(mongoUri) {
  const resolvedMongoUri = `${mongoUri || ""}`.trim() || DEFAULT_MONGO_URI;

  if (mongoose.connection.readyState === 1) {
    return;
  }

  if (connectPromise) {
    await connectPromise;
    return;
  }

  mongoose.set("strictQuery", true);
  connectPromise = mongoose.connect(resolvedMongoUri);

  try {
    await connectPromise;
  } finally {
    connectPromise = null;
  }
}

module.exports = {
  connectDb,
};
