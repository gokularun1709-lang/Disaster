const express = require("express");
const { nanoid } = require("nanoid");
const { readCollection, writeCollection } = require("../db");
const { requireAuth, requireVolunteerOrAdmin } = require("../middleware/auth");

const router = express.Router();

router.get("/", (req, res) => {
  res.json({ shelters: readCollection("shelters") });
});

router.post("/", requireAuth, requireVolunteerOrAdmin, (req, res) => {
  const { name, type, address, lat, lng, capacity, status } = req.body || {};
  if (!name || !type || !address || lat === undefined || lng === undefined) {
    return res.status(400).json({ error: "Name, type, address, lat and lng are required." });
  }
  const shelters = readCollection("shelters");
  const shelter = {
    id: nanoid(10),
    name,
    type,
    address,
    lat: Number(lat),
    lng: Number(lng),
    capacity: capacity ? Number(capacity) : 0,
    status: status || "Open",
  };
  shelters.push(shelter);
  writeCollection("shelters", shelters);
  res.status(201).json({ shelter });
});

router.patch("/:id/status", requireAuth, requireVolunteerOrAdmin, (req, res) => {
  const { status } = req.body || {};
  const allowed = ["Open", "Standby", "Full", "Closed"];
  if (!allowed.includes(status)) {
    return res.status(400).json({ error: `Status must be one of ${allowed.join(", ")}.` });
  }
  const shelters = readCollection("shelters");
  const shelter = shelters.find((s) => s.id === req.params.id);
  if (!shelter) return res.status(404).json({ error: "Shelter not found." });
  shelter.status = status;
  writeCollection("shelters", shelters);
  res.json({ shelter });
});

module.exports = router;
