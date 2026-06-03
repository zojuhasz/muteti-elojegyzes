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
  J:   "bg-green-50  text-green-700  border-green-200  hover:bg-green-100",
  PL:  "bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100",
  T:   "bg-blue-50   text-blue-800   border-blue-200   hover:bg-blue-100",
  Amb: "bg-teal-50   text-teal-700   border-teal-200   hover:bg-teal-100",
  FOG: "bg-amber-50  text-amber-700  border-amber-200  hover:bg-amber-100",
};

const TYPE_FILLED: Record<string, string> = {
  J:   "bg-green-100  text-green-800  border-green-300",
  PL:  "bg-purple-100 text-purple-800 border-purple-300",
  T:   "bg-blue-100   text-blue-900   border-blue-300",
  Amb: "bg-teal-100   text-teal-800   border-teal-300",
  FOG: "bg-amber-100  text-amber-800  border-amber-300",
};

const TYPE_LABEL: Record<string, string> = {
  J:   "Jóindulatú",
  PL:  "Plasztika",
  T:   "Tumoros",
  Amb: "Ambuláns",
  FOG: "Fogorvosi",
};

const BASE_SLOTS = ["J","J","J","J","J","PL","T","T","T","T","Amb","Amb","Amb","Amb"];
const DAY_SLOTS: Record<number, string[]> = {
  1: BASE_SLOTS,                                  // Hétfő
  2: [...BASE_SLOTS, "FOG","FOG","FOG"],           // Kedd
  3: BASE_SLOTS,                                  // Szerda
  4: [...BASE_SLOTS, "FOG","FOG"],                // Csütörtök
  5: BASE_SLOTS,                                  // Péntek
};

function slotsForDay(day: Date): string[] {
  return DAY_SLOTS[day.getDay()] ?? BASE_SLOTS;
}

const ALL_ROWS: { type: string; typeIndex: number }[] = [
  { type: "J",   typeIndex: 0 },
  { type: "J",   typeIndex: 1 },
  { type: "J",   typeIndex: 2 },
  { type: "J",   typeIndex: 3 },
  { type: "J",   typeIndex: 4 },
  { type: "PL",  typeIndex: 0 },
  { type: "T",   typeIndex: 0 },
  { type: "T",   typeIndex: 1 },
  { type: "T",   typeIndex: 2 },
  { type: "T",   typeIndex: 3 },
  { type: "Amb", typeIndex: 0 },
  { type: "Amb", typeIndex: 1 },
  { type: "Amb", typeIndex: 2 },
  { type: "Amb", typeIndex: 3 },
  { type: "FOG", typeIndex: 0 },
  { type: "FOG", typeIndex: 1 },
  { type: "FOG", typeIndex: 2 },
];

function slotLabel(type: string, typeIndex: number): string {
  return `${type}-${typeIndex + 1}`;
}

type SlotClick = { date: string; type: string; typeIndex: number };

type FormState = {
  lastName: string;
  firstName: string;
  birthDate: string;
  taj: string;
  diagnosis: string;
  notes: string;
};

const EMPTY_FORM: FormState = { lastName: "", firstName: "", birthDate: "", taj: "", diagnosis: "", notes: "" };

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

  function openSlot(date: string, type: string, typeIndex: number) {
    setSlot({ date, type, typeIndex });
    setForm(EMPTY_FORM);
  }

  function handleField(field: keyof FormState, value: string) {
    setForm(f => ({ ...f, [field]: value }));
  }

  function handleSubmit() {
    if (!slot || !form.lastName.trim() || !form.firstName.trim() || !form.birthDate) return;
    createPatient.mutate({
      data: {
        lastName: form.lastName.trim(),
        firstName: form.firstName.trim(),
        birthDate: new Date(form.birthDate) as never,
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

            {ALL_ROWS.map(({ type, typeIndex }) => {
              const label = slotLabel(type, typeIndex);
              return (
                <div
                  key={label}
                  className="grid gap-px bg-border"
                  style={{ gridTemplateColumns: `repeat(${weekdays.length}, 1fr)` }}
                >
                  {weekdays.map(day => {
                    const dayStr = format(day, "yyyy-MM-dd");
                    const daySlots = slotsForDay(day);
                    const typeCount = daySlots.filter(t => t === type).length;
                    const isActive = typeIndex < typeCount;

                    if (!isActive) {
                      return <div key={dayStr} className="h-0 overflow-hidden" />;
                    }

                    const typePatients = patientsFor(type, day);
                    const patient = typePatients[typeIndex] ?? null;

                    return (
                      <div key={dayStr} className="bg-card px-1 py-1 min-h-[60px]">
                        {patient ? (
                          <div className={`h-full rounded border px-2 py-1.5 text-xs leading-snug ${TYPE_FILLED[type]}`}>
                            <div className="text-[10px] font-bold mb-0.5 opacity-60">{label}</div>
                            <div className="font-semibold">{patient.lastName} {patient.firstName}</div>
                            {patient.diagnosis && (
                              <div className="text-[10px] opacity-70 truncate">{patient.diagnosis}</div>
                            )}
                          </div>
                        ) : (
                          <button
                            className={`w-full h-full rounded border border-dashed text-[11px] transition-colors flex flex-col items-center justify-center gap-0.5 ${TYPE_COLORS[type]}`}
                            onClick={() => openSlot(dayStr, type, typeIndex)}
                            title={`${TYPE_LABEL[type]} ${label} — ${dayStr}`}
                          >
                            <span className="font-bold opacity-80">{label}</span>
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
      )}

      <div className="flex flex-wrap gap-2 text-xs">
        {Object.entries(TYPE_LABEL).map(([code, label]) => (
          <div key={code} className={`rounded border px-2 py-1 ${TYPE_FILLED[code]}`}>
            <span className="font-bold">{code}</span> — {label}
          </div>
        ))}
      </div>

      <Dialog open={!!slot} onOpenChange={open => !open && setSlot(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="w-4 h-4 text-primary" />
              Beteg felvétele
              {slot && (
                <span className={`text-xs font-normal rounded border px-2 py-0.5 ml-1 ${TYPE_FILLED[slot.type]}`}>
                  {slotLabel(slot.type, slot.typeIndex)} — {TYPE_LABEL[slot.type]}
                </span>
              )}
            </DialogTitle>
            {slot && (
              <p className="text-sm text-muted-foreground">{slot.date}</p>
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
              <Label className="text-xs">Születési dátum <span className="text-destructive">*</span></Label>
              <Input
                type="date"
                value={form.birthDate}
                onChange={e => handleField("birthDate", e.target.value)}
              />
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
              disabled={!form.lastName.trim() || !form.firstName.trim() || !form.birthDate || createPatient.isPending}
            >
              {createPatient.isPending ? "Mentés..." : "Beteg felvétele"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
