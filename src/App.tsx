import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { WalletProvider } from "./contexts/WalletContext";

import Index from "./pages/Index";
import CreateGift from "./pages/CreateGift";
import ClaimGift from "./pages/ClaimGift";
import About from "./pages/About";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import NotFound from "./pages/NotFound";
import MyGiftCards from "./pages/MyGiftCards";
import Profile from "./pages/Profile";
import Marketplace from "./pages/Marketplace";
import CategoryCards from "./pages/CategoryCards";
import CardDetail from "./pages/CardDetail";
import CreateBackground from "./pages/CreateBackground";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <WalletProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner position="top-center" />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/about" element={<About />} />
            <Route path="/create" element={<CreateGift />} />
            <Route path="/claim" element={<ClaimGift />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/my-gift-cards" element={<MyGiftCards />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/marketplace" element={<Marketplace />} />
            <Route path="/marketplace/:categoryId" element={<CategoryCards />} />
            <Route path="/marketplace/:categoryId/:cardId" element={<CardDetail />} />
            <Route path="/create-background" element={<CreateBackground />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </WalletProvider>
  </QueryClientProvider>
);

export default App;
