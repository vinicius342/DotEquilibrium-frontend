import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const Investimentos = () => {
  const [investimentos, setInvestimentos] = useState([
    { id: 1, nome: "Tesouro Selic", valor: 15000, rentabilidade: 12.5, tipo: "Renda Fixa", data: "2024-01-10" },
    { id: 2, nome: "Ações PETR4", valor: 8000, rentabilidade: -5.2, tipo: "Ações", data: "2024-01-08" },
    { id: 3, nome: "CDB Banco Inter", valor: 12000, rentabilidade: 15.8, tipo: "Renda Fixa", data: "2024-01-05" },
    { id: 4, nome: "Fundo Imobiliário", valor: 10000, rentabilidade: 8.7, tipo: "FIIs", data: "2024-01-03" }
  ]);

  const [novoInvestimento, setNovoInvestimento] = useState({
    nome: "",
    valor: "",
    tipo: "",
    data: ""
  });

  const tiposInvestimento = ["Renda Fixa", "Ações", "FIIs", "Criptomoedas", "Outros"];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!novoInvestimento.nome || !novoInvestimento.valor || !novoInvestimento.tipo || !novoInvestimento.data) {
      alert("Preencha todos os campos");
      return;
    }

    const investimento = {
      id: Date.now(),
      nome: novoInvestimento.nome,
      valor: parseFloat(novoInvestimento.valor),
      rentabilidade: 0,
      tipo: novoInvestimento.tipo,
      data: novoInvestimento.data
    };

    setInvestimentos([investimento, ...investimentos]);
    setNovoInvestimento({
      nome: "",
      valor: "",
      tipo: "",
      data: ""
    });
  };

  const valorTotal = investimentos.reduce((sum, inv) => sum + inv.valor, 0);
  const rentabilidadeMedia = investimentos.reduce((sum, inv) => sum + inv.rentabilidade, 0) / investimentos.length;

  const investimentosPorTipo = tiposInvestimento.map(tipo => {
    const investsTipo = investimentos.filter(inv => inv.tipo === tipo);
    const valorTipo = investsTipo.reduce((sum, inv) => sum + inv.valor, 0);
    return { tipo, valor: valorTipo, quantidade: investsTipo.length };
  }).filter(item => item.valor > 0);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Investimentos</h1>
          <Link to="/dashboard">
            <Button variant="outline">Voltar ao Dashboard</Button>
          </Link>
        </div>

        {/* Resumo dos Investimentos */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Patrimônio Total</CardDescription>
              <CardTitle className="text-2xl text-primary">
                R$ {valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </CardTitle>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Rentabilidade Média</CardDescription>
              <CardTitle className={`text-2xl ${rentabilidadeMedia >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {rentabilidadeMedia.toFixed(2)}%
              </CardTitle>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total de Ativos</CardDescription>
              <CardTitle className="text-2xl text-primary">
                {investimentos.length}
              </CardTitle>
            </CardHeader>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Formulário para Novo Investimento */}
          <Card>
            <CardHeader>
              <CardTitle>Adicionar Investimento</CardTitle>
              <CardDescription>Registre um novo investimento</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="nome">Nome do Investimento</Label>
                  <Input
                    id="nome"
                    value={novoInvestimento.nome}
                    onChange={(e) => setNovoInvestimento({...novoInvestimento, nome: e.target.value})}
                    placeholder="Ex: Tesouro Direto, Ações PETR4..."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="valor">Valor Investido</Label>
                  <Input
                    id="valor"
                    type="number"
                    step="0.01"
                    value={novoInvestimento.valor}
                    onChange={(e) => setNovoInvestimento({...novoInvestimento, valor: e.target.value})}
                    placeholder="0,00"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tipo">Tipo de Investimento</Label>
                  <Select value={novoInvestimento.tipo} onValueChange={(value) => setNovoInvestimento({...novoInvestimento, tipo: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      {tiposInvestimento.map((tipo) => (
                        <SelectItem key={tipo} value={tipo}>{tipo}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="data">Data do Investimento</Label>
                  <Input
                    id="data"
                    type="date"
                    value={novoInvestimento.data}
                    onChange={(e) => setNovoInvestimento({...novoInvestimento, data: e.target.value})}
                  />
                </div>

                <Button type="submit" className="w-full">
                  Adicionar Investimento
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Portfólio */}
          <Card>
            <CardHeader>
              <CardTitle>Seu Portfólio</CardTitle>
              <CardDescription>Distribuição dos seus investimentos</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {investimentosPorTipo.map((item) => (
                  <div key={item.tipo} className="flex justify-between items-center p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{item.tipo}</p>
                      <p className="text-sm text-muted-foreground">{item.quantidade} ativo(s)</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">
                        R$ {item.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {((item.valor / valorTotal) * 100).toFixed(1)}%
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Lista de Investimentos */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Todos os Investimentos</CardTitle>
            <CardDescription>Histórico completo dos seus investimentos</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {investimentos.map((investimento) => (
                <div key={investimento.id} className="flex justify-between items-center p-4 border rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium">{investimento.nome}</p>
                    <p className="text-sm text-muted-foreground">{investimento.tipo} • {investimento.data}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">
                      R$ {investimento.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                    <p className={`text-sm font-medium ${
                      investimento.rentabilidade >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {investimento.rentabilidade >= 0 ? '+' : ''}{investimento.rentabilidade.toFixed(2)}%
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Investimentos;