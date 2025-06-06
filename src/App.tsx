
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/components/SimpleAuthProvider";
import { AnalyticsProvider } from "@/components/AnalyticsProvider";
import { PerformanceTracker } from "@/components/Analytics/PerformanceTracker";
import ProtectedRoute from "@/components/ProtectedRoute";
import AdminRoute from "@/components/Admin/AdminRoute";
import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import Journal from "./pages/Journal";
import Settings from "./pages/Settings";
import AdminDashboard from "./pages/AdminDashboard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <AnalyticsProvider>
        <TooltipProvider>
          <PerformanceTracker />
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/journal" element={
                <ProtectedRoute>
                  <Journal />
                </ProtectedRoute>
              } />
              <Route path="/settings" element={
                <ProtectedRoute>
                  <Settings />
                </ProtectedRoute>
              } />
              <Route path="/admin" element={
                <AdminRoute>
                  <AdminDashboard />
                </AdminRoute>
              } />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AnalyticsProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
