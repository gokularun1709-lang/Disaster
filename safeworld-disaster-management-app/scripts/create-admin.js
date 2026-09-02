// Usage: node scripts/create-admin.js "Admin Name" admin@example.com yourpassword
const path = require("path");
const bcrypt = require("bcryptjs");
const { nanoid } = require("nanoid");
const { readCollection, writeCollection } = require("../db");

async function main() {
  const [name, email, password] = process.argv.slice(2);
  if (!name || !email || !password) {
    console.log("Usage: node scripts/create-admin.js \"Admin Name\" admin@example.com yourpassword");
    process.exit(1);
  }
  if (password.length < 6) {
    console.log("Password must be at least 6 characters.");
    process.exit(1);
  }

  const users = readCollection("users");
  if (users.find((u) => u.email.toLowerCase() === email.toLowerCase())) {
    console.log("A user with that email already exists.");
    process.exit(1);
  }

  const passwordHash = await bcrypt.hash(password, 10);
  users.push({
    id: nanoid(10),
    name,
    email,
    passwordHash,
    role: "admin",
    createdAt: new Date().toISOString(),
  });
  writeCollection("users", users);
  console.log(`Admin account created for ${email}. You can now sign in from the app.`);
}

main();
