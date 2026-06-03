import { Router, type IRouter } from "express";
import PDFDocument from "pdfkit";
import { eq, and, gte, lte } from "drizzle-orm";
import { db, surgeriesTable, patientsTable, operatingRoomsTable, surgeonsTable, dailyRostersTable } from "@workspace/db";

const router: IRouter = Router();

function calcAge(birthDate: string): number {
  const bd = new Date(birthDate);
  const today = new Date();
  let age = today.getFullYear() - bd.getFullYear();
  const m = today.getMonth() - bd.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < bd.getDate())) age--;
  return age;
}

function cleanName(name: string | null | undefined): string | null {
  if (!name || name.trim() === "-" || name.trim() === "") return null;
  return name.trim();
}

router.get("/daily-rosters/:date/pdf", async (req, res): Promise<void> => {
  const { date } = req.params;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    res.status(400).json({ error: "Invalid date format, use YYYY-MM-DD" });
    return;
  }

  const from = new Date(`${date}T00:00:00`);
  const to = new Date(`${date}T23:59:59`);

  const [surgeryRows, roster, rooms] = await Promise.all([
    db.select({
      surgery: surgeriesTable,
      patient: patientsTable,
      operatingRoom: operatingRoomsTable,
      surgeon: surgeonsTable,
    })
      .from(surgeriesTable)
      .leftJoin(patientsTable, eq(surgeriesTable.patientId, patientsTable.id))
      .leftJoin(operatingRoomsTable, eq(surgeriesTable.operatingRoomId, operatingRoomsTable.id))
      .leftJoin(surgeonsTable, eq(surgeriesTable.surgeonId, surgeonsTable.id))
      .where(and(gte(surgeriesTable.scheduledDate, from), lte(surgeriesTable.scheduledDate, to)))
      .orderBy(surgeriesTable.scheduledDate),
    db.select().from(dailyRostersTable).where(eq(dailyRostersTable.date, date)).then(r => r[0] ?? null),
    db.select().from(operatingRoomsTable).where(eq(operatingRoomsTable.isActive, true)),
  ]);

  // Group surgeries by operating room code
  const roomMap = new Map<string, { roomName: string; surgeries: typeof surgeryRows }>();
  for (const row of surgeryRows) {
    const code = row.operatingRoom?.code ?? "?";
    if (!roomMap.has(code)) roomMap.set(code, { roomName: row.operatingRoom?.name ?? code, surgeries: [] });
    roomMap.get(code)!.surgeries.push(row);
  }

  // Sort rooms by code (numeric first, then alpha)
  const sortedRooms = [...roomMap.entries()].sort(([a], [b]) => {
    const aNum = parseInt(a), bNum = parseInt(b);
    if (!isNaN(aNum) && !isNaN(bNum)) return aNum - bNum;
    if (!isNaN(aNum)) return -1;
    if (!isNaN(bNum)) return 1;
    return a.localeCompare(b);
  });

  // Format date header
  const dateObj = new Date(`${date}T12:00:00`);
  const dayNames = ["vasárnap", "hétfő", "kedd", "szerda", "csütörtök", "péntek", "szombat"];
  const months = ["jan.", "febr.", "márc.", "ápr.", "máj.", "jún.", "júl.", "aug.", "szept.", "okt.", "nov.", "dec."];
  const dateLabel = `${dateObj.getFullYear()}.${String(dateObj.getMonth() + 1).padStart(2, "0")}.${String(dateObj.getDate()).padStart(2, "0")} ${dayNames[dateObj.getDay()].charAt(0).toUpperCase() + dayNames[dateObj.getDay()].slice(1)}`;

  // Start time from roster
  const startTime = cleanName(roster?.surgeryStartTime) ?? "08:00";

  // Ügyelet line
  const ugyeletParts = [
    cleanName(roster?.surgeryResponsible1),
    cleanName(roster?.surgeryResponsible2),
    cleanName(roster?.acuteResponsible1),
    cleanName(roster?.acuteResponsible2),
  ].filter(Boolean);

  // Build PDF
  const doc = new PDFDocument({ size: "A4", margin: 50 });

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `inline; filename="muteti_${date}.pdf"`);
  doc.pipe(res);

  // Register font (built-in Helvetica supports Latin chars)
  const FONT_REGULAR = "Helvetica";
  const FONT_BOLD = "Helvetica-Bold";

  const pageW = doc.page.width;
  const margin = 50;
  const contentW = pageW - margin * 2;

  // Header
  doc.font(FONT_BOLD).fontSize(14)
    .text("Uzsoki Utcai Kórház", margin, 50, { width: contentW, align: "center" });
  doc.font(FONT_REGULAR).fontSize(12)
    .text("Műtéti program", { width: contentW, align: "center" });

  doc.moveDown(1.5);

  // Department + date
  doc.font(FONT_BOLD).fontSize(11).text("Sebészet");
  doc.font(FONT_REGULAR).fontSize(11).text(dateLabel);

  if (ugyeletParts.length > 0) {
    doc.text(`Ügyelet: ${ugyeletParts.join(", ")}`);
  }

  doc.moveDown(1);

  // Rooms & surgeries
  for (const [code, { surgeries }] of sortedRooms) {
    // Room header
    doc.moveDown(0.5);
    doc.font(FONT_BOLD).fontSize(12).text(`${code}`);
    doc.font(FONT_REGULAR).fontSize(10).text(`MŰTŐ ${startTime}`);
    doc.moveDown(0.3);

    for (const row of surgeries) {
      const p = row.patient;
      const s = row.surgeon;
      if (!p) continue;

      // (ward) Name Age
      const ward = cleanName(p.ward) ? `(${p.ward})` : "()";
      const age = p.birthDate ? `${calcAge(p.birthDate)} év` : "";
      const patientLine = `${ward} ${p.lastName} ${p.firstName}${age ? " " + age : ""}`;

      // Diagnosis
      const dgLine = p.diagnosis ? `Dg.:${p.diagnosis}` : "";

      // Operation + laterality
      const lat = cleanName(p.laterality);
      const opType = cleanName(row.surgery.surgeryType ?? p.surgery);
      let opLine = opType ? `Op:${opType}` : "";
      if (lat && lat !== "-") opLine += opLine ? `, Oldaliság: (${lat})` : `Oldaliság: (${lat})`;

      // Surgeons: main surgeon + assistants
      const surgeonParts: string[] = [];
      if (s) surgeonParts.push(`Dr. ${s.lastName} ${s.firstName}`);
      [p.assistant1, p.assistant2, p.assistant3].forEach(a => {
        const c = cleanName(a);
        if (c) surgeonParts.push(c);
      });

      // Print surgery block
      const leftX = margin + 10;
      const dgX = margin + contentW * 0.62;
      const startY = doc.y;

      // Check if near page bottom
      if (startY > doc.page.height - 150) {
        doc.addPage();
      }

      // Patient name + age (left) | Diagnosis (right)
      doc.font(FONT_REGULAR).fontSize(9);
      doc.text(patientLine, leftX, doc.y, { continued: false, width: contentW * 0.6 });

      // Re-position for diagnosis on same line
      const afterPatient = doc.y;
      if (dgLine) {
        doc.text(dgLine, dgX, startY, { width: contentW * 0.38 });
      }

      // Op line (indent more)
      const opY = Math.max(afterPatient, dgLine ? doc.y : afterPatient);
      if (opLine) {
        doc.text(opLine, leftX + 10, opY, { width: contentW - 10 });
      }

      // Surgeons
      if (surgeonParts.length > 0) {
        doc.font(FONT_REGULAR).fontSize(9).text(surgeonParts.join(", "), leftX + 10, doc.y, { width: contentW - 10 });
      }

      doc.moveDown(0.4);
    }
  }

  // Footer roster info
  doc.moveDown(1);

  const rosterLines: Array<[string, string]> = [];
  if (cleanName(roster?.surgeryResponsible1) || cleanName(roster?.surgeryResponsible2)) {
    const parts = [cleanName(roster?.surgeryResponsible1), cleanName(roster?.surgeryResponsible2)].filter(Boolean);
    rosterLines.push(["AZNM, oszt.konz.:", parts.join(", ")]);
  }
  if (cleanName(roster?.acuteResponsible1) || cleanName(roster?.acuteResponsible2)) {
    const parts = [cleanName(roster?.acuteResponsible1), cleanName(roster?.acuteResponsible2)].filter(Boolean);
    rosterLines.push(["Akut betegek:", parts.join(", ")]);
  }
  if (cleanName(roster?.ambulanceNotes)) {
    rosterLines.push(["Ambulancia:", roster!.ambulanceNotes!]);
  }
  if (cleanName(roster?.dayOff)) {
    rosterLines.push(["Szabadnap:", roster!.dayOff!]);
  }
  if (cleanName(roster?.absent)) {
    rosterLines.push(["Egyéb távollevők:", roster!.absent!]);
  }

  if (rosterLines.length > 0) {
    const labelW = 130;
    for (const [label, value] of rosterLines) {
      const y = doc.y;
      doc.font(FONT_BOLD).fontSize(9).text(label, margin, y, { width: labelW, continued: false });
      doc.font(FONT_REGULAR).fontSize(9).text(value, margin + labelW, y, { width: contentW - labelW });
    }
  }

  // Timestamp
  const now = new Date();
  const ts = `${now.getFullYear()}.${String(now.getMonth()+1).padStart(2,"0")}.${String(now.getDate()).padStart(2,"0")} ${String(now.getHours()).padStart(2,"0")}:${String(now.getMinutes()).padStart(2,"0")}`;
  doc.font(FONT_REGULAR).fontSize(8)
    .text(`Készült: ${ts}`, margin, doc.page.height - 60, { width: contentW, align: "right" });

  doc.end();
});

export default router;
