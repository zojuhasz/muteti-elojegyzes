import { useLocation } from "wouter";
import { useListPatients, useListOperatingRooms, useListSurgeons, useCreateSurgery, getListSurgeriesQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { CalendarPlus } from "lucide-react";

const schema = z.object({
  patientId: z.string().min(1, "Válasszon beteget"),
  operatingRoomId: z.string().min(1, "Válasszon műtőtermet"),
  surgeonId: z.string().min(1, "Válasszon sebészt"),
  scheduledDate: z.string().min(1, "Adja meg a dátumot"),
  scheduledTime: z.string().min(1, "Adja meg az időpontot"),
  estimatedDurationMinutes: z.string().optional(),
  surgeryType: z.string().optional(),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

export default function NewBooking() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: patients } = useListPatients();
  const { data: rooms } = useListOperatingRooms();
  const { data: surgeons } = useListSurgeons();
  const createSurgery = useCreateSurgery();

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      patientId: "",
      operatingRoomId: "",
      surgeonId: "",
      scheduledDate: "",
      scheduledTime: "08:00",
      estimatedDurationMinutes: "",
      surgeryType: "",
      notes: "",
    },
  });

  function onSubmit(values: FormValues) {
    const scheduledDate = new Date(`${values.scheduledDate}T${values.scheduledTime}:00`).toISOString();
    createSurgery.mutate({
      data: {
        patientId: Number(values.patientId),
        operatingRoomId: Number(values.operatingRoomId),
        surgeonId: Number(values.surgeonId),
        scheduledDate,
        estimatedDurationMinutes: values.estimatedDurationMinutes ? Number(values.estimatedDurationMinutes) : undefined,
        surgeryType: values.surgeryType || undefined,
        notes: values.notes || undefined,
        status: "scheduled",
      },
    }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListSurgeriesQueryKey() });
        toast({ title: "Műtéti előjegyzés sikeresen rögzítve" });
        setLocation("/mutetek");
      },
      onError: () => {
        toast({ title: "Hiba történt a mentés során", variant: "destructive" });
      },
    });
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarPlus className="w-5 h-5 text-primary" />
          Új műtéti előjegyzés
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <FormField
              control={form.control}
              name="patientId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Beteg</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger data-testid="select-patient">
                        <SelectValue placeholder="Válasszon beteget..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {patients?.map(p => (
                        <SelectItem key={p.id} value={String(p.id)}>
                          {p.lastName} {p.firstName} ({p.birthDate})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="operatingRoomId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Műtőterem</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-room">
                          <SelectValue placeholder="Válasszon műtőtermet..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {rooms?.filter(r => r.isActive).map(r => (
                          <SelectItem key={r.id} value={String(r.id)}>{r.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="surgeonId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Operáló sebész</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-surgeon">
                          <SelectValue placeholder="Válasszon sebészt..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {surgeons?.filter(s => s.isActive).map(s => (
                          <SelectItem key={s.id} value={String(s.id)}>Dr. {s.lastName} {s.firstName}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="scheduledDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Dátum</FormLabel>
                    <FormControl>
                      <Input type="date" data-testid="input-date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="scheduledTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Időpont</FormLabel>
                    <FormControl>
                      <Input type="time" data-testid="input-time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="surgeryType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Műtét típusa</FormLabel>
                    <FormControl>
                      <Input placeholder="pl. Appendectomia" data-testid="input-surgery-type" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="estimatedDurationMinutes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Becsült időtartam (perc)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="pl. 90" data-testid="input-duration" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Megjegyzések</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Egyéb megjegyzések, különleges körülmények..." data-testid="input-notes" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-3 pt-2">
              <Button type="submit" disabled={createSurgery.isPending} data-testid="button-submit">
                {createSurgery.isPending ? "Mentés..." : "Előjegyzés rögzítése"}
              </Button>
              <Button type="button" variant="outline" onClick={() => setLocation("/mutetek")} data-testid="button-cancel">
                Mégse
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
