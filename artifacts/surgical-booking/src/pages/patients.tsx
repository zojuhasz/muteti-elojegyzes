import { useState } from "react";
import { Link } from "wouter";
import { useListPatients, useDeletePatient, getListPatientsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Search, Plus, Trash2, Eye } from "lucide-react";

const statusLabel: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  waiting: { label: "Várakozó", variant: "secondary" },
  scheduled: { label: "Előjegyezve", variant: "default" },
  operated: { label: "Elvégezve", variant: "outline" },
  cancelled: { label: "Törölve", variant: "destructive" },
};

export default function Patients() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const params: Record<string, string> = {};
  if (search) params.search = search;
  if (status !== "all") params.status = status;

  const { data: patients, isLoading } = useListPatients(params);
  const deletePatient = useDeletePatient();

  function handleDelete(id: number, name: string) {
    if (!confirm(`Biztosan törli ${name} nevű beteget?`)) return;
    deletePatient.mutate({ id }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListPatientsQueryKey() });
        toast({ title: "Beteg törölve" });
      },
      onError: () => {
        toast({ title: "Hiba történt a törlés során", variant: "destructive" });
      },
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground text-sm">{patients?.length ?? 0} beteg</p>
        <Link href="/elojegyzes">
          <Button data-testid="button-new-surgery">
            <Plus className="w-4 h-4 mr-2" />
            Új előjegyzés
          </Button>
        </Link>
      </div>

      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            data-testid="input-search"
            placeholder="Keresés névben, TAJ számban..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-48" data-testid="select-status">
            <SelectValue placeholder="Állapot" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Összes állapot</SelectItem>
            <SelectItem value="waiting">Várakozó</SelectItem>
            <SelectItem value="scheduled">Előjegyezve</SelectItem>
            <SelectItem value="operated">Elvégezve</SelectItem>
            <SelectItem value="cancelled">Törölve</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-16 rounded-lg" />)}
        </div>
      ) : patients?.length === 0 ? (
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
                  <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Beteg neve</th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Születési dátum</th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">TAJ szám</th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Diagnózis</th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Állapot</th>
                  <th className="text-right text-xs font-medium text-muted-foreground px-4 py-3">Műveletek</th>
                </tr>
              </thead>
              <tbody>
                {patients?.map((patient, idx) => {
                  const st = statusLabel[patient.status] ?? { label: patient.status, variant: "outline" as const };
                  return (
                    <tr key={patient.id} className={`border-b last:border-0 hover:bg-muted/20 transition-colors ${idx % 2 === 1 ? "bg-muted/10" : ""}`} data-testid={`row-patient-${patient.id}`}>
                      <td className="px-4 py-3 font-medium">{patient.lastName} {patient.firstName}</td>
                      <td className="px-4 py-3 text-muted-foreground">{patient.birthDate.split("T")[0]}</td>
                      <td className="px-4 py-3 text-muted-foreground">{patient.taj || "—"}</td>
                      <td className="px-4 py-3 text-muted-foreground max-w-48 truncate">{patient.diagnosis || "—"}</td>
                      <td className="px-4 py-3">
                        <Badge variant={st.variant}>{st.label}</Badge>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <Link href={`/betegek/${patient.id}`}>
                            <Button variant="ghost" size="sm" data-testid={`button-view-patient-${patient.id}`}>
                              <Eye className="w-4 h-4" />
                            </Button>
                          </Link>
                          <Button
                            variant="ghost"
                            size="sm"
                            data-testid={`button-delete-patient-${patient.id}`}
                            onClick={() => handleDelete(patient.id, `${patient.lastName} ${patient.firstName}`)}
                            disabled={deletePatient.isPending}
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
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
