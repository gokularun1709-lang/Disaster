const express = require("express");
const { nanoid } = require("nanoid");
const { readCollection, writeCollection } = require("../db");
const { requireAuth, requireVolunteerOrAdmin, attachUserIfPresent } = require("../middleware/auth");

const router = express.Router();

router.get("/", requireAuth, requireVolunteerOrAdmin, (req, res) => {
  const reports = readCollection("reports").sort(
    (a, b) => new Date(b.submittedAt) - new Date(a.submittedAt)
  );
  res.json({ reports });
});

// Anyone (signed in or not) can file an incident report — emergencies don't wait for login.
router.post("/", attachUserIfPresent, (req, res) => {
  const { type, description, location, severity, contactNumber, reporterName } = req.body || {};
  if (!type || !description || !location) {
    return res.status(400).json({ error: "Incident type, description and location are required." });
  }

  const reports = readCollection("reports");
  const report = {
    id: nanoid(10),
    type,
    description,
    location,
    severity: severity || "Unknown",
    contactNumber: contactNumber || null,
    reporterName: reporterName || (req.user ? req.user.name : "Anonymous"),
    reporterId: req.user ? req.user.id : null,
    status: "New",
    submittedAt: new Date().toISOString(),
  };
  reports.unshift(report);
  writeCollection("reports", reports);
  res.status(201).json({ report });
});

router.patch("/:id/status", requireAuth, requireVolunteerOrAdmin, (req, res) => {
  const { status } = req.body || {};
  const allowed = ["New", "Verified", "In Progress", "Resolved"];
  if (!allowed.includes(status)) {
    return res.status(400).json({ error: `Status must be one of ${allowed.join(", ")}.` });
  }
  const reports = readCollection("reports");
  const report = reports.find((r) => r.id === req.params.id);
  if (!report) return res.status(404).json({ error: "Report not found." });
  report.status = status;
  writeCollection("reports", reports);
  res.json({ report });
});

module.exports = router;
