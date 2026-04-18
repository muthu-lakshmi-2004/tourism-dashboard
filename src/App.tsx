import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";
import NineIslandPage from "./pages/NineIslandPage.tsx";
import GangaBoatPage from "./pages/GangaBoatPage.tsx";
import AccommodationPage from "./pages/AccommodationPage.tsx";
import TransportPage from "./pages/TransportPage.tsx";
import OccupancyPage from "./pages/OccupancyPage.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/nine-island" element={<NineIslandPage />} />
          <Route path="/ganga-boat" element={<GangaBoatPage />} />
          <Route path="/accommodation" element={<AccommodationPage />} />
          <Route path="/transport" element={<TransportPage />} />
          <Route path="/occupancy" element={<OccupancyPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
