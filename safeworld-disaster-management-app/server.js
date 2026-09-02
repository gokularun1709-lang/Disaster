const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const path = require("path");

const authRoutes = require("./routes/auth");
const alertRoutes = require("./routes/alerts");
const reportRoutes = require("./routes/reports");
const contactRoutes = require("./routes/contacts");
const shelterRoutes = require("./routes/shelters");

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json({ limit: "1mb" }));
app.use(morgan("dev"));

app.use("/api/auth", authRoutes);
app.use("/api/alerts", alertRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/contacts", contactRoutes);
app.use("/api/shelters", shelterRoutes);

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", service: "SafeWorld Disaster Management API", time: new Date().toISOString() });
});

// Serve the static frontend
app.use(express.static(path.join(__dirname, "public")));

app.get("*", (req, res, next) => {
  if (req.path.startsWith("/api/")) return next();
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.use((req, res) => {
  res.status(404).json({ error: "Not found." });
});

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Something went wrong on the server." });
});

app.listen(PORT, () => {
  console.log(`\n  SafeWorld \u2014 Disaster Management & Preparedness`);
  console.log(`  Server running at http://localhost:${PORT}\n`);
});
