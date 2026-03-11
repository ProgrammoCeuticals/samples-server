const { connectDb } = require("./db");
const { seedTemplates } = require("./seedTemplates");

let initPromise = null;

function initializeApplicationData() {
  if (!initPromise) {
    initPromise = (async () => {
      await connectDb(process.env.MONGO_URI);
      await seedTemplates();
    })().catch((error) => {
      initPromise = null;
      throw error;
    });
  }

  return initPromise;
}

module.exports = {
  initializeApplicationData,
};
