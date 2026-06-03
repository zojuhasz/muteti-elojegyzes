import { useRoute, Link } from "wouter";
import { useGetPatient, useListSurgeries, getGetPatientQueryKey, useUpdatePatient } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Calendar, Phone, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { hu } from "date-fns/locale";

const statusLabel: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  waiting: { label: "Várakozó", variant: "secondary" },
  scheduled: { label: "Előjegyezve", variant: "default" },
  operated: { label: "Elvégezve", variant: "outline" },
  cancelled: { label: "Törölve", variant: "destructive" },
};

const surgeryStatusLabel: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  scheduled: { label: "Tervezett", variant: "default" },
  in_progress: { label: "Folyamatban", variant: "secondary" },
  completed: { label: "Elvégezve", variant: "outline" },
  cancelled: { label: "Törölve", variant: "destructive" },
};

export default function PatientDetail() {
  const [, params] = useRoute("/betegek/:id");
  const id = Number(params?.id);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: patient, isLoading } = useGetPatient(id, { query: { enabled: !!id, queryKey: getGetPatientQueryKey(id) } });
  const { data: surgeries, isLoading: surgeriesLoading } = useListSurgeries({ patientId: id } as never);
  const updatePatient = useUpdatePatient();

  function setStatus(status: string) {
    updatePatient.mutate({ id, data: { status } as never }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetPatientQueryKey(id) });
        toast({ title: "Állapot frissítve" });
      },
    });
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-48 rounded-xl" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="text-center py-16 text-muted-foreground">
        Beteg nem található.
        <Link href="/betegek"><Button variant="link">Vissza a listához</Button></Link>
      </div>
    );
  }

  const st = statusLabel[patient.status] ?? { label: patient.status, variant: "outline" as const };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/betegek">
          <Button variant="ghost" size="sm" data-testid="button-back">
            <ArrowLeft className="w-4 h-4 mr-1" /> Vissza
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5 text-primary" />
              Beteg adatai
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-2xl font-semibold">{patient.lastName} {patient.firstName}</p>
              <Badge variant={st.variant} className="mt-2">{st.label}</Badge>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Születési dátum</span>
                <span className="font-medium">{String(patient.birthDate).split("T")[0]}</span>
              </div>
              {patient.taj && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">TAJ szám</span>
                  <span className="font-medium">{patient.taj}</span>
                </div>
              )}
              {patient.phone && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground flex items-center gap-1"><Phone className="w-3 h-3" /> Telefon</span>
                  <span className="font-medium">{patient.phone}</span>
                </div>
              )}
            </div>
            {patient.diagnosis && (
              <div className="border-t pt-3">
                <p className="text-xs text-muted-foreground mb-1">Diagnózis</p>
                <p className="text-sm">{patient.diagnosis}</p>
              </div>
            )}
            {patient.notes && (
              <div className="border-t pt-3">
                <p className="text-xs text-muted-foreground mb-1">Megjegyzések</p>
                <p className="text-sm">{patient.notes}</p>
              </div>
            )}
            <div className="border-t pt-3 space-y-2">
              <p className="text-xs text-muted-foreground">Állapot módosítása</p>
              <div className="flex flex-wrap gap-2">
                {["waiting", "scheduled", "operated", "cancelled"].map(s => (
                  <Button
                    key={s}
                    variant={patient.status === s ? "default" : "outline"}
                    size="sm"
                    data-testid={`button-status-${s}`}
                    onClick={() => setStatus(s)}
                    disabled={patient.status === s || updatePatient.isPending}
                  >
                    {statusLabel[s]?.label}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              Műtéti előzmények
            </CardTitle>
            <Link href="/elojegyzes">
              <Button size="sm" data-testid="button-new-surgery-for-patient">Új előjegyzés</Button>
            </Link>
          </CardHeader>
          <CardContent>
            {surgeriesLoading ? (
              <div className="space-y-2">{[1, 2].map(i => <Skeleton key={i} className="h-14 rounded" />)}</div>
            ) : !surgeries?.length ? (
              <p className="text-center py-8 text-muted-foreground">Nincs rögzített műtét.</p>
            ) : (
              <div className="space-y-3">
                {surgeries.map(surgery => {
                  const ss = surgeryStatusLabel[surgery.status] ?? { label: surgery.status, variant: "outline" as const };
                  return (
                    <div key={surgery.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/20" data-testid={`card-surgery-${surgery.id}`}>
                      <div>
                        <p className="font-medium text-sm">{surgery.surgeryType || "Nem megadott típus"}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {format(new Date(surgery.scheduledDate), "yyyy. MMMM d. HH:mm", { locale: hu })}
                          {surgery.operatingRoom && ` · ${surgery.operatingRoom.name}`}
                          {surgery.surgeon && ` · Dr. ${surgery.surgeon.lastName} ${surgery.surgeon.firstName}`}
                        </p>
                      </div>
                      <Badge variant={ss.variant}>{ss.label}</Badge>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
