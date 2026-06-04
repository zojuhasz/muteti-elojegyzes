import { useState } from "react";
import { useLocation } from "wouter";
import {
  useListOperatingRooms, useListSurgeons,
  useCreateSurgery, useCreatePatient,
  getGetCalendarSurgeriesQueryKey, getListPatientsQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { CalendarPlus } from "lucide-react";

const LATERALITY_OPTIONS = [
  { value: "D", label: "D — Jobb" },
  { value: "S", label: "S — Bal" },
  { value: "U", label: "U — Kétoldali" },
  { value: "N", label: "N — Nem vonatkozik" },
];

const BLOOD_TYPES = ["A+", "A-", "B+", "B-", "AB+", "AB-", "0+", "0-", "ismeretlen"];

const emptyForm = {
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
  operatingRoomId: "",
  scheduledDate: "",
  scheduledTime: "08:00",
};

export default function NewBooking() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [form, setForm] = useState({ ...emptyForm });

  const { data: rooms } = useListOperatingRooms();
  const { data: surgeons } = useListSurgeons();
  const createPatient = useCreatePatient();
  const createSurgery = useCreateSurgery();

  const activeSurgeons = surgeons?.filter(s => s.isActive) ?? [];
  const activeRooms = rooms?.filter(r => r.isActive) ?? [];
  const isSaving = createPatient.isPending || createSurgery.isPending;

  function setF<K extends keyof typeof emptyForm>(key: K, value: (typeof emptyForm)[K]) {
    setForm(f => ({ ...f, [key]: value }));
  }

  function surgeonName(id: string): string {
    if (!id) return "";
    const s = activeSurgeons.find(s => String(s.id) === id);
    return s ? `Dr. ${s.lastName} ${s.firstName}` : "";
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.lastName || !form.firstName || !form.surgeonId || !form.operatingRoomId || !form.scheduledDate) return;

    const scheduledDate = new Date(`${form.scheduledDate}T${form.scheduledTime}:00`).toISOString();

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
        surgeryDate: form.scheduledDate,
        orRoom: activeRooms.find(r => String(r.id) === form.operatingRoomId)?.name,
      },
    }, {
      onSuccess: (patient) => {
        createSurgery.mutate({
          data: {
            patientId: patient.id,
            operatingRoomId: Number(form.operatingRoomId),
            surgeonId: Number(form.surgeonId),
            scheduledDate,
            surgeryType: form.surgery || undefined,
            status: "scheduled",
          },
        }, {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: getListPatientsQueryKey() });
            queryClient.invalidateQueries({ queryKey: getGetCalendarSurgeriesQueryKey() });
            toast({ title: "Beteg felvéve és előjegyezve" });
            setLocation("/mutetek");
          },
          onError: () => toast({ title: "Beteg mentve, de az előjegyzés sikertelen", variant: "destructive" }),
        });
      },
      onError: () => toast({ title: "Hiba a beteg mentésekor", variant: "destructive" }),
    });
  }

  const canSubmit = !!form.lastName && !!form.firstName && !!form.surgeonId && !!form.operatingRoomId && !!form.scheduledDate;

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarPlus className="w-5 h-5 text-primary" />
          Új előjegyzés — beteg felvétele
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-5">

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
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label className="text-sm">Beteg neve — Vezetéknév <span className="text-red-500">*</span></Label>
              <Input
                placeholder="Kovács"
                value={form.lastName}
                onChange={e => setF("lastName", e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label className="text-sm">Keresztnév <span className="text-red-500">*</span></Label>
              <Input
                placeholder="János"
                value={form.firstName}
                onChange={e => setF("firstName", e.target.value)}
              />
            </div>
          </div>

          {/* Születési dátum, TAJ */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label className="text-sm">Születési dátum</Label>
              <Input
                type="date"
                value={form.birthDate}
                onChange={e => setF("birthDate", e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label className="text-sm">TAJ</Label>
              <Input
                placeholder="123 456 789"
                value={form.taj}
                onChange={e => setF("taj", e.target.value)}
              />
            </div>
          </div>

          {/* Elérhetőség, Kórterem */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label className="text-sm">Elérhetőség</Label>
              <Input
                placeholder="+36 30 123 4567"
                value={form.phone}
                onChange={e => setF("phone", e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label className="text-sm">Kórterem</Label>
              <Input
                placeholder="pl. 201"
                value={form.ward}
                onChange={e => setF("ward", e.target.value)}
              />
            </div>
          </div>

          {/* Diagnózis */}
          <div className="space-y-1">
            <Label className="text-sm">Diagnózis</Label>
            <Input
              placeholder="pl. K35 — Appendicitis acuta"
              value={form.diagnosis}
              onChange={e => setF("diagnosis", e.target.value)}
            />
          </div>

          {/* Műtét megnevezése */}
          <div className="space-y-1">
            <Label className="text-sm">Műtét megnevezése</Label>
            <Input
              placeholder="pl. Appendectomia"
              value={form.surgery}
              onChange={e => setF("surgery", e.target.value)}
            />
          </div>

          {/* Laparoszkóp, Háló */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label className="text-sm">Laparoszkóp?</Label>
              <div className="flex gap-4 pt-1.5">
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
              <Label className="text-sm">Háló?</Label>
              <div className="flex gap-4 pt-1.5">
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
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label className="text-sm">Oldaliság</Label>
              <div className="flex flex-wrap gap-3 pt-1.5">
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
              <Label className="text-sm">Vércsoport</Label>
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
            <Label className="text-sm">Egyéb info</Label>
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
            <Label className="text-sm font-semibold">Műtő orvos <span className="text-red-500">*</span></Label>
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
              <Label className="text-sm">{label}</Label>
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

          <hr className="border-border" />

          {/* Műtőterem, Dátum, Időpont */}
          <div className="space-y-1">
            <Label className="text-sm font-semibold">Műtőterem <span className="text-red-500">*</span></Label>
            <Select value={form.operatingRoomId} onValueChange={v => setF("operatingRoomId", v)}>
              <SelectTrigger data-testid="select-room">
                <SelectValue placeholder="Válasszon műtőtermet..." />
              </SelectTrigger>
              <SelectContent>
                {activeRooms.map(r => (
                  <SelectItem key={r.id} value={String(r.id)}>{r.code} — {r.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label className="text-sm font-semibold">Műtét dátuma <span className="text-red-500">*</span></Label>
              <Input
                type="date"
                value={form.scheduledDate}
                onChange={e => setF("scheduledDate", e.target.value)}
                data-testid="input-date"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-sm">Tervezett időpont</Label>
              <Input
                type="time"
                value={form.scheduledTime}
                onChange={e => setF("scheduledTime", e.target.value)}
                data-testid="input-time"
              />
            </div>
          </div>

          {/* Gombok */}
          <div className="flex gap-3 pt-2">
            <Button type="submit" disabled={!canSubmit || isSaving} data-testid="button-submit">
              {isSaving ? "Mentés..." : "Felvétel és előjegyzés"}
            </Button>
            <Button type="button" variant="outline" onClick={() => setLocation("/mutetek")} data-testid="button-cancel">
              Mégse
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
