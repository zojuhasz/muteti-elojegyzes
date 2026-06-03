import { useState } from "react";
import { useGetCalendarSurgeries, useListOperatingRooms, useListPatients, useListSurgeons, useCreateSurgery, useDeleteSurgery, getGetCalendarSurgeriesQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChevronLeft, ChevronRight, Plus, Trash2, Calendar } from "lucide-react";
import { format, startOfWeek, addDays, addWeeks, subWeeks } from "date-fns";
import { hu } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";

const statusLabels: Record<string, string> = {
  scheduled: "Tervezett",
  in_progress: "Folyamatban",
  completed: "Elvégezve",
  cancelled: "Törölve",
  operated: "Elvégzett",
};

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

type AssignState = { date: string; roomId: number; roomName: string } | null;

export default function SurgeryCalendar() {
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [assign, setAssign] = useState<AssignState>(null);
  const [selPatient, setSelPatient] = useState("");
  const [selSurgeon, setSelSurgeon] = useState("");
  const [selTime, setSelTime] = useState("08:00");
  const [selType, setSelType] = useState("");
  const [selDuration, setSelDuration] = useState("");
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const from = format(weekStart, "yyyy-MM-dd");
  const to = format(addDays(weekStart, 6), "yyyy-MM-dd");

  const { data: surgeries, isLoading } = useGetCalendarSurgeries({ from, to });
  const { data: rooms } = useListOperatingRooms();
  const { data: patients } = useListPatients();
  const { data: surgeons } = useListSurgeons();
  const createSurgery = useCreateSurgery();
  const deleteSurgery = useDeleteSurgery();

  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const activeRooms = rooms?.filter(r => r.isActive) ?? [];

  function surgeriesFor(roomId: number, day: Date) {
    const dayStr = format(day, "yyyy-MM-dd");
    return surgeries?.filter(s => {
      const sDay = format(new Date(s.scheduledDate), "yyyy-MM-dd");
      return s.operatingRoomId === roomId && sDay === dayStr;
    }) ?? [];
  }

  function openAssign(date: string, roomId: number, roomName: string) {
    setAssign({ date, roomId, roomName });
    setSelPatient("");
    setSelSurgeon("");
    setSelTime("08:00");
    setSelType("");
    setSelDuration("");
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
        queryClient.invalidateQueries({ queryKey: getGetCalendarSurgeriesQueryKey({ from, to }) });
        toast({ title: "Műtét előjegyezve" });
        setAssign(null);
      },
      onError: () => {
        toast({ title: "Hiba a mentés során", variant: "destructive" });
      },
    });
  }

  function handleDelete(id: number, e: React.MouseEvent) {
    e.stopPropagation();
    if (!confirm("Törli ezt az előjegyzést?")) return;
    deleteSurgery.mutate({ id }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetCalendarSurgeriesQueryKey({ from, to }) });
        toast({ title: "Előjegyzés törölve" });
      },
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="outline" size="sm" onClick={() => setWeekStart(w => subWeeks(w, 1))} data-testid="button-prev-week">
          <ChevronLeft className="w-4 h-4" />
        </Button>
        <span className="font-medium text-sm min-w-60 text-center">
          {format(weekStart, "yyyy. MMMM d.", { locale: hu })} – {format(addDays(weekStart, 6), "MMMM d.", { locale: hu })}
        </span>
        <Button variant="outline" size="sm" onClick={() => setWeekStart(w => addWeeks(w, 1))} data-testid="button-next-week">
          <ChevronRight className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="sm" onClick={() => setWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }))} data-testid="button-today">
          Ma
        </Button>
        <span className="text-xs text-muted-foreground ml-2">Kattintson egy cellára az előjegyzéshez</span>
      </div>

      {isLoading ? (
        <Skeleton className="h-64 rounded-xl" />
      ) : (
        <div className="overflow-x-auto">
          <div className="min-w-[900px]">
            <div className="grid gap-px bg-border rounded-t-lg overflow-hidden" style={{ gridTemplateColumns: `120px repeat(7, 1fr)` }}>
              <div className="bg-muted/50 px-3 py-2 text-xs font-medium text-muted-foreground">Műtőterem</div>
              {days.map(day => {
                const isToday = format(day, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd");
                return (
                  <div key={day.toISOString()} className={`px-3 py-2 text-xs font-medium text-center ${isToday ? "bg-primary text-primary-foreground" : "bg-muted/50 text-muted-foreground"}`}>
                    {format(day, "EEE", { locale: hu })}
                    <br />
                    <span className="font-bold">{format(day, "MM. d.")}</span>
                  </div>
                );
              })}
            </div>

            {activeRooms.map(room => (
              <div key={room.id} className="grid gap-px bg-border" style={{ gridTemplateColumns: `120px repeat(7, 1fr)` }} data-testid={`calendar-row-${room.id}`}>
                <div className="bg-card px-3 py-3 flex items-center gap-2">
                  <span className="text-sm font-bold text-primary">{room.code}</span>
                  <span className="text-xs text-muted-foreground">{room.name}</span>
                </div>
                {days.map(day => {
                  const dayStr = format(day, "yyyy-MM-dd");
                  const items = surgeriesFor(room.id, day);
                  return (
                    <div
                      key={day.toISOString()}
                      className="bg-card px-1 py-1 min-h-[88px] space-y-1 group cursor-pointer hover:bg-muted/20 transition-colors relative"
                      onClick={() => openAssign(dayStr, room.id, `${room.code} — ${room.name}`)}
                      data-testid={`cell-${room.code}-${dayStr}`}
                    >
                      {items.map(s => {
                        const bg = s.surgeon?.bgColor ?? null;
                        const text = bg
                          ? (s.surgeon?.textColor ?? autoTextColor(bg))
                          : null;
                        const cellStyle = bg
                          ? { backgroundColor: bg, color: text ?? undefined, borderColor: bg }
                          : undefined;
                        const cellClass = bg
                          ? "text-[10px] rounded border px-1.5 py-1 leading-tight group/item relative"
                          : `text-[10px] rounded border px-1.5 py-1 leading-tight bg-muted group/item relative`;
                        const assz = assistants(s.patient ?? undefined);
                        return (
                          <div
                            key={s.id}
                            className={cellClass}
                            style={cellStyle}
                            data-testid={`cal-surgery-${s.id}`}
                            onClick={e => e.stopPropagation()}
                          >
                            <div className="font-semibold">{format(new Date(s.scheduledDate), "HH:mm")}</div>
                            <div className="font-medium truncate">{s.patient ? `${s.patient.lastName} ${s.patient.firstName}` : "—"}</div>
                            {s.patient?.diagnosis && <div className="truncate" style={{ opacity: 0.8 }}>{s.patient.diagnosis}</div>}
                            {s.surgeryType && <div className="truncate" style={{ opacity: 0.75 }}>{s.surgeryType}</div>}
                            {s.surgeon && <div className="truncate italic" style={{ opacity: 0.65 }}>Dr. {s.surgeon.lastName}</div>}
                            {assz.length > 0 && (
                              <div className="truncate" style={{ opacity: 0.6 }}>
                                {assz.map((a, i) => (
                                  <span key={i}>{i > 0 ? ", " : ""}{a.replace(/^Dr\.\s*/i, "")}</span>
                                ))}
                              </div>
                            )}
                            <button
                              className="absolute top-0.5 right-0.5 opacity-0 group-hover/item:opacity-100 transition-opacity"
                              onClick={e => handleDelete(s.id, e)}
                              data-testid={`button-delete-${s.id}`}
                            >
                              <Trash2 className="w-2.5 h-2.5 text-red-500" />
                            </button>
                          </div>
                        );
                      })}
                      <div className="absolute bottom-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Plus className="w-3 h-3 text-muted-foreground" />
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      )}

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
                <div
                  key={s.id}
                  className="text-[11px] rounded border px-2 py-0.5"
                  style={{ backgroundColor: bg, color: text, borderColor: bg }}
                >
                  Dr. {s.lastName}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

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
                        {p.lastName} {p.firstName}
                        {p.diagnosis ? ` — ${p.diagnosis}` : ""}
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
            <Button
              onClick={handleCreate}
              disabled={!selPatient || !selSurgeon || createSurgery.isPending}
              data-testid="button-submit"
            >
              {createSurgery.isPending ? "Mentés..." : "Előjegyez"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
