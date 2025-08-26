import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Cadastro from "./pages/Cadastro";
import ResetSenha from "./pages/ResetSenha";
import Dashboard from "./pages/Dashboard";
import ReceitasDespesas from "./pages/ReceitasDespesas";
import Investimentos from "./pages/Investimentos";
import FolhaPagamento from "./pages/FolhaPagamento";
import Objetivos from "./pages/Objetivos";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/cadastro" element={<Cadastro />} />
          <Route path="/reset-senha" element={<ResetSenha />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/receitas-despesas" element={<ReceitasDespesas />} />
          <Route path="/investimentos" element={<Investimentos />} />
          <Route path="/folha-pagamento" element={<FolhaPagamento />} />
          <Route path="/objetivos" element={<Objetivos />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
