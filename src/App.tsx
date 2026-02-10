import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { FundProvider } from "./context/FundContext";
import Index from "./pages/Index";
import Portfolio from "./pages/Portfolio";
import Watchlist from "./pages/Watchlist";
import FundChart from "./pages/FundChart";
import Earnings from "./pages/Earnings";
import TotalReturns from "./pages/TotalReturns";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <FundProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/portfolio" element={<Portfolio />} />
            <Route path="/watchlist" element={<Watchlist />} />
            <Route path="/fund-chart" element={<FundChart />} />
            <Route path="/earnings" element={<Earnings />} />
            <Route path="/total-returns" element={<TotalReturns />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </FundProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
