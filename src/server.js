require("dotenv").config();

const app = require("./app");
const { connectDb } = require("./config/db");
const { seedTemplates } = require("./config/seedTemplates");

const PORT = Number(process.env.PORT || 4100);

async function start() {
  try {
    await connectDb(process.env.MONGO_URI);
    await seedTemplates();

    app.listen(PORT, () => {
      console.log(`samples server listening on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Server startup failed:", error.message);
    process.exit(1);
  }
}

start();
