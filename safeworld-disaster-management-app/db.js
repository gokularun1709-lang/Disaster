// Lightweight file-backed JSON datastore.
// Avoids requiring an external database so the project runs with a single
// `npm install && npm start`, which matters for a college submission / demo.

const fs = require("fs");
const path = require("path");

const DATA_DIR = path.join(__dirname, "data");

function filePath(name) {
  return path.join(DATA_DIR, `${name}.json`);
}

function readCollection(name) {
  const file = filePath(name);
  if (!fs.existsSync(file)) return [];
  const raw = fs.readFileSync(file, "utf-8").trim();
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch (err) {
    console.error(`Failed to parse ${name}.json:`, err.message);
    return [];
  }
}

function writeCollection(name, data) {
  fs.writeFileSync(filePath(name), JSON.stringify(data, null, 2), "utf-8");
}

module.exports = { readCollection, writeCollection };
