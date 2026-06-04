import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { Pool } from "pg";

const __dirname = dirname(fileURLToPath(import.meta.url));

async function main() {
  const filePath = resolve(__dirname, "../../attached_assets/users_(4)_1780570056081.sql");
  const content = readFileSync(filePath, "utf-8");

  // Parse INSERT rows: (uid, 'name', 'pass', ..., status, ...)
  // Fields order: uid, name, pass, mail, theme, signature, signature_format,
  //   created, access, login, status, timezone, ...
  const rowRegex = /\((\d+),\s*'((?:[^'\\]|\\.)*)',\s*'((?:[^'\\]|\\.)*)',\s*'(?:[^'\\]|\\.)*',\s*'(?:[^'\\]|\\.)*',\s*'(?:[^'\\]|\\.)*',\s*(?:'(?:[^'\\]|\\.)*'|NULL),\s*\d+,\s*\d+,\s*\d+,\s*(\d+),/g;

  const users: { username: string; hash: string; active: boolean }[] = [];
  let match: RegExpExecArray | null;

  while ((match = rowRegex.exec(content)) !== null) {
    const [, uid, name, pass, status] = match;
    if (uid === "0" || !name || !pass) continue; // skip anonymous
    users.push({ username: name, hash: pass, active: status === "1" });
  }

  const active = users.filter(u => u.active);
  console.log(`Parsed: ${users.length} user, ${active.length} aktív`);

  const pool = new Pool({ connectionString: process.env.DATABASE_URL });

  for (const u of active) {
    await pool.query(
      `INSERT INTO users (username, password_hash, is_active)
       VALUES ($1, $2, $3)
       ON CONFLICT (username) DO UPDATE SET
         password_hash = EXCLUDED.password_hash,
         is_active = EXCLUDED.is_active`,
      [u.username, u.hash, true]
    );
  }

  const result = await pool.query("SELECT COUNT(*) FROM users WHERE is_active = true");
  console.log(`Import kész! Aktív userek az adatbázisban: ${result.rows[0].count}`);

  await pool.end();
}

main().catch(err => { console.error(err); process.exit(1); });
