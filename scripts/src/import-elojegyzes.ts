import { createReadStream } from "fs";
import { createInterface } from "readline";
import { resolve } from "path";
import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

function parseSqlValue(val: string): string | null {
  if (val === "NULL") return null;
  if (val.startsWith("'") && val.endsWith("'")) {
    return val.slice(1, -1).replace(/''/g, "'");
  }
  return val;
}

function splitName(nev: string): { lastName: string; firstName: string } {
  const trimmed = nev.trim();
  const spaceIdx = trimmed.indexOf(" ");
  if (spaceIdx === -1) return { lastName: trimmed, firstName: "" };
  return {
    lastName: trimmed.slice(0, spaceIdx),
    firstName: trimmed.slice(spaceIdx + 1),
  };
}

function parseRow(line: string): string[] | null {
  // Strip leading ( and trailing ),
  const inner = line.trim().replace(/^\(/, "").replace(/[),]+$/, "");
  const values: string[] = [];
  let i = 0;
  while (i < inner.length) {
    if (inner[i] === " " || inner[i] === ",") { i++; continue; }
    if (inner[i] === "'") {
      // quoted string
      let j = i + 1;
      let s = "'";
      while (j < inner.length) {
        if (inner[j] === "'" && inner[j + 1] === "'") {
          s += "''"; j += 2;
        } else if (inner[j] === "'") {
          s += "'"; j++; break;
        } else {
          s += inner[j]; j++;
        }
      }
      values.push(s);
      i = j;
    } else {
      // unquoted (number or NULL)
      let j = i;
      while (j < inner.length && inner[j] !== ",") j++;
      values.push(inner.slice(i, j).trim());
      i = j;
    }
  }
  return values.length >= 26 ? values : null;
}

async function main() {
  const filePath = resolve(process.cwd(), "../attached_assets/_elojegyzes_(1)_1780490095385.sql");
  const rl = createInterface({ input: createReadStream(filePath), crlfDelay: Infinity });

  const BATCH = 500;
  let batch: object[] = [];
  let total = 0;
  let skipped = 0;

  const insertBatch = async (rows: object[]) => {
    if (rows.length === 0) return;
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      for (const row of rows as Record<string, unknown>[]) {
        await client.query(
          `INSERT INTO patients (
            admission_date, patient_type, is_day_surgery, last_name, first_name,
            birth_date, taj, phone, ward, diagnosis, surgery, anesthesia,
            laparoscope, halo, laterality, blood_type, notes, created_by,
            surgeon_name, assistant1, assistant2, assistant3,
            or_room, surgery_order, surgery_date, department, status
          ) VALUES (
            $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,
            $19,$20,$21,$22,$23,$24,$25,$26,'imported'
          )`,
          [
            row.admission_date, row.patient_type, row.is_day_surgery,
            row.last_name, row.first_name, row.birth_date, row.taj, row.phone,
            row.ward, row.diagnosis, row.surgery, row.anesthesia,
            row.laparoscope, row.halo, row.laterality, row.blood_type,
            row.notes, row.created_by, row.surgeon_name,
            row.assistant1, row.assistant2, row.assistant3,
            row.or_room, row.surgery_order, row.surgery_date, row.department,
          ]
        );
      }
      await client.query("COMMIT");
    } catch (e) {
      await client.query("ROLLBACK");
      throw e;
    } finally {
      client.release();
    }
  };

  for await (const line of rl) {
    const trimmed = line.trim();
    if (!trimmed.startsWith("(")) continue;
    if (!trimmed.includes("'Sebészet'")) continue;

    const values = parseRow(trimmed);
    if (!values) { skipped++; continue; }

    // Column order from CREATE TABLE:
    // edatum, fajta, egynapos, nev, szuldat, taj, elerhetoseg, korterem,
    // diag, mutet, anaesth, laparoscope, halo, oldalisag, vercsop, egyeb,
    // user, orvos, assz1, assz2, assz3, stamp, osztaly, muto, mut_sorrend, mut_dat
    const [
      edatum, fajta, egynapos, nev, szuldat, taj, elerhetoseg, korterem,
      diag, mutet, anaesth, laparoscope, halo, oldalisag, vercsop, egyeb,
      user_, orvos, assz1, assz2, assz3, _stamp, _osztaly, muto, mut_sorrend, mut_dat
    ] = values.map(parseSqlValue);

    const { lastName, firstName } = splitName(nev ?? "");

    batch.push({
      admission_date: edatum,
      patient_type: fajta,
      is_day_surgery: egynapos === "1" ? true : egynapos === "0" ? false : null,
      last_name: lastName || "–",
      first_name: firstName,
      birth_date: szuldat ?? "",
      taj: taj,
      phone: elerhetoseg,
      ward: korterem,
      diagnosis: diag,
      surgery: mutet,
      anesthesia: anaesth,
      laparoscope: laparoscope,
      halo: halo,
      laterality: oldalisag,
      blood_type: vercsop,
      notes: egyeb,
      created_by: user_,
      surgeon_name: orvos,
      assistant1: assz1,
      assistant2: assz2,
      assistant3: assz3,
      or_room: muto,
      surgery_order: mut_sorrend ? parseInt(mut_sorrend) : null,
      surgery_date: mut_dat,
      department: "Sebészet",
    });

    if (batch.length >= BATCH) {
      await insertBatch(batch);
      total += batch.length;
      process.stdout.write(`\rImportálva: ${total}`);
      batch = [];
    }
  }

  if (batch.length > 0) {
    await insertBatch(batch);
    total += batch.length;
  }

  console.log(`\nKész. Importált: ${total}, kihagyott: ${skipped}`);
  await pool.end();
}

main().catch(e => { console.error(e); process.exit(1); });
