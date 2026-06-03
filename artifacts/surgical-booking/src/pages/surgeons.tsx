import { useListSurgeons, useListSurgeries } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Stethoscope, Phone } from "lucide-react";
import { format } from "date-fns";
import { hu } from "date-fns/locale";

export default function Surgeons() {
  const { data: surgeons, isLoading } = useListSurgeons();
  const { data: surgeries } = useListSurgeries({ status: "scheduled" } as never);

  function surgeriesForSurgeon(surgeonId: number) {
    return surgeries?.filter(s => s.surgeonId === surgeonId) ?? [];
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-48 rounded-xl" />)}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <p className="text-muted-foreground text-sm">{surgeons?.length ?? 0} sebész</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {surgeons?.map(surgeon => {
          const upcoming = surgeriesForSurgeon(surgeon.id);
          return (
            <Card key={surgeon.id} data-testid={`card-surgeon-${surgeon.id}`}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Stethoscope className="w-4 h-4 text-primary" />
                      Dr. {surgeon.lastName} {surgeon.firstName}
                    </CardTitle>
                    {surgeon.specialty && (
                      <p className="text-sm text-muted-foreground mt-1">{surgeon.specialty}</p>
                    )}
                  </div>
                  <Badge variant={surgeon.isActive ? "default" : "secondary"}>
                    {surgeon.isActive ? "Aktív" : "Inaktív"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {surgeon.phone && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Phone className="w-3 h-3" />
                    {surgeon.phone}
                  </div>
                )}
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-2">
                    Soron következő műtétek ({upcoming.length})
                  </p>
                  {upcoming.length === 0 ? (
                    <p className="text-xs text-muted-foreground italic">Nincs tervezett műtét</p>
                  ) : (
                    <div className="space-y-1">
                      {upcoming.slice(0, 3).map(s => (
                        <div key={s.id} className="text-xs flex items-center justify-between bg-muted/40 rounded px-2 py-1" data-testid={`surgery-item-${s.id}`}>
                          <span className="truncate">{s.patient ? `${s.patient.lastName} ${s.patient.firstName}` : "—"}</span>
                          <span className="text-muted-foreground ml-2 shrink-0">
                            {format(new Date(s.scheduledDate), "MM. dd. HH:mm", { locale: hu })}
                          </span>
                        </div>
                      ))}
                      {upcoming.length > 3 && (
                        <p className="text-xs text-muted-foreground">+ {upcoming.length - 3} további</p>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
