require("dotenv").config();

const app = require("./app");
const { initializeApplicationData } = require("./config/bootstrap");

const PORT = Number(process.env.PORT || 4100);

async function start() {
  try {
    await initializeApplicationData();

    app.listen(PORT, () => {
      console.log(`samples server listening on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Server startup failed:", error.message);
    process.exit(1);
  }
}

start();
