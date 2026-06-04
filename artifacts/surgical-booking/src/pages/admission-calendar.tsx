import { useState, useMemo } from "react";
import { useGetAdmissionCalendar, useCreatePatient, getGetAdmissionCalendarQueryKey, useListSurgeons } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ChevronLeft, ChevronRight, UserPlus } from "lucide-react";
import { format, startOfWeek, addDays, addWeeks, subWeeks, isWeekend } from "date-fns";
import { hu } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";

function autoTextColor(hex: string): string {
  const c = hex.replace(/^#/, "").trim();
  let r: number, g: number, b: number;
  if (c.length === 3) {
    r = parseInt(c[0] + c[0], 16);
    g = parseInt(c[1] + c[1], 16);
    b = parseInt(c[2] + c[2], 16);
  } else {
    r = parseInt(c.slice(0, 2), 16);
    g = parseInt(c.slice(2, 4), 16);
    b = parseInt(c.slice(4, 6), 16);
  }
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.55 ? "#1a1a1a" : "#ffffff";
}

function slotGroup(slot: string): string {
  if (slot.startsWith("B"))   return "B";
  if (slot.startsWith("EP"))  return "EP";
  if (slot.startsWith("Tu"))  return "Tu";
  if (slot.startsWith("S"))   return "S";
  if (slot.startsWith("Amb")) return "Amb";
  return "other";
}

const GROUP_COLORS: Record<string, string> = {
  B:   "bg-slate-50   text-slate-700   border-slate-200  hover:bg-slate-100",
  EP:  "bg-orange-50  text-orange-700  border-orange-200 hover:bg-orange-100",
  Tu:  "bg-blue-50    text-blue-800    border-blue-200   hover:bg-blue-100",
  S:   "bg-rose-50    text-rose-700    border-rose-200   hover:bg-rose-100",
  Amb: "bg-teal-50    text-teal-700    border-teal-200   hover:bg-teal-100",
  other: "bg-muted text-muted-foreground border-border hover:bg-muted/80",
};

const GROUP_FILLED: Record<string, string> = {
  B:   "bg-slate-100  text-slate-800  border-slate-300",
  EP:  "bg-orange-100 text-orange-800 border-orange-300",
  Tu:  "bg-blue-100   text-blue-900   border-blue-300",
  S:   "bg-rose-100   text-rose-800   border-rose-300",
  Amb: "bg-teal-100   text-teal-800   border-teal-300",
  other: "bg-muted text-foreground border-border",
};

const GROUP_LABEL: Record<string, string> = {
  B:   "Beutaló",
  EP:  "EP",
  Tu:  "Tumoros",
  S:   "Sürgős",
  Amb: "Ambuláns",
};

const DAY_SLOTS: Record<number, string[]> = {
  1: ["B-Zu","B-2","B-3","B-NM","EP-1","Tu-1","Tu-2","Tu-3","Tu-4","S-1","S-2","Amb-1","Amb-2","Amb-3","Amb-4"],
  2: ["B-Zu","B-2","B-3","B-NM","EP-1","Tu-1","Tu-2","Tu-3","Tu-4","S-1","S-2","Amb-1","Amb-2","Amb-3","Amb-4"],
  3: ["B-Zu","B-2","B-3","B-NM","EP-1","EP-2","EP-3","Tu-1","Tu-2","S-1","S-2","Amb-1","Amb-2","Amb-3","Amb-4"],
  4: ["B-Zu","B-2","B-3","B-NM","EP-1","EP-2","EP-3","Tu-1","Tu-2","S-1","S-2","Amb-1","Amb-2","Amb-3","Amb-4"],
  5: ["B-Zu","B-2","B-3","B-NM","EP-1","EP-2","Tu-1","Tu-2","Tu-3","S-1","S-2","Amb-1","Amb-2","Amb-3","Amb-4"],
};

function slotsForDay(day: Date): string[] {
  return DAY_SLOTS[day.getDay()] ?? DAY_SLOTS[1];
}

const LATERALITY_OPTIONS = [
  { value: "D", label: "D — Jobb" },
  { value: "S", label: "S — Bal" },
  { value: "U", label: "U — Kétoldali" },
  { value: "N", label: "N — Nem vonatkozik" },
];

const BLOOD_TYPES = ["A+", "A-", "B+", "B-", "AB+", "AB-", "0+", "0-", "ismeretlen"];

type SlotClick = { date: string; slotName: string };

const EMPTY_FORM = {
  isDaySurgery: false,
  lastName: "",
  firstName: "",
  birthDate: "",
  taj: "",
  phone: "",
  ward: "",
  diagnosis: "",
  surgery: "",
  laparoscope: "" as "" | "igen" | "nem",
  halo: "" as "" | "igen" | "nem",
  laterality: "",
  bloodType: "",
  notes: "",
  surgeonId: "",
  assistant1Id: "",
  assistant2Id: "",
  assistant3Id: "",
};

type FormState = typeof EMPTY_FORM;

export default function AdmissionCalendar() {
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [slot, setSlot] = useState<SlotClick | null>(null);
  const [form, setForm] = useState<FormState>({ ...EMPTY_FORM });
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const from = format(weekStart, "yyyy-MM-dd");
  const to = format(addDays(weekStart, 6), "yyyy-MM-dd");

  const { data: patients, isLoading } = useGetAdmissionCalendar({ from, to });
  const { data: surgeons } = useListSurgeons();
  const createPatient = useCreatePatient();

  const activeSurgeons = useMemo(() => surgeons?.filter(s => s.isActive) ?? [], [surgeons]);

  const surgeonColorMap = useMemo(() => {
    const map = new Map<string, { bg: string; text: string }>();
    surgeons?.forEach(s => {
      if (!s.bgColor) return;
      const textFallback = s.textColor ?? autoTextColor(s.bgColor);
      const key = `Dr. ${s.lastName} ${s.firstName}`;
      map.set(key, { bg: s.bgColor, text: textFallback });
      map.set(`${s.lastName} ${s.firstName}`, { bg: s.bgColor, text: textFallback });
    });
    return map;
  }, [surgeons]);

  const weekdays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)).filter(d => !isWeekend(d));

  function patientForSlot(slotName: string, day: Date) {
    const dayStr = format(day, "yyyy-MM-dd");
    return patients?.find(p => p.patientType === slotName && p.admissionDate === dayStr) ?? null;
  }

  function openSlot(date: string, slotName: string) {
    setSlot({ date, slotName });
    setForm({ ...EMPTY_FORM });
  }

  function setF<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm(f => ({ ...f, [key]: value }));
  }

  function surgeonName(id: string): string {
    if (!id || id === "-") return "";
    const s = activeSurgeons.find(s => String(s.id) === id);
    return s ? `Dr. ${s.lastName} ${s.firstName}` : "";
  }

  function handleSubmit() {
    if (!slot || !form.lastName.trim() || !form.firstName.trim()) return;
    createPatient.mutate({
      data: {
        lastName: form.lastName.trim(),
        firstName: form.firstName.trim(),
        birthDate: form.birthDate || "—",
        taj: form.taj.trim() || undefined,
        phone: form.phone.trim() || undefined,
        ward: form.ward.trim() || undefined,
        diagnosis: form.diagnosis.trim() || undefined,
        surgery: form.surgery.trim() || undefined,
        laparoscope: form.laparoscope || undefined,
        halo: form.halo || undefined,
        laterality: form.laterality || undefined,
        bloodType: form.bloodType || undefined,
        notes: form.notes.trim() || undefined,
        isDaySurgery: form.isDaySurgery,
        surgeonName: surgeonName(form.surgeonId) || undefined,
        assistant1: surgeonName(form.assistant1Id) || undefined,
        assistant2: surgeonName(form.assistant2Id) || undefined,
        assistant3: surgeonName(form.assistant3Id) || undefined,
        patientType: slot.slotName,
        admissionDate: slot.date,
        status: "waiting",
      },
    }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetAdmissionCalendarQueryKey({ from, to }) });
        toast({ title: "Beteg sikeresen felvéve" });
        setSlot(null);
      },
      onError: () => {
        toast({ title: "Hiba a beteg rögzítésekor", variant: "destructive" });
      },
    });
  }

  const todayStr = format(new Date(), "yyyy-MM-dd");
  const canSubmit = !!form.lastName.trim() && !!form.firstName.trim() && !createPatient.isPending;

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <Button variant="outline" size="sm" onClick={() => setWeekStart(w => subWeeks(w, 1))}>
          <ChevronLeft className="w-4 h-4" />
        </Button>
        <span className="font-medium text-sm min-w-52 text-center">
          {format(weekStart, "yyyy. MMMM d.", { locale: hu })} – {format(addDays(weekStart, 4), "MMMM d.", { locale: hu })}
        </span>
        <Button variant="outline" size="sm" onClick={() => setWeekStart(w => addWeeks(w, 1))}>
          <ChevronRight className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="sm" onClick={() => setWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }))}>
          Ma
        </Button>
      </div>

      {isLoading ? (
        <Skeleton className="h-80 rounded-xl" />
      ) : (
        <div className="overflow-x-auto">
          <div className="min-w-[700px]">
            <div
              className="grid gap-px bg-border rounded-t-lg overflow-hidden"
              style={{ gridTemplateColumns: `repeat(${weekdays.length}, 1fr)` }}
            >
              {weekdays.map(day => {
                const dayStr = format(day, "yyyy-MM-dd");
                const isToday = dayStr === todayStr;
                return (
                  <div
                    key={dayStr}
                    className={`px-3 py-2 text-xs font-medium text-center ${isToday ? "bg-primary text-primary-foreground" : "bg-muted/50 text-muted-foreground"}`}
                  >
                    {format(day, "EEEE", { locale: hu })}
                    <br />
                    <span className="font-bold">{format(day, "MM. d.")}</span>
                  </div>
                );
              })}
            </div>

            <div className="flex gap-px bg-border">
              {weekdays.map(day => {
                const dayStr = format(day, "yyyy-MM-dd");
                const daySlots = slotsForDay(day);
                return (
                  <div key={dayStr} className="flex-1 flex flex-col gap-px bg-border">
                    {daySlots.map(slotName => {
                      const group = slotGroup(slotName);
                      const patient = patientForSlot(slotName, day);
                      return (
                        <div key={slotName} className="bg-card px-1 py-1 min-h-[60px]">
                          {patient ? (() => {
                            const colors = patient.surgeonName ? surgeonColorMap.get(patient.surgeonName) : undefined;
                            return colors ? (
                              <div
                                className="h-full rounded border px-2 py-1.5 text-xs leading-snug"
                                style={{ backgroundColor: colors.bg, color: colors.text, borderColor: colors.bg }}
                              >
                                <div className="text-[10px] font-bold mb-0.5" style={{ opacity: 0.7 }}>{slotName}</div>
                                <div className="font-semibold">{patient.lastName} {patient.firstName}</div>
                                {patient.diagnosis && <div className="text-[10px] truncate" style={{ opacity: 0.8 }}>{patient.diagnosis}</div>}
                                {patient.surgery && <div className="text-[10px] truncate" style={{ opacity: 0.8 }}>{patient.surgery}</div>}
                                {patient.surgeonName && <div className="text-[10px] truncate mt-0.5 italic" style={{ opacity: 0.75 }}>{patient.surgeonName}</div>}
                              </div>
                            ) : (
                              <div className={`h-full rounded border px-2 py-1.5 text-xs leading-snug ${GROUP_FILLED[group]}`}>
                                <div className="text-[10px] font-bold mb-0.5 opacity-60">{slotName}</div>
                                <div className="font-semibold">{patient.lastName} {patient.firstName}</div>
                                {patient.diagnosis && <div className="text-[10px] opacity-70 truncate">{patient.diagnosis}</div>}
                                {patient.surgery && <div className="text-[10px] opacity-70 truncate">{patient.surgery}</div>}
                                {patient.surgeonName && <div className="text-[10px] opacity-60 truncate mt-0.5 italic">{patient.surgeonName}</div>}
                              </div>
                            );
                          })() : (
                            <button
                              className={`w-full h-full rounded border border-dashed text-[11px] transition-colors flex flex-col items-center justify-center gap-0.5 ${GROUP_COLORS[group]}`}
                              onClick={() => openSlot(dayStr, slotName)}
                              title={`${slotName} — ${dayStr}`}
                            >
                              <span className="font-bold opacity-80">{slotName}</span>
                              <span className="opacity-50 text-[10px]">Felvesz</span>
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Jelmagyarázat */}
      <div className="flex flex-wrap gap-2 text-xs">
        {Object.entries(GROUP_LABEL).map(([code, label]) => (
          <div key={code} className={`rounded border px-2 py-1 ${GROUP_FILLED[code]}`}>
            <span className="font-bold">{code}</span> — {label}
          </div>
        ))}
      </div>

      {/* Beteg felvétele dialog */}
      <Dialog open={!!slot} onOpenChange={open => !open && setSlot(null)}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="w-4 h-4 text-primary" />
              Beteg felvétele
              {slot && (
                <span className={`text-xs font-normal rounded border px-2 py-0.5 ml-1 ${GROUP_FILLED[slotGroup(slot.slotName)]}`}>
                  {slot.slotName}
                </span>
              )}
              {slot && <span className="text-xs font-normal text-muted-foreground">{slot.date}</span>}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-1">

            {/* Aznapi műtét */}
            <div className="flex items-center gap-2">
              <Checkbox
                id="isDaySurgery"
                checked={form.isDaySurgery}
                onCheckedChange={v => setF("isDaySurgery", !!v)}
              />
              <Label htmlFor="isDaySurgery" className="cursor-pointer font-medium">Aznapi műtét</Label>
            </div>

            {/* Beteg neve */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Vezetéknév <span className="text-destructive">*</span></Label>
                <Input
                  placeholder="pl. Kiss"
                  value={form.lastName}
                  onChange={e => setF("lastName", e.target.value)}
                  autoFocus
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Keresztnév <span className="text-destructive">*</span></Label>
                <Input
                  placeholder="pl. János"
                  value={form.firstName}
                  onChange={e => setF("firstName", e.target.value)}
                />
              </div>
            </div>

            {/* Születési dátum, TAJ */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Születési dátum</Label>
                <Input
                  type="date"
                  value={form.birthDate}
                  onChange={e => setF("birthDate", e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">TAJ</Label>
                <Input
                  placeholder="000 000 000"
                  value={form.taj}
                  onChange={e => setF("taj", e.target.value)}
                />
              </div>
            </div>

            {/* Elérhetőség, Kórterem */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Elérhetőség</Label>
                <Input
                  placeholder="+36 30 123 4567"
                  value={form.phone}
                  onChange={e => setF("phone", e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Kórterem</Label>
                <Input
                  placeholder="pl. 201"
                  value={form.ward}
                  onChange={e => setF("ward", e.target.value)}
                />
              </div>
            </div>

            {/* Diagnózis */}
            <div className="space-y-1">
              <Label className="text-xs">Diagnózis</Label>
              <Input
                placeholder="pl. K35 — Appendicitis acuta"
                value={form.diagnosis}
                onChange={e => setF("diagnosis", e.target.value)}
              />
            </div>

            {/* Műtét megnevezése */}
            <div className="space-y-1">
              <Label className="text-xs">Műtét megnevezése</Label>
              <Input
                placeholder="pl. Appendectomia"
                value={form.surgery}
                onChange={e => setF("surgery", e.target.value)}
              />
            </div>

            {/* Laparoszkóp, Háló */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Laparoszkóp?</Label>
                <div className="flex gap-4 pt-1">
                  {(["igen", "nem"] as const).map(v => (
                    <label key={v} className="flex items-center gap-1.5 cursor-pointer text-sm">
                      <input
                        type="radio"
                        name="laparoscope"
                        value={v}
                        checked={form.laparoscope === v}
                        onChange={() => setF("laparoscope", v)}
                        className="accent-primary"
                      />
                      {v.charAt(0).toUpperCase() + v.slice(1)}
                    </label>
                  ))}
                  {form.laparoscope && (
                    <button type="button" className="text-xs text-muted-foreground underline" onClick={() => setF("laparoscope", "")}>töröl</button>
                  )}
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Háló?</Label>
                <div className="flex gap-4 pt-1">
                  {(["igen", "nem"] as const).map(v => (
                    <label key={v} className="flex items-center gap-1.5 cursor-pointer text-sm">
                      <input
                        type="radio"
                        name="halo"
                        value={v}
                        checked={form.halo === v}
                        onChange={() => setF("halo", v)}
                        className="accent-primary"
                      />
                      {v.charAt(0).toUpperCase() + v.slice(1)}
                    </label>
                  ))}
                  {form.halo && (
                    <button type="button" className="text-xs text-muted-foreground underline" onClick={() => setF("halo", "")}>töröl</button>
                  )}
                </div>
              </div>
            </div>

            {/* Oldaliság, Vércsoport */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Oldaliság</Label>
                <div className="flex flex-wrap gap-3 pt-1">
                  {LATERALITY_OPTIONS.map(opt => (
                    <label key={opt.value} className="flex items-center gap-1.5 cursor-pointer text-sm" title={opt.label}>
                      <input
                        type="radio"
                        name="laterality"
                        value={opt.value}
                        checked={form.laterality === opt.value}
                        onChange={() => setF("laterality", opt.value)}
                        className="accent-primary"
                      />
                      {opt.value}
                    </label>
                  ))}
                  {form.laterality && (
                    <button type="button" className="text-xs text-muted-foreground underline" onClick={() => setF("laterality", "")}>töröl</button>
                  )}
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Vércsoport</Label>
                <Select value={form.bloodType} onValueChange={v => setF("bloodType", v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Válasszon..." />
                  </SelectTrigger>
                  <SelectContent>
                    {BLOOD_TYPES.map(bt => (
                      <SelectItem key={bt} value={bt}>{bt}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Egyéb info */}
            <div className="space-y-1">
              <Label className="text-xs">Egyéb info</Label>
              <Textarea
                placeholder="Különleges körülmények, megjegyzések..."
                rows={2}
                value={form.notes}
                onChange={e => setF("notes", e.target.value)}
              />
            </div>

            <hr className="border-border" />

            {/* Műtő orvos */}
            <div className="space-y-1">
              <Label className="text-xs font-semibold">Műtő orvos</Label>
              <Select value={form.surgeonId} onValueChange={v => setF("surgeonId", v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Válasszon sebészt..." />
                </SelectTrigger>
                <SelectContent>
                  {activeSurgeons.map(s => (
                    <SelectItem key={s.id} value={String(s.id)}>Dr. {s.lastName} {s.firstName}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Asszisztensek */}
            {([
              ["assistant1Id", "Asszisztens 1."],
              ["assistant2Id", "Asszisztens 2."],
              ["assistant3Id", "Asszisztens 3."],
            ] as const).map(([key, label]) => (
              <div className="space-y-1" key={key}>
                <Label className="text-xs">{label}</Label>
                <Select value={form[key]} onValueChange={v => setF(key, v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="—" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="-">—</SelectItem>
                    {activeSurgeons.map(s => (
                      <SelectItem key={s.id} value={String(s.id)}>Dr. {s.lastName} {s.firstName}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ))}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setSlot(null)}>Mégse</Button>
            <Button onClick={handleSubmit} disabled={!canSubmit}>
              {createPatient.isPending ? "Mentés..." : "Beteg felvétele"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
