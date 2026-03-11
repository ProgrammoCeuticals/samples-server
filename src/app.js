const express = require("express");
const cors = require("cors");
const morgan = require("morgan");

const adminRoutes = require("./routes/adminRoutes");
const templateRoutes = require("./routes/templateRoutes");
const submissionRoutes = require("./routes/submissionRoutes");
const { initializeApplicationData } = require("./config/bootstrap");

const app = express();

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json({ limit: "1mb" }));
app.use(morgan("dev"));

app.get("/", (req, res) => {
  res.json({
    ok: true,
    service: "samples-server",
    message: "Samples API is running",
    endpoints: {
      health: "/api/health",
      templates: "/api/templates",
      submissions: "/api/submissions",
      adminLogin: "/api/admin/login",
    },
  });
});

app.get("/api/health", (req, res) => {
  res.json({ ok: true, service: "samples-server" });
});

app.use("/api", async (req, res, next) => {
  if (req.path === "/health") {
    next();
    return;
  }

  try {
    await initializeApplicationData();
    next();
  } catch (error) {
    next(error);
  }
});

app.use("/api/admin", adminRoutes);
app.use("/api/templates", templateRoutes);
app.use("/api/submissions", submissionRoutes);

app.use((req, res) => {
  res.status(404).json({ error: "Not found" });
});

app.use((error, req, res, next) => {
  const statusCode = error.name === "CastError" ? 400 : error.statusCode || 500;
  const message = statusCode >= 500 ? "Internal server error" : error.message;

  if (statusCode >= 500) {
    console.error(error);
  }

  res.status(statusCode).json({ error: message });
});

module.exports = app;
