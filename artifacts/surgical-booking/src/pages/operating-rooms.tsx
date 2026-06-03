import { useListOperatingRooms, useListSurgeries } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { DoorOpen } from "lucide-react";
import { format } from "date-fns";
import { hu } from "date-fns/locale";

export default function OperatingRooms() {
  const { data: rooms, isLoading } = useListOperatingRooms();
  const today = new Date().toISOString().split("T")[0];
  const { data: todaySurgeries } = useListSurgeries({ date: today } as never);

  function surgeriesForRoom(roomId: number) {
    return todaySurgeries?.filter(s => s.operatingRoomId === roomId) ?? [];
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
      <p className="text-muted-foreground text-sm">{rooms?.length ?? 0} műtőterem</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {rooms?.map(room => {
          const todayForRoom = surgeriesForRoom(room.id);
          return (
            <Card key={room.id} data-testid={`card-room-${room.id}`}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-base flex items-center gap-2">
                      <DoorOpen className="w-4 h-4 text-primary" />
                      {room.name}
                    </CardTitle>
                    {room.description && (
                      <p className="text-sm text-muted-foreground mt-1">{room.description}</p>
                    )}
                  </div>
                  <Badge variant={room.isActive ? "default" : "secondary"}>
                    {room.isActive ? "Aktív" : "Inaktív"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-xs font-medium text-muted-foreground mb-2">
                  Mai műtétek ({todayForRoom.length})
                </p>
                {todayForRoom.length === 0 ? (
                  <p className="text-xs text-muted-foreground italic">Nincs mai műtét ebben a teremben</p>
                ) : (
                  <div className="space-y-1">
                    {todayForRoom.map(s => (
                      <div key={s.id} className="text-xs flex items-center justify-between bg-muted/40 rounded px-2 py-1.5" data-testid={`today-surgery-${s.id}`}>
                        <div>
                          <span className="font-medium">
                            {s.patient ? `${s.patient.lastName} ${s.patient.firstName}` : "—"}
                          </span>
                          {s.surgeryType && <span className="text-muted-foreground ml-1">· {s.surgeryType}</span>}
                        </div>
                        <span className="text-muted-foreground ml-2 shrink-0">
                          {format(new Date(s.scheduledDate), "HH:mm", { locale: hu })}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
