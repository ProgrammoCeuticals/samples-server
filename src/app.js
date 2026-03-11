const express = require("express");
const cors = require("cors");
const morgan = require("morgan");

const templateRoutes = require("./routes/templateRoutes");
const submissionRoutes = require("./routes/submissionRoutes");

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN ? process.env.CLIENT_ORIGIN.split(",") : "*",
    credentials: true,
  })
);
app.use(express.json({ limit: "1mb" }));
app.use(morgan("dev"));

app.get("/api/health", (req, res) => {
  res.json({ ok: true, service: "samples-server" });
});

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
