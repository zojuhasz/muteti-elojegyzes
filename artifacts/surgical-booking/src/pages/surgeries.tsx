import { useState } from "react";
import { Link } from "wouter";
import { useListSurgeries, useListOperatingRooms, useListSurgeons, useDeleteSurgery, getListSurgeriesQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { hu } from "date-fns/locale";

const statusLabel: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  scheduled: { label: "Tervezett", variant: "default" },
  in_progress: { label: "Folyamatban", variant: "secondary" },
  completed: { label: "Elvégezve", variant: "outline" },
  cancelled: { label: "Törölve", variant: "destructive" },
};

export default function Surgeries() {
  const [filterDate, setFilterDate] = useState("");
  const [filterRoom, setFilterRoom] = useState("all");
  const [filterSurgeon, setFilterSurgeon] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const params: Record<string, string | number> = {};
  if (filterDate) params.date = filterDate;
  if (filterRoom !== "all") params.operatingRoomId = Number(filterRoom);
  if (filterSurgeon !== "all") params.surgeonId = Number(filterSurgeon);
  if (filterStatus !== "all") params.status = filterStatus;

  const { data: surgeries, isLoading } = useListSurgeries(params as never);
  const { data: rooms } = useListOperatingRooms();
  const { data: surgeons } = useListSurgeons();
  const deleteSurgery = useDeleteSurgery();

  function handleDelete(id: number) {
    if (!confirm("Biztosan törli ezt a műtéti előjegyzést?")) return;
    deleteSurgery.mutate({ id }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListSurgeriesQueryKey() });
        toast({ title: "Előjegyzés törölve" });
      },
      onError: () => {
        toast({ title: "Hiba történt a törlés során", variant: "destructive" });
      },
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground text-sm">{surgeries?.length ?? 0} előjegyzés</p>
        <Link href="/elojegyzes">
          <Button data-testid="button-new-booking">
            <Plus className="w-4 h-4 mr-2" />
            Új előjegyzés
          </Button>
        </Link>
      </div>

      <div className="flex flex-wrap gap-3">
        <Input
          type="date"
          value={filterDate}
          onChange={e => setFilterDate(e.target.value)}
          className="w-44"
          data-testid="input-filter-date"
        />
        <Select value={filterRoom} onValueChange={setFilterRoom}>
          <SelectTrigger className="w-44" data-testid="select-filter-room">
            <SelectValue placeholder="Műtőterem" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Összes műtőterem</SelectItem>
            {rooms?.map(r => <SelectItem key={r.id} value={String(r.id)}>{r.name}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={filterSurgeon} onValueChange={setFilterSurgeon}>
          <SelectTrigger className="w-48" data-testid="select-filter-surgeon">
            <SelectValue placeholder="Sebész" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Összes sebész</SelectItem>
            {surgeons?.map(s => <SelectItem key={s.id} value={String(s.id)}>Dr. {s.lastName} {s.firstName}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-44" data-testid="select-filter-status">
            <SelectValue placeholder="Állapot" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Összes állapot</SelectItem>
            <SelectItem value="scheduled">Tervezett</SelectItem>
            <SelectItem value="in_progress">Folyamatban</SelectItem>
            <SelectItem value="completed">Elvégezve</SelectItem>
            <SelectItem value="cancelled">Törölve</SelectItem>
          </SelectContent>
        </Select>
        {(filterDate || filterRoom !== "all" || filterSurgeon !== "all" || filterStatus !== "all") && (
          <Button variant="ghost" size="sm" onClick={() => { setFilterDate(""); setFilterRoom("all"); setFilterSurgeon("all"); setFilterStatus("all"); }}>
            Szűrők törlése
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-16 rounded-lg" />)}
        </div>
      ) : surgeries?.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            Nincs találat a megadott feltételekre.
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/40">
                  <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Dátum / Idő</th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Beteg</th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Műtőterem</th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Sebész</th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Típus</th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Állapot</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {surgeries?.map((surgery, idx) => {
                  const st = statusLabel[surgery.status] ?? { label: surgery.status, variant: "outline" as const };
                  return (
                    <tr key={surgery.id} className={`border-b last:border-0 hover:bg-muted/20 transition-colors ${idx % 2 === 1 ? "bg-muted/10" : ""}`} data-testid={`row-surgery-${surgery.id}`}>
                      <td className="px-4 py-3 text-sm font-medium whitespace-nowrap">
                        {format(new Date(surgery.scheduledDate), "yyyy. MM. dd.", { locale: hu })}
                        <br />
                        <span className="text-muted-foreground text-xs">{format(new Date(surgery.scheduledDate), "HH:mm")}</span>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {surgery.patient
                          ? <Link href={`/betegek/${surgery.patientId}`} className="hover:underline text-primary">{surgery.patient.lastName} {surgery.patient.firstName}</Link>
                          : "—"}
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">{surgery.operatingRoom?.name || "—"}</td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">
                        {surgery.surgeon ? `Dr. ${surgery.surgeon.lastName} ${surgery.surgeon.firstName}` : "—"}
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground max-w-36 truncate">{surgery.surgeryType || "—"}</td>
                      <td className="px-4 py-3"><Badge variant={st.variant}>{st.label}</Badge></td>
                      <td className="px-4 py-3">
                        <Button
                          variant="ghost"
                          size="sm"
                          data-testid={`button-delete-surgery-${surgery.id}`}
                          onClick={() => handleDelete(surgery.id)}
                          disabled={deleteSurgery.isPending}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
