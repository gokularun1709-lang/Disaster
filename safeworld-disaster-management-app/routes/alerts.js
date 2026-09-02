const express = require("express");
const { nanoid } = require("nanoid");
const { readCollection, writeCollection } = require("../db");
const { requireAuth, requireVolunteerOrAdmin } = require("../middleware/auth");

const router = express.Router();

const SEVERITY_ORDER = { Red: 3, Orange: 2, Yellow: 1, Green: 0 };

router.get("/", (req, res) => {
  const alerts = readCollection("alerts").sort(
    (a, b) => (SEVERITY_ORDER[b.severity] || 0) - (SEVERITY_ORDER[a.severity] || 0)
  );
  res.json({ alerts });
});

router.post("/", requireAuth, requireVolunteerOrAdmin, (req, res) => {
  const { title, type, severity, region, description, expires } = req.body || {};
  if (!title || !type || !severity || !region || !description) {
    return res.status(400).json({ error: "Title, type, severity, region and description are required." });
  }
  if (!SEVERITY_ORDER.hasOwnProperty(severity)) {
    return res.status(400).json({ error: "Severity must be one of Green, Yellow, Orange, Red." });
  }

  const alerts = readCollection("alerts");
  const alert = {
    id: nanoid(10),
    title,
    type,
    severity,
    region,
    description,
    issued: new Date().toISOString(),
    expires: expires || null,
    active: true,
    createdBy: req.user.name,
  };
  alerts.unshift(alert);
  writeCollection("alerts", alerts);
  res.status(201).json({ alert });
});

router.patch("/:id/close", requireAuth, requireVolunteerOrAdmin, (req, res) => {
  const alerts = readCollection("alerts");
  const alert = alerts.find((a) => a.id === req.params.id);
  if (!alert) return res.status(404).json({ error: "Alert not found." });
  alert.active = false;
  writeCollection("alerts", alerts);
  res.json({ alert });
});

router.delete("/:id", requireAuth, requireVolunteerOrAdmin, (req, res) => {
  const alerts = readCollection("alerts");
  const next = alerts.filter((a) => a.id !== req.params.id);
  if (next.length === alerts.length) return res.status(404).json({ error: "Alert not found." });
  writeCollection("alerts", next);
  res.status(204).end();
});

module.exports = router;
