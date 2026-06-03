import { useState } from "react";
import { useGetAdmissionCalendar, useCreatePatient, getGetAdmissionCalendarQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ChevronLeft, ChevronRight, UserPlus } from "lucide-react";
import { format, startOfWeek, addDays, addWeeks, subWeeks, isWeekend } from "date-fns";
import { hu } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";

const TYPE_COLORS: Record<string, string> = {
  Tu: "bg-blue-50 text-blue-800 border-blue-200 hover:bg-blue-100",
  J: "bg-green-50 text-green-700 border-green-200 hover:bg-green-100",
  S: "bg-red-50 text-red-700 border-red-200 hover:bg-red-100",
};

const TYPE_FILLED: Record<string, string> = {
  Tu: "bg-blue-100 text-blue-900 border-blue-300",
  J: "bg-green-100 text-green-800 border-green-300",
  S: "bg-red-100 text-red-800 border-red-300",
};

const TYPE_LABEL: Record<string, string> = {
  Tu: "Tumoros",
  J: "Járóbeteg",
  S: "Sürgős",
};

const DAILY_SLOTS: string[] = ["Tu", "Tu", "Tu", "Tu", "J", "J", "S"];

type SlotClick = { date: string; type: string; slotIndex: number };

type FormState = {
  lastName: string;
  firstName: string;
  taj: string;
  diagnosis: string;
  notes: string;
};

const EMPTY_FORM: FormState = { lastName: "", firstName: "", taj: "", diagnosis: "", notes: "" };

export default function AdmissionCalendar() {
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [slot, setSlot] = useState<SlotClick | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const from = format(weekStart, "yyyy-MM-dd");
  const to = format(addDays(weekStart, 6), "yyyy-MM-dd");

  const { data: patients, isLoading } = useGetAdmissionCalendar({ from, to });
  const createPatient = useCreatePatient();

  const weekdays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)).filter(d => !isWeekend(d));

  function patientsFor(type: string, day: Date) {
    const dayStr = format(day, "yyyy-MM-dd");
    return patients?.filter(p => p.patientType === type && p.admissionDate === dayStr) ?? [];
  }

  function openSlot(date: string, type: string, slotIndex: number) {
    setSlot({ date, type, slotIndex });
    setForm(EMPTY_FORM);
  }

  function handleField(field: keyof FormState, value: string) {
    setForm(f => ({ ...f, [field]: value }));
  }

  function handleSubmit() {
    if (!slot || !form.lastName.trim() || !form.firstName.trim()) return;
    createPatient.mutate({
      data: {
        lastName: form.lastName.trim(),
        firstName: form.firstName.trim(),
        taj: form.taj.trim() || undefined,
        diagnosis: form.diagnosis.trim() || undefined,
        notes: form.notes.trim() || undefined,
        patientType: slot.type,
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
              style={{ gridTemplateColumns: `48px repeat(${weekdays.length}, 1fr)` }}
            >
              <div className="bg-muted/50 px-2 py-2 text-xs font-medium text-muted-foreground text-center">#</div>
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

            {DAILY_SLOTS.map((type, slotIdx) => {
              const typeNum = DAILY_SLOTS.slice(0, slotIdx + 1).filter(t => t === type).length;
              const slotLabel = `${type}${typeNum}`;
              return (
              <div
                key={slotIdx}
                className="grid gap-px bg-border"
                style={{ gridTemplateColumns: `48px repeat(${weekdays.length}, 1fr)` }}
              >
                <div className="bg-card flex items-center justify-center py-2">
                  <span className={`text-[11px] font-bold px-1.5 py-0.5 rounded border ${TYPE_FILLED[type]}`}>
                    {slotLabel}
                  </span>
                </div>
                {weekdays.map(day => {
                  const dayStr = format(day, "yyyy-MM-dd");
                  const typePatients = patientsFor(type, day);
                  const typeSlotsBefore = DAILY_SLOTS.slice(0, slotIdx).filter(t => t === type).length;
                  const patient = typePatients[typeSlotsBefore] ?? null;

                  return (
                    <div key={dayStr} className="bg-card px-1 py-1 min-h-[52px]">
                      {patient ? (
                        <div className={`h-full rounded border px-2 py-1.5 text-xs leading-snug ${TYPE_FILLED[type]}`}>
                          <div className="font-semibold">{patient.lastName} {patient.firstName}</div>
                          {patient.diagnosis && (
                            <div className="text-[10px] opacity-70 truncate">{patient.diagnosis}</div>
                          )}
                        </div>
                      ) : (
                        <button
                          className={`w-full h-full rounded border border-dashed text-[11px] transition-colors flex items-center justify-center gap-1 ${TYPE_COLORS[type]}`}
                          onClick={() => openSlot(dayStr, type, slotIdx)}
                          title={`${TYPE_LABEL[type]} beteg felvétele — ${dayStr}`}
                        >
                          <UserPlus className="w-3 h-3 opacity-60" />
                          <span className="opacity-60">Felvesz</span>
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
      )}

      <div className="flex flex-wrap gap-3 text-xs">
        {Object.entries(TYPE_LABEL).map(([code, label]) => (
          <div key={code} className={`rounded border px-2 py-1 ${TYPE_FILLED[code]}`}>
            <span className="font-bold">{code}</span> — {label}
          </div>
        ))}
        <span className="text-muted-foreground self-center">Napirend: Tu Tu Tu Tu J J S</span>
      </div>

      <Dialog open={!!slot} onOpenChange={open => !open && setSlot(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="w-4 h-4 text-primary" />
              Beteg felvétele
              {slot && (
                <span className={`text-xs font-normal rounded border px-2 py-0.5 ml-1 ${TYPE_FILLED[slot.type]}`}>
                  {slot.type} — {TYPE_LABEL[slot.type]}
                </span>
              )}
            </DialogTitle>
            {slot && (
              <p className="text-sm text-muted-foreground">
                {slot.date} &nbsp;·&nbsp; {slot.slotIdx + 1}. időpont
              </p>
            )}
          </DialogHeader>

          <div className="space-y-3 py-1">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Vezetéknév <span className="text-destructive">*</span></Label>
                <Input
                  placeholder="pl. Kiss"
                  value={form.lastName}
                  onChange={e => handleField("lastName", e.target.value)}
                  autoFocus
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Keresztnév <span className="text-destructive">*</span></Label>
                <Input
                  placeholder="pl. János"
                  value={form.firstName}
                  onChange={e => handleField("firstName", e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs">TAJ szám</Label>
              <Input
                placeholder="000 000 000"
                value={form.taj}
                onChange={e => handleField("taj", e.target.value)}
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Diagnózis / beavatkozás</Label>
              <Input
                placeholder="pl. Epekő műtét"
                value={form.diagnosis}
                onChange={e => handleField("diagnosis", e.target.value)}
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Megjegyzés</Label>
              <Textarea
                placeholder="Egyéb tudnivalók..."
                className="resize-none"
                rows={2}
                value={form.notes}
                onChange={e => handleField("notes", e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setSlot(null)}>Mégse</Button>
            <Button
              onClick={handleSubmit}
              disabled={!form.lastName.trim() || !form.firstName.trim() || createPatient.isPending}
            >
              {createPatient.isPending ? "Mentés..." : "Beteg felvétele"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
