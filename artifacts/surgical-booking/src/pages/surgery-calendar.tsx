import { useState } from "react";
import {
  useGetCalendarSurgeries, useListOperatingRooms, useListPatients, useListSurgeons,
  useCreateSurgery, useDeleteSurgery, getGetCalendarSurgeriesQueryKey,
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
import { ChevronLeft, ChevronRight, Plus, Trash2, Calendar, Pencil } from "lucide-react";
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

export default function SurgeryCalendar() {
  const [currentDay, setCurrentDay] = useState(() => new Date());
  const [assign, setAssign] = useState<AssignState>(null);
  const [selPatient, setSelPatient] = useState("");
  const [selSurgeon, setSelSurgeon] = useState("");
  const [selTime, setSelTime] = useState("08:00");
  const [selType, setSelType] = useState("");
  const [selDuration, setSelDuration] = useState("");
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
  const { data: patients } = useListPatients();
  const { data: surgeons } = useListSurgeons();
  const { data: roster } = useGetDailyRoster(dayStr, { query: { queryKey: getGetDailyRosterQueryKey(dayStr), retry: false } });
  const createSurgery = useCreateSurgery();
  const deleteSurgery = useDeleteSurgery();
  const upsertRoster = useUpsertDailyRoster();

  const activeRooms = rooms?.filter(r => r.isActive) ?? [];

  function surgeriesForRoom(roomId: number) {
    return (surgeries ?? [])
      .filter(s => s.operatingRoomId === roomId)
      .sort((a, b) => new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime());
  }

  function openAssign(roomId: number, roomName: string) {
    setAssign({ date: dayStr, roomId, roomName });
    setSelPatient(""); setSelSurgeon(""); setSelTime("08:00"); setSelType(""); setSelDuration("");
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
    if (!assign || !selPatient || !selSurgeon) return;
    const scheduledDate = new Date(`${assign.date}T${selTime}:00`).toISOString();
    createSurgery.mutate({
      data: {
        patientId: Number(selPatient),
        operatingRoomId: assign.roomId,
        surgeonId: Number(selSurgeon),
        scheduledDate,
        surgeryType: selType || undefined,
        estimatedDurationMinutes: selDuration ? Number(selDuration) : undefined,
        status: "scheduled",
      },
    }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetCalendarSurgeriesQueryKey({ from: dayStr, to: dayStr }) });
        toast({ title: "Műtét előjegyezve" });
        setAssign(null);
      },
      onError: () => toast({ title: "Hiba a mentés során", variant: "destructive" }),
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

  return (
    <div className="space-y-4">
      {/* Navigáció */}
      <div className="flex items-center gap-3">
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

      {/* Sebész-jelmagyarázat */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Calendar className="w-4 h-4 text-primary" />
            Sebészek
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {surgeons?.filter(s => s.isActive && s.bgColor).map(s => {
              const bg = s.bgColor!;
              const text = s.textColor ?? autoTextColor(bg);
              return (
                <div key={s.id} className="text-[11px] rounded border px-2 py-0.5"
                  style={{ backgroundColor: bg, color: text, borderColor: bg }}>
                  Dr. {s.lastName}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Napi beosztás panel */}
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader className="pb-2 pt-3 px-4">
          <CardTitle className="text-sm flex items-center gap-2">
            <Calendar className="w-4 h-4 text-primary" />
            Napi beosztás
            <Button variant="ghost" size="sm" className="ml-auto h-7 px-2" onClick={openRosterEdit}>
              <Pencil className="w-3.5 h-3.5 mr-1" />
              {hasRoster ? "Szerkesztés" : "Kitöltés"}
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-3">
          {!hasRoster ? (
            <p className="text-xs text-muted-foreground italic">Még nincs beosztás erre a napra. Kattintson a Kitöltés gombra.</p>
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

      {/* Új műtét dialog */}
      <Dialog open={!!assign} onOpenChange={open => !open && setAssign(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="w-4 h-4 text-primary" />
              Előjegyzés — {assign?.roomName}
              <Badge variant="outline" className="ml-1 text-xs font-normal">{assign?.date}</Badge>
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1 col-span-2">
                <Label className="text-xs">Beteg</Label>
                <Select value={selPatient} onValueChange={setSelPatient}>
                  <SelectTrigger data-testid="select-patient">
                    <SelectValue placeholder="Válasszon beteget..." />
                  </SelectTrigger>
                  <SelectContent>
                    {patients?.map(p => (
                      <SelectItem key={p.id} value={String(p.id)}>
                        {p.lastName} {p.firstName}{p.diagnosis ? ` — ${p.diagnosis}` : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1 col-span-2">
                <Label className="text-xs">Sebész</Label>
                <Select value={selSurgeon} onValueChange={setSelSurgeon}>
                  <SelectTrigger data-testid="select-surgeon">
                    <SelectValue placeholder="Válasszon sebészt..." />
                  </SelectTrigger>
                  <SelectContent>
                    {surgeons?.filter(s => s.isActive).map(s => (
                      <SelectItem key={s.id} value={String(s.id)}>Dr. {s.lastName} {s.firstName}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Időpont</Label>
                <Input type="time" value={selTime} onChange={e => setSelTime(e.target.value)} data-testid="input-time" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Időtartam (perc)</Label>
                <Input type="number" placeholder="pl. 90" value={selDuration} onChange={e => setSelDuration(e.target.value)} data-testid="input-duration" />
              </div>
              <div className="space-y-1 col-span-2">
                <Label className="text-xs">Műtét típusa</Label>
                <Input placeholder="pl. Appendectomia" value={selType} onChange={e => setSelType(e.target.value)} data-testid="input-type" />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAssign(null)}>Mégse</Button>
            <Button onClick={handleCreate} disabled={!selPatient || !selSurgeon || createSurgery.isPending} data-testid="button-submit">
              {createSurgery.isPending ? "Mentés..." : "Előjegyez"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
