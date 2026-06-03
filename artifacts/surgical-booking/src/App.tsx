import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/auth";
import NotFound from "@/pages/not-found";
import LoginPage from "@/pages/login";
import Dashboard from "@/pages/dashboard";
import Patients from "@/pages/patients";
import PatientDetail from "@/pages/patient-detail";
import Surgeries from "@/pages/surgeries";
import NewBooking from "@/pages/new-booking";
import Surgeons from "@/pages/surgeons";
import OperatingRooms from "@/pages/operating-rooms";
import AdmissionCalendar from "@/pages/admission-calendar";
import SurgeryCalendar from "@/pages/surgery-calendar";
import Layout from "@/components/layout";

const queryClient = new QueryClient();

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/felvetel" component={AdmissionCalendar} />
        <Route path="/naptar" component={SurgeryCalendar} />
        <Route path="/betegek/:id" component={PatientDetail} />
        <Route path="/betegek" component={Patients} />
        <Route path="/mutetek" component={Surgeries} />
        <Route path="/elojegyzes" component={NewBooking} />
        <Route path="/sebeszek" component={Surgeons} />
        <Route path="/mutotermek" component={OperatingRooms} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function AppContent() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-muted-foreground text-sm">Betöltés...</div>
      </div>
    );
  }

  if (!user) return <LoginPage />;

  return (
    <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
      <Router />
    </WouterRouter>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
