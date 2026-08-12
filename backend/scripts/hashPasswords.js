/**
 * One-time script: hash any plain-text passwords in the `users` table.
 *
 * Usage:  node scripts/hashPasswords.js
 *
 * A bcrypt hash always starts with "$2b$" (or "$2a$").  This script skips
 * rows that are already hashed and only updates plain-text values.
 */

require("dotenv").config();
const bcrypt = require("bcrypt");
const db = require("../db");

(async () => {
  try {
    const [users] = await db.query("SELECT id, email, password FROM users");
    console.log(`Found ${users.length} user(s) in the users table.\n`);

    let updated = 0;

    for (const user of users) {
      // Already hashed — skip
      if (
        user.password.startsWith("$2b$") ||
        user.password.startsWith("$2a$")
      ) {
        console.log(`  [skip] ${user.email} — already hashed.`);
        continue;
      }

      const hashed = await bcrypt.hash(user.password, 10);
      await db.query("UPDATE users SET password = ? WHERE id = ?", [
        hashed,
        user.id,
      ]);
      console.log(`  [done] ${user.email} — password hashed and saved.`);
      updated++;
    }

    console.log(`\nDone. Updated ${updated} password(s).`);
    process.exit(0);
  } catch (err) {
    console.error("Error:", err.message);
    process.exit(1);
  }
})();
