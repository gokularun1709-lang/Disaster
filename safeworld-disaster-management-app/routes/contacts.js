const express = require("express");
const { nanoid } = require("nanoid");
const { readCollection, writeCollection } = require("../db");
const { requireAuth, requireAdmin } = require("../middleware/auth");

const router = express.Router();

router.get("/", (req, res) => {
  res.json({ contacts: readCollection("contacts") });
});

router.post("/", requireAuth, requireAdmin, (req, res) => {
  const { name, number, category, notes } = req.body || {};
  if (!name || !number || !category) {
    return res.status(400).json({ error: "Name, number and category are required." });
  }
  const contacts = readCollection("contacts");
  const contact = { id: nanoid(10), name, number, category, notes: notes || "" };
  contacts.push(contact);
  writeCollection("contacts", contacts);
  res.status(201).json({ contact });
});

router.delete("/:id", requireAuth, requireAdmin, (req, res) => {
  const contacts = readCollection("contacts");
  const next = contacts.filter((c) => c.id !== req.params.id);
  if (next.length === contacts.length) return res.status(404).json({ error: "Contact not found." });
  writeCollection("contacts", next);
  res.status(204).end();
});

module.exports = router;
