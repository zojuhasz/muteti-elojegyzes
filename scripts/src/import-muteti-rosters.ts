import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { Pool } from "pg";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DASH_VALUES = new Set(["-", "", "–", "—"]);

function clean(v: string): string | null {
  const t = v.trim();
  return DASH_VALUES.has(t) ? null : (t || null);
}

async function main() {
  const filePath = resolve(__dirname, "../../attached_assets/_muteti_1780498367661.sql");
  const content = readFileSync(filePath, "utf-8");

  // Each row: ('date', 'korlapfelelos', 'aznm1', 'aznm2', 'akut1', 'akut2', 'ambulancia', 'tavol', 'osztaly', 'kezdido')
  const rowRegex = /\('(\d{4}-\d{2}-\d{2})',\s*'((?:[^'\\]|\\.)*)',\s*'((?:[^'\\]|\\.)*)',\s*'((?:[^'\\]|\\.)*)',\s*'((?:[^'\\]|\\.)*)',\s*'((?:[^'\\]|\\.)*)',\s*'((?:[^'\\]|\\.)*)',\s*'((?:[^'\\]|\\.)*)',\s*'((?:[^'\\]|\\.)*)',\s*'((?:[^'\\]|\\.)*)'\)/g;

  // For duplicate dates, last Sebészet entry wins
  const byDate = new Map<string, {
    date: string;
    r1: string | null; r2: string | null;
    a1: string | null; a2: string | null;
    amb: string | null; absent: string | null;
    startTime: string | null;
  }>();

  let total = 0; let skipped = 0;
  let match: RegExpExecArray | null;

  while ((match = rowRegex.exec(content)) !== null) {
    const [, mutDat, , aznm1, aznm2, akut1, akut2, ambulancia, tavol, osztaly, kezdido] = match;
    total++;
    if (osztaly.trim() !== "Sebészet") { skipped++; continue; }
    byDate.set(mutDat, {
      date: mutDat,
      r1: clean(aznm1), r2: clean(aznm2),
      a1: clean(akut1), a2: clean(akut2),
      amb: clean(ambulancia),
      absent: clean(tavol),
      startTime: clean(kezdido) ?? "08:00",
    });
  }

  const rows = [...byDate.values()];
  console.log(`Parsed: ${total} total, ${skipped} skipped (nem Sebészet), ${rows.length} egyedi Sebészet dátum`);
  if (rows.length === 0) { console.log("Nincs importálandó adat."); return; }

  const pool = new Pool({ connectionString: process.env.DATABASE_URL });

  let imported = 0;
  for (const r of rows) {
    await pool.query(
      `INSERT INTO daily_rosters
         (date, surgery_responsible_1, surgery_responsible_2,
          acute_responsible_1, acute_responsible_2,
          ambulance_notes, absent, surgery_start_time, updated_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,NOW())
       ON CONFLICT (date) DO UPDATE SET
         surgery_responsible_1 = EXCLUDED.surgery_responsible_1,
         surgery_responsible_2 = EXCLUDED.surgery_responsible_2,
         acute_responsible_1   = EXCLUDED.acute_responsible_1,
         acute_responsible_2   = EXCLUDED.acute_responsible_2,
         ambulance_notes       = EXCLUDED.ambulance_notes,
         absent                = EXCLUDED.absent,
         surgery_start_time    = EXCLUDED.surgery_start_time,
         updated_at            = NOW()`,
      [r.date, r.r1, r.r2, r.a1, r.a2, r.amb, r.absent, r.startTime]
    );
    imported++;
    if (imported % 200 === 0) console.log(`  ${imported}/${rows.length}...`);
  }

  // Ellenőrzés: 2026 június
  const check = await pool.query(
    `SELECT date, surgery_responsible_1, acute_responsible_1
     FROM daily_rosters
     WHERE date >= '2026-06-01' AND date <= '2026-06-10'
     ORDER BY date`
  );
  console.log("\nJúnius 2026 ellenőrzés:");
  for (const row of check.rows) {
    console.log(`  ${String(row.date).slice(0, 10)}: AZNM=${row.surgery_responsible_1 ?? "-"}, Akut=${row.acute_responsible_1 ?? "-"}`);
  }

  await pool.end();
  console.log(`\nImport kész! ${imported} sor feldolgozva.`);
}

main().catch(err => { console.error(err); process.exit(1); });
