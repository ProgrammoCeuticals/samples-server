const app = require("../src/app");
const { initializeApplicationData } = require("../src/config/bootstrap");

module.exports = async (req, res) => {
  try {
    await initializeApplicationData();
    return app(req, res);
  } catch (error) {
    console.error("Server startup failed:", error.message);
    return res.status(500).json({ error: "Server startup failed" });
  }
};
