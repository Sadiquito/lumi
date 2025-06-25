
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import Chat from "./pages/Chat";
import Journal from "./pages/Journal";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <div 
    className="min-h-screen"
    style={{ 
      backgroundColor: 'rgb(15, 23, 42)', // Explicit cosmic background
      color: 'rgb(248, 250, 252)' // Explicit starlight text
    }}
  >
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/chat" element={<Chat />} />
              <Route path="/journal" element={<Journal />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  </div>
);

export default App;
