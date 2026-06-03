import { useState } from "react";
import { useGetAdmissionCalendar, useListPatients, useUpdatePatient, getListPatientsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChevronLeft, ChevronRight, Plus, UserPlus } from "lucide-react";
import { format, startOfWeek, addDays, addWeeks, subWeeks } from "date-fns";
import { hu } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";

const PATIENT_TYPES = [
  { code: "T", label: "Tervezett", color: "bg-blue-100 text-blue-800 border-blue-200" },
  { code: "J", label: "Járóbeteg", color: "bg-green-100 text-green-700 border-green-200" },
  { code: "S", label: "Sürgős", color: "bg-red-100 text-red-700 border-red-200" },
];

type AddPatientState = { date: string; type: string } | null;

export default function AdmissionCalendar() {
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [addPatient, setAddPatient] = useState<AddPatientState>(null);
  const [selectedPatientId, setSelectedPatientId] = useState("");
  const [newAdmissionDate, setNewAdmissionDate] = useState("");
  const [newPatientType, setNewPatientType] = useState("");
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const from = format(weekStart, "yyyy-MM-dd");
  const to = format(addDays(weekStart, 6), "yyyy-MM-dd");

  const { data: admitted, isLoading } = useGetAdmissionCalendar({ from, to });
  const { data: allPatients } = useListPatients();
  const updatePatient = useUpdatePatient();

  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  function patientsFor(type: string, day: Date) {
    const dayStr = format(day, "yyyy-MM-dd");
    return admitted?.filter(p => p.patientType === type && p.admissionDate === dayStr) ?? [];
  }

  function openAddDialog(date: string, type: string) {
    setAddPatient({ date, type });
    setSelectedPatientId("");
  }

  function handleAssign() {
    if (!addPatient || !selectedPatientId) return;
    updatePatient.mutate({
      id: Number(selectedPatientId),
      data: { admissionDate: addPatient.date, patientType: addPatient.type } as never,
    }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListPatientsQueryKey() });
        toast({ title: "Beteg felvételi dátuma frissítve" });
        setAddPatient(null);
      },
    });
  }

  function handleBulkAdd() {
    if (!selectedPatientId || !newAdmissionDate || !newPatientType) return;
    updatePatient.mutate({
      id: Number(selectedPatientId),
      data: { admissionDate: newAdmissionDate, patientType: newPatientType } as never,
    }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListPatientsQueryKey() });
        toast({ title: "Beteg felvételi dátuma frissítve" });
        setSelectedPatientId("");
        setNewAdmissionDate("");
        setNewPatientType("");
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
      </div>

      {isLoading ? (
        <Skeleton className="h-64 rounded-xl" />
      ) : (
        <div className="overflow-x-auto">
          <div className="min-w-[900px]">
            <div className="grid grid-cols-8 gap-px bg-border rounded-t-lg overflow-hidden">
              <div className="bg-muted/50 px-3 py-2 text-xs font-medium text-muted-foreground">Típus</div>
              {days.map(day => {
                const isToday = format(day, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd");
                return (
                  <div key={day.toISOString()} className={`px-3 py-2 text-xs font-medium text-center ${isToday ? "bg-primary text-primary-foreground" : "bg-muted/50 text-muted-foreground"}`}>
                    {format(day, "EEE", { locale: hu })}
                    <br />
                    <span className="font-bold">{format(day, "d.")}</span>
                  </div>
                );
              })}
            </div>

            {PATIENT_TYPES.map(pt => (
              <div key={pt.code} className="grid grid-cols-8 gap-px bg-border" data-testid={`admission-row-${pt.code}`}>
                <div className="bg-card px-3 py-3 flex items-center gap-2">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded border ${pt.color}`}>{pt.code}</span>
                  <span className="text-xs text-muted-foreground">{pt.label}</span>
                </div>
                {days.map(day => {
                  const dayStr = format(day, "yyyy-MM-dd");
                  const patients = patientsFor(pt.code, day);
                  return (
                    <div
                      key={day.toISOString()}
                      className="bg-card px-1 py-1 min-h-[72px] space-y-1 group cursor-pointer hover:bg-muted/20 transition-colors relative"
                      onClick={() => openAddDialog(dayStr, pt.code)}
                      data-testid={`cell-${pt.code}-${dayStr}`}
                    >
                      {patients.map(p => (
                        <div
                          key={p.id}
                          className={`text-[10px] rounded border px-1.5 py-0.5 leading-tight ${pt.color}`}
                          onClick={e => e.stopPropagation()}
                          data-testid={`admission-patient-${p.id}`}
                        >
                          <span className="font-medium">{p.lastName} {p.firstName}</span>
                          {p.diagnosis && <div className="truncate opacity-75">{p.diagnosis}</div>}
                        </div>
                      ))}
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
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <UserPlus className="w-4 h-4 text-primary" />
            Beteg felvételi időpont beállítása
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3 items-end">
            <div className="space-y-1">
              <Label className="text-xs">Beteg</Label>
              <Select value={selectedPatientId} onValueChange={setSelectedPatientId}>
                <SelectTrigger className="w-56" data-testid="select-patient-bulk">
                  <SelectValue placeholder="Válasszon beteget..." />
                </SelectTrigger>
                <SelectContent>
                  {allPatients?.map(p => (
                    <SelectItem key={p.id} value={String(p.id)}>{p.lastName} {p.firstName}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Felvételi dátum</Label>
              <Input type="date" className="w-40" value={newAdmissionDate} onChange={e => setNewAdmissionDate(e.target.value)} data-testid="input-bulk-date" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Típus</Label>
              <Select value={newPatientType} onValueChange={setNewPatientType}>
                <SelectTrigger className="w-36" data-testid="select-bulk-type">
                  <SelectValue placeholder="T / J / S" />
                </SelectTrigger>
                <SelectContent>
                  {PATIENT_TYPES.map(pt => (
                    <SelectItem key={pt.code} value={pt.code}>{pt.code} — {pt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button
              onClick={handleBulkAdd}
              disabled={!selectedPatientId || !newAdmissionDate || !newPatientType || updatePatient.isPending}
              data-testid="button-bulk-assign"
            >
              Beállítás
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-wrap gap-3">
        {PATIENT_TYPES.map(pt => (
          <div key={pt.code} className={`text-xs rounded border px-2 py-1 ${pt.color}`}>
            <span className="font-bold">{pt.code}</span> — {pt.label}
          </div>
        ))}
      </div>

      <Dialog open={!!addPatient} onOpenChange={open => !open && setAddPatient(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Beteg hozzárendelése — {addPatient?.type && PATIENT_TYPES.find(p => p.code === addPatient.type)?.label} / {addPatient?.date}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1">
              <Label>Melyik beteg érkezik erre a napra?</Label>
              <Select value={selectedPatientId} onValueChange={setSelectedPatientId}>
                <SelectTrigger data-testid="select-patient-dialog">
                  <SelectValue placeholder="Válasszon beteget..." />
                </SelectTrigger>
                <SelectContent>
                  {allPatients?.map(p => (
                    <SelectItem key={p.id} value={String(p.id)}>
                      {p.lastName} {p.firstName}
                      {p.diagnosis ? ` — ${p.diagnosis}` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddPatient(null)}>Mégse</Button>
            <Button
              onClick={handleAssign}
              disabled={!selectedPatientId || updatePatient.isPending}
              data-testid="button-dialog-assign"
            >
              Hozzárendelés
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
