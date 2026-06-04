import { useState } from "react";
import {
  useGetCalendarSurgeries, useListOperatingRooms, useListSurgeons,
  useCreateSurgery, useCreatePatient, useDeleteSurgery,
  getGetCalendarSurgeriesQueryKey, getListPatientsQueryKey,
  useGetDailyRoster, useUpsertDailyRoster, getGetDailyRosterQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ChevronLeft, ChevronRight, Plus, Trash2, Calendar, Pencil, FileDown } from "lucide-react";
import { format, addDays, subDays } from "date-fns";
import { hu } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";

function autoTextColor(hex: string): string {
  const c = hex.replace(/^#/, "").trim();
  let r: number, g: number, b: number;
  if (c.length === 3) {
    r = parseInt(c[0] + c[0], 16);
    g = parseInt(c[1] + c[1], 16);
    b = parseInt(c[2] + c[2], 16);
  } else if (c.length === 6) {
    r = parseInt(c.slice(0, 2), 16);
    g = parseInt(c.slice(2, 4), 16);
    b = parseInt(c.slice(4, 6), 16);
  } else {
    return "#000000";
  }
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5 ? "#000000" : "#ffffff";
}

function assistants(p: { assistant1?: string | null; assistant2?: string | null; assistant3?: string | null } | undefined): string[] {
  if (!p) return [];
  return [p.assistant1, p.assistant2, p.assistant3]
    .filter((a): a is string => !!a && a.trim() !== "" && a.trim() !== "-");
}

function rosterVal(v: string | null | undefined) {
  return v?.trim() && v.trim() !== "-" ? v.trim() : null;
}

type AssignState = { date: string; roomId: number; roomName: string } | null;

const LATERALITY_OPTIONS = [
  { value: "D", label: "D — Jobb" },
  { value: "S", label: "S — Bal" },
  { value: "U", label: "U — Kétoldali" },
  { value: "N", label: "N — Nem vonatkozik" },
];

const BLOOD_TYPES = ["A+", "A-", "B+", "B-", "AB+", "AB-", "0+", "0-", "ismeretlen"];

const emptyForm = {
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
  isDaySurgery: false,
  surgeonId: "",
  assistant1Id: "",
  assistant2Id: "",
  assistant3Id: "",
  selTime: "08:00",
};

export default function SurgeryCalendar() {
  const [currentDay, setCurrentDay] = useState(() => new Date());
  const [assign, setAssign] = useState<AssignState>(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [rosterOpen, setRosterOpen] = useState(false);
  const [rosterForm, setRosterForm] = useState({
    surgeryResponsible1: "", surgeryResponsible2: "",
    acuteResponsible1: "", acuteResponsible2: "",
    ambulanceNotes: "", dayOff: "", absent: "", surgeryStartTime: "",
  });

  const queryClient = useQueryClient();
  const { toast } = useToast();

  const dayStr = format(currentDay, "yyyy-MM-dd");

  const { data: surgeries, isLoading } = useGetCalendarSurgeries({ from: dayStr, to: dayStr });
  const { data: rooms } = useListOperatingRooms();
  const { data: surgeons } = useListSurgeons();
  const { data: roster } = useGetDailyRoster(dayStr, { query: { queryKey: getGetDailyRosterQueryKey(dayStr), retry: false } });
  const createPatient = useCreatePatient();
  const createSurgery = useCreateSurgery();
  const deleteSurgery = useDeleteSurgery();
  const upsertRoster = useUpsertDailyRoster();

  const activeRooms = rooms?.filter(r => r.isActive) ?? [];
  const activeSurgeons = surgeons?.filter(s => s.isActive) ?? [];

  function surgeriesForRoom(roomId: number) {
    return (surgeries ?? [])
      .filter(s => s.operatingRoomId === roomId)
      .sort((a, b) => new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime());
  }

  function openAssign(roomId: number, roomName: string) {
    setAssign({ date: dayStr, roomId, roomName });
    setForm({ ...emptyForm });
  }

  function setF<K extends keyof typeof emptyForm>(key: K, value: (typeof emptyForm)[K]) {
    setForm(f => ({ ...f, [key]: value }));
  }

  function surgeonName(id: string): string {
    if (!id) return "";
    const s = activeSurgeons.find(s => String(s.id) === id);
    return s ? `Dr. ${s.lastName} ${s.firstName}` : "";
  }

  function openRosterEdit() {
    setRosterForm({
      surgeryResponsible1: roster?.surgeryResponsible1 ?? "",
      surgeryResponsible2: roster?.surgeryResponsible2 ?? "",
      acuteResponsible1: roster?.acuteResponsible1 ?? "",
      acuteResponsible2: roster?.acuteResponsible2 ?? "",
      ambulanceNotes: roster?.ambulanceNotes ?? "",
      dayOff: roster?.dayOff ?? "",
      absent: roster?.absent ?? "",
      surgeryStartTime: roster?.surgeryStartTime ?? "",
    });
    setRosterOpen(true);
  }

  function handleRosterSave() {
    upsertRoster.mutate({ date: dayStr, data: rosterForm }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetDailyRosterQueryKey(dayStr) });
        toast({ title: "Beosztás mentve" });
        setRosterOpen(false);
      },
      onError: () => toast({ title: "Hiba a mentés során", variant: "destructive" }),
    });
  }

  function handleCreate() {
    if (!assign || !form.lastName || !form.firstName || !form.surgeonId) return;

    const scheduledDate = new Date(`${assign.date}T${form.selTime}:00`).toISOString();

    createPatient.mutate({
      data: {
        lastName: form.lastName.trim(),
        firstName: form.firstName.trim(),
        birthDate: form.birthDate || "—",
        taj: form.taj || undefined,
        phone: form.phone || undefined,
        ward: form.ward || undefined,
        diagnosis: form.diagnosis || undefined,
        surgery: form.surgery || undefined,
        laparoscope: form.laparoscope || undefined,
        halo: form.halo || undefined,
        laterality: form.laterality || undefined,
        bloodType: form.bloodType || undefined,
        notes: form.notes || undefined,
        isDaySurgery: form.isDaySurgery,
        surgeonName: surgeonName(form.surgeonId) || undefined,
        assistant1: surgeonName(form.assistant1Id) || undefined,
        assistant2: surgeonName(form.assistant2Id) || undefined,
        assistant3: surgeonName(form.assistant3Id) || undefined,
        status: "scheduled",
        surgeryDate: assign.date,
        orRoom: assign.roomName,
      },
    }, {
      onSuccess: (patient) => {
        createSurgery.mutate({
          data: {
            patientId: patient.id,
            operatingRoomId: assign.roomId,
            surgeonId: Number(form.surgeonId),
            scheduledDate,
            surgeryType: form.surgery || undefined,
            status: "scheduled",
          },
        }, {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: getGetCalendarSurgeriesQueryKey({ from: dayStr, to: dayStr }) });
            queryClient.invalidateQueries({ queryKey: getListPatientsQueryKey() });
            toast({ title: "Beteg felvéve és előjegyezve" });
            setAssign(null);
          },
          onError: () => toast({ title: "Beteg mentve, de az előjegyzés sikertelen", variant: "destructive" }),
        });
      },
      onError: () => toast({ title: "Hiba a beteg mentésekor", variant: "destructive" }),
    });
  }

  function handleDelete(id: number, e: React.MouseEvent) {
    e.stopPropagation();
    if (!confirm("Törli ezt az előjegyzést?")) return;
    deleteSurgery.mutate({ id }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetCalendarSurgeriesQueryKey({ from: dayStr, to: dayStr }) });
        toast({ title: "Előjegyzés törölve" });
      },
    });
  }

  const isToday = dayStr === format(new Date(), "yyyy-MM-dd");

  const r1 = rosterVal(roster?.surgeryResponsible1);
  const r2 = rosterVal(roster?.surgeryResponsible2);
  const a1 = rosterVal(roster?.acuteResponsible1);
  const a2 = rosterVal(roster?.acuteResponsible2);
  const amb = rosterVal(roster?.ambulanceNotes);
  const dayoff = rosterVal(roster?.dayOff);
  const abs = rosterVal(roster?.absent);
  const startTime = rosterVal(roster?.surgeryStartTime);
  const hasRoster = r1 || r2 || a1 || a2 || amb || dayoff || abs || startTime;
  const isFallback = !!roster && roster.id === 0;

  const isSaving = createPatient.isPending || createSurgery.isPending;

  return (
    <div className="space-y-4">
      {/* Navigáció */}
      <div className="flex items-center gap-3 flex-wrap">
        <Button variant="outline" size="sm" onClick={() => setCurrentDay(d => subDays(d, 1))} data-testid="button-prev-day">
          <ChevronLeft className="w-4 h-4" />
        </Button>
        <span className="font-medium text-sm min-w-48 text-center capitalize">
          {format(currentDay, "yyyy. MMMM d., EEEE", { locale: hu })}
        </span>
        <Button variant="outline" size="sm" onClick={() => setCurrentDay(d => addDays(d, 1))} data-testid="button-next-day">
          <ChevronRight className="w-4 h-4" />
        </Button>
        {!isToday && (
          <Button variant="ghost" size="sm" onClick={() => setCurrentDay(new Date())} data-testid="button-today">
            Ma
          </Button>
        )}
        <a
          href={`/api/daily-rosters/${format(currentDay, "yyyy-MM-dd")}/pdf`}
          target="_blank"
          rel="noopener noreferrer"
        >
          <Button variant="outline" size="sm" className="gap-1.5 ml-2">
            <FileDown className="w-4 h-4" />
            PDF
          </Button>
        </a>
      </div>

      {/* Műtőtermek */}
      {isLoading ? (
        <Skeleton className="h-64 rounded-xl" />
      ) : (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
          {activeRooms.map(room => {
            const items = surgeriesForRoom(room.id);
            return (
              <Card
                key={room.id}
                className="cursor-pointer hover:ring-2 hover:ring-primary/30 transition-all"
                onClick={() => openAssign(room.id, `${room.code} — ${room.name}`)}
                data-testid={`room-card-${room.id}`}
              >
                <CardHeader className="pb-2 pt-3 px-4">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <span className="text-primary font-bold">{room.code}</span>
                    <span className="text-muted-foreground font-normal">{room.name}</span>
                    <Badge variant="outline" className="ml-auto text-[10px] px-1.5 py-0">{items.length} műtét</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-4 pb-3 space-y-1.5">
                  {items.length === 0 ? (
                    <div className="text-xs text-muted-foreground italic py-3 text-center">Nincs bejegyzés</div>
                  ) : (
                    items.map(s => {
                      const bg = s.surgeon?.bgColor ?? null;
                      const text = bg ? (s.surgeon?.textColor ?? autoTextColor(bg)) : null;
                      const assz = assistants(s.patient ?? undefined);
                      return (
                        <div
                          key={s.id}
                          className="text-[11px] rounded border px-2 py-1.5 leading-snug group/item relative"
                          style={bg ? { backgroundColor: bg, color: text ?? undefined, borderColor: bg } : undefined}
                          onClick={e => e.stopPropagation()}
                          data-testid={`cal-surgery-${s.id}`}
                        >
                          <div className="font-semibold truncate">
                            {s.patient ? `${s.patient.lastName} ${s.patient.firstName}` : "—"}
                          </div>
                          {s.patient?.diagnosis && (
                            <div className="truncate" style={{ opacity: 0.8 }}>{s.patient.diagnosis}</div>
                          )}
                          {s.surgeryType && (
                            <div className="truncate" style={{ opacity: 0.75 }}>{s.surgeryType}</div>
                          )}
                          <div className="flex items-center gap-1 flex-wrap mt-0.5">
                            {s.surgeon && (
                              <span className="italic" style={{ opacity: 0.7 }}>Dr. {s.surgeon.lastName}</span>
                            )}
                            {assz.length > 0 && (
                              <span style={{ opacity: 0.6 }}>
                                — {assz.map(a => a.replace(/^Dr\.\s*/i, "")).join(", ")}
                              </span>
                            )}
                          </div>
                          <button
                            className="absolute top-1 right-1 opacity-0 group-hover/item:opacity-100 transition-opacity"
                            onClick={e => handleDelete(s.id, e)}
                            data-testid={`button-delete-${s.id}`}
                          >
                            <Trash2 className="w-3 h-3 text-red-500" />
                          </button>
                        </div>
                      );
                    })
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Napi beosztás panel */}
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader className="pb-2 pt-3 px-4">
          <CardTitle className="text-sm flex items-center gap-2">
            <Calendar className="w-4 h-4 text-primary" />
            Napi beosztás
            {isFallback && (
              <span className="text-[10px] font-normal text-muted-foreground italic">(előző napból másolva)</span>
            )}
            <Button variant="ghost" size="sm" className="ml-auto h-7 px-2" onClick={openRosterEdit}>
              <Pencil className="w-3.5 h-3.5 mr-1" />
              {isFallback ? "Szerkesztés / Mentés" : hasRoster ? "Szerkesztés" : "Kitöltés"}
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-3">
          {!hasRoster ? (
            <p className="text-xs text-muted-foreground italic">Még nincs beosztás erre a napra.</p>
          ) : (
            <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-xs md:grid-cols-3 lg:grid-cols-4">
              {(r1 || r2) && (
                <div>
                  <span className="font-semibold text-muted-foreground">Műtét felelős: </span>
                  <span>{[r1, r2].filter(Boolean).join(", ")}</span>
                </div>
              )}
              {(a1 || a2) && (
                <div>
                  <span className="font-semibold text-muted-foreground">Akut felelős: </span>
                  <span>{[a1, a2].filter(Boolean).join(", ")}</span>
                </div>
              )}
              {startTime && (
                <div>
                  <span className="font-semibold text-muted-foreground">Műtétek kezdete: </span>
                  <span className="font-medium">{startTime}</span>
                </div>
              )}
              {amb && (
                <div className="col-span-2">
                  <span className="font-semibold text-muted-foreground">Ambulancia: </span>
                  <span>{amb}</span>
                </div>
              )}
              {dayoff && (
                <div className="col-span-2">
                  <span className="font-semibold text-muted-foreground">Szabadnap: </span>
                  <span>{dayoff}</span>
                </div>
              )}
              {abs && (
                <div className="col-span-2">
                  <span className="font-semibold text-muted-foreground">Egyéb távollevők: </span>
                  <span>{abs}</span>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Napi beosztás szerkesztő dialog */}
      <Dialog open={rosterOpen} onOpenChange={setRosterOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-primary" />
              Napi beosztás — {dayStr}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-1">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Műtét felelős 1.</Label>
                <Input placeholder="Dr. Pára Márton" value={rosterForm.surgeryResponsible1}
                  onChange={e => setRosterForm(f => ({ ...f, surgeryResponsible1: e.target.value }))} />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Műtét felelős 2.</Label>
                <Input placeholder="-" value={rosterForm.surgeryResponsible2}
                  onChange={e => setRosterForm(f => ({ ...f, surgeryResponsible2: e.target.value }))} />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Akut felelős 1.</Label>
                <Input placeholder="Dr. Huszár Borbála" value={rosterForm.acuteResponsible1}
                  onChange={e => setRosterForm(f => ({ ...f, acuteResponsible1: e.target.value }))} />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Akut felelős 2.</Label>
                <Input placeholder="-" value={rosterForm.acuteResponsible2}
                  onChange={e => setRosterForm(f => ({ ...f, acuteResponsible2: e.target.value }))} />
              </div>
              <div className="space-y-1 col-span-2">
                <Label className="text-xs">Ambulancia beosztás</Label>
                <Textarea placeholder="9-12: dr.Svastics, dr.Szilágyi  12-15: dr.Papp, dr.Szabó"
                  rows={2} value={rosterForm.ambulanceNotes}
                  onChange={e => setRosterForm(f => ({ ...f, ambulanceNotes: e.target.value }))} />
              </div>
              <div className="space-y-1 col-span-2">
                <Label className="text-xs">Szabadnap</Label>
                <Input placeholder="Dr. Dede Kristóf, Dr. Silvas János" value={rosterForm.dayOff}
                  onChange={e => setRosterForm(f => ({ ...f, dayOff: e.target.value }))} />
              </div>
              <div className="space-y-1 col-span-2">
                <Label className="text-xs">Egyéb távollevők</Label>
                <Input placeholder="dr.Fekete, dr.Kecskédi, dr.Bakó" value={rosterForm.absent}
                  onChange={e => setRosterForm(f => ({ ...f, absent: e.target.value }))} />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Műtétek kezdete</Label>
                <Input placeholder="08:30" value={rosterForm.surgeryStartTime}
                  onChange={e => setRosterForm(f => ({ ...f, surgeryStartTime: e.target.value }))} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRosterOpen(false)}>Mégse</Button>
            <Button onClick={handleRosterSave} disabled={upsertRoster.isPending}>
              {upsertRoster.isPending ? "Mentés..." : "Mentés"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Beteg felvétele + előjegyzés dialog */}
      <Dialog open={!!assign} onOpenChange={open => !open && setAssign(null)}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="w-4 h-4 text-primary" />
              Beteg felvétele — {assign?.roomName}
              <Badge variant="outline" className="ml-1 text-xs font-normal">{assign?.date}</Badge>
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
                <Label className="text-xs">Beteg neve — Vezetéknév <span className="text-red-500">*</span></Label>
                <Input
                  placeholder="Kovács"
                  value={form.lastName}
                  onChange={e => setF("lastName", e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Keresztnév <span className="text-red-500">*</span></Label>
                <Input
                  placeholder="János"
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
                  placeholder="123 456 789"
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

            {/* Műtét megnevezése + időpont */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Műtét megnevezése</Label>
                <Input
                  placeholder="pl. Appendectomia"
                  value={form.surgery}
                  onChange={e => setF("surgery", e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Tervezett időpont</Label>
                <Input
                  type="time"
                  value={form.selTime}
                  onChange={e => setF("selTime", e.target.value)}
                />
              </div>
            </div>

            {/* Laparoszkóp, Háló */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Laparoszkóp?</Label>
                <div className="flex gap-3 pt-1">
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
                    <button className="text-xs text-muted-foreground underline" onClick={() => setF("laparoscope", "")}>töröl</button>
                  )}
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Háló?</Label>
                <div className="flex gap-3 pt-1">
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
                    <button className="text-xs text-muted-foreground underline" onClick={() => setF("halo", "")}>töröl</button>
                  )}
                </div>
              </div>
            </div>

            {/* Oldaliság, Vércsoport */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Oldaliság</Label>
                <div className="flex flex-wrap gap-2 pt-1">
                  {LATERALITY_OPTIONS.map(opt => (
                    <label key={opt.value} className="flex items-center gap-1.5 cursor-pointer text-sm">
                      <input
                        type="radio"
                        name="laterality"
                        value={opt.value}
                        checked={form.laterality === opt.value}
                        onChange={() => setF("laterality", opt.value)}
                        className="accent-primary"
                      />
                      <span title={opt.label}>{opt.value}</span>
                    </label>
                  ))}
                  {form.laterality && (
                    <button className="text-xs text-muted-foreground underline" onClick={() => setF("laterality", "")}>töröl</button>
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
              <Label className="text-xs font-semibold">Műtő orvos <span className="text-red-500">*</span></Label>
              <Select value={form.surgeonId} onValueChange={v => setF("surgeonId", v)}>
                <SelectTrigger data-testid="select-surgeon">
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

          <DialogFooter className="pt-2">
            <Button variant="outline" onClick={() => setAssign(null)}>Mégse</Button>
            <Button
              onClick={handleCreate}
              disabled={!form.lastName || !form.firstName || !form.surgeonId || isSaving}
              data-testid="button-submit"
            >
              {isSaving ? "Mentés..." : "Felvétel és előjegyzés"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
