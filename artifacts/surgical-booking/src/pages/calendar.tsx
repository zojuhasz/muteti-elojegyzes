import { useState } from "react";
import { useGetCalendarSurgeries, useListOperatingRooms } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import { format, startOfWeek, addDays, addWeeks, subWeeks } from "date-fns";
import { hu } from "date-fns/locale";
import { Link } from "wouter";

const statusColors: Record<string, string> = {
  scheduled: "bg-primary/15 text-primary border-primary/30",
  in_progress: "bg-orange-100 text-orange-700 border-orange-200",
  completed: "bg-green-100 text-green-700 border-green-200",
  cancelled: "bg-red-100 text-red-600 border-red-200",
};

export default function CalendarPage() {
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date(), { weekStartsOn: 1 }));

  const from = format(weekStart, "yyyy-MM-dd");
  const to = format(addDays(weekStart, 6), "yyyy-MM-dd");

  const { data: surgeries, isLoading } = useGetCalendarSurgeries({ from, to });
  const { data: rooms } = useListOperatingRooms();

  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  function surgeriesFor(roomId: number, day: Date) {
    const dayStr = format(day, "yyyy-MM-dd");
    return surgeries?.filter(s => {
      const sDay = format(new Date(s.scheduledDate), "yyyy-MM-dd");
      return s.operatingRoomId === roomId && sDay === dayStr;
    }) ?? [];
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={() => setWeekStart(w => subWeeks(w, 1))} data-testid="button-prev-week">
          <ChevronLeft className="w-4 h-4" />
        </Button>
        <span className="font-medium text-sm">
          {format(weekStart, "yyyy. MMMM d.", { locale: hu })} – {format(addDays(weekStart, 6), "MMMM d.", { locale: hu })}
        </span>
        <Button variant="outline" size="sm" onClick={() => setWeekStart(w => addWeeks(w, 1))} data-testid="button-next-week">
          <ChevronRight className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="sm" onClick={() => setWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }))} data-testid="button-today">
          Ma
        </Button>
        <Link href="/elojegyzes" className="ml-auto">
          <Button size="sm" data-testid="button-new-booking">Új előjegyzés</Button>
        </Link>
      </div>

      {isLoading ? (
        <Skeleton className="h-64 rounded-xl" />
      ) : (
        <div className="overflow-x-auto">
          <div className="min-w-[900px]">
            <div className="grid grid-cols-8 gap-px bg-border rounded-t-lg overflow-hidden">
              <div className="bg-muted/50 px-3 py-2 text-xs font-medium text-muted-foreground">Műtőterem</div>
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

            {rooms?.filter(r => r.isActive).map(room => (
              <div key={room.id} className="grid grid-cols-8 gap-px bg-border" data-testid={`calendar-row-${room.id}`}>
                <div className="bg-card px-3 py-3 flex items-start">
                  <span className="text-xs font-medium text-foreground">{room.name}</span>
                </div>
                {days.map(day => {
                  const items = surgeriesFor(room.id, day);
                  return (
                    <div key={day.toISOString()} className="bg-card px-1 py-1 min-h-[80px] space-y-1">
                      {items.map(s => (
                        <div
                          key={s.id}
                          className={`text-[10px] rounded border px-1.5 py-1 leading-tight ${statusColors[s.status] ?? "bg-muted text-muted-foreground"}`}
                          data-testid={`cal-surgery-${s.id}`}
                        >
                          <div className="font-medium">{format(new Date(s.scheduledDate), "HH:mm")}</div>
                          <div className="truncate">{s.patient ? `${s.patient.lastName} ${s.patient.firstName}` : "—"}</div>
                          {s.surgeryType && <div className="truncate text-muted-foreground">{s.surgeryType}</div>}
                        </div>
                      ))}
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
            <Calendar className="w-4 h-4 text-primary" />
            Jelmagyarázat
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            {[
              { key: "scheduled", label: "Tervezett" },
              { key: "in_progress", label: "Folyamatban" },
              { key: "completed", label: "Elvégezve" },
              { key: "cancelled", label: "Törölve" },
            ].map(({ key, label }) => (
              <div key={key} className={`text-xs rounded border px-2 py-1 ${statusColors[key]}`}>{label}</div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
