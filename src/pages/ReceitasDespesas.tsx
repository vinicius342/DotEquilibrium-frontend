import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const ReceitasDespesas = () => {
  const [transacoes, setTransacoes] = useState([
    { id: 1, descricao: "Salário", valor: 5000, categoria: "Trabalho", tipo: "receita", data: "2024-01-15" },
    { id: 2, descricao: "Supermercado", valor: 250, categoria: "Alimentação", tipo: "despesa", data: "2024-01-14" },
    { id: 3, descricao: "Freelance", valor: 1500, categoria: "Trabalho", tipo: "receita", data: "2024-01-13" },
    { id: 4, descricao: "Conta de luz", valor: 180, categoria: "Contas", tipo: "despesa", data: "2024-01-12" }
  ]);

  const [novaTransacao, setNovaTransacao] = useState({
    descricao: "",
    valor: "",
    categoria: "",
    tipo: "receita",
    data: ""
  });

  const categorias = {
    receita: ["Trabalho", "Freelance", "Investimentos", "Outros"],
    despesa: ["Alimentação", "Transporte", "Contas", "Lazer", "Saúde", "Outros"]
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!novaTransacao.descricao || !novaTransacao.valor || !novaTransacao.categoria || !novaTransacao.data) {
      alert("Preencha todos os campos");
      return;
    }

    const transacao = {
      id: Date.now(),
      descricao: novaTransacao.descricao,
      valor: parseFloat(novaTransacao.valor),
      categoria: novaTransacao.categoria,
      tipo: novaTransacao.tipo,
      data: novaTransacao.data
    };

    setTransacoes([transacao, ...transacoes]);
    setNovaTransacao({
      descricao: "",
      valor: "",
      categoria: "",
      tipo: "receita",
      data: ""
    });
  };

  const receitas = transacoes.filter(t => t.tipo === "receita");
  const despesas = transacoes.filter(t => t.tipo === "despesa");
  const totalReceitas = receitas.reduce((sum, r) => sum + r.valor, 0);
  const totalDespesas = despesas.reduce((sum, d) => sum + d.valor, 0);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Receitas & Despesas</h1>
          <Link to="/dashboard">
            <Button variant="outline">Voltar ao Dashboard</Button>
          </Link>
        </div>

        {/* Resumo */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Receitas</CardDescription>
              <CardTitle className="text-2xl text-green-600">
                R$ {totalReceitas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </CardTitle>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Despesas</CardDescription>
              <CardTitle className="text-2xl text-red-600">
                R$ {totalDespesas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </CardTitle>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Saldo</CardDescription>
              <CardTitle className={`text-2xl ${(totalReceitas - totalDespesas) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                R$ {(totalReceitas - totalDespesas).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </CardTitle>
            </CardHeader>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Formulário para Nova Transação */}
          <Card>
            <CardHeader>
              <CardTitle>Adicionar Transação</CardTitle>
              <CardDescription>Registre uma nova receita ou despesa</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="tipo">Tipo</Label>
                  <Select value={novaTransacao.tipo} onValueChange={(value) => setNovaTransacao({...novaTransacao, tipo: value, categoria: ""})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="receita">Receita</SelectItem>
                      <SelectItem value="despesa">Despesa</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="descricao">Descrição</Label>
                  <Input
                    id="descricao"
                    value={novaTransacao.descricao}
                    onChange={(e) => setNovaTransacao({...novaTransacao, descricao: e.target.value})}
                    placeholder="Ex: Salário, Supermercado..."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="valor">Valor</Label>
                  <Input
                    id="valor"
                    type="number"
                    step="0.01"
                    value={novaTransacao.valor}
                    onChange={(e) => setNovaTransacao({...novaTransacao, valor: e.target.value})}
                    placeholder="0,00"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="categoria">Categoria</Label>
                  <Select value={novaTransacao.categoria} onValueChange={(value) => setNovaTransacao({...novaTransacao, categoria: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      {categorias[novaTransacao.tipo as keyof typeof categorias].map((cat) => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="data">Data</Label>
                  <Input
                    id="data"
                    type="date"
                    value={novaTransacao.data}
                    onChange={(e) => setNovaTransacao({...novaTransacao, data: e.target.value})}
                  />
                </div>

                <Button type="submit" className="w-full">
                  Adicionar Transação
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Lista de Transações */}
          <Card>
            <CardHeader>
              <CardTitle>Transações</CardTitle>
              <CardDescription>Histórico de receitas e despesas</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="todas">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="todas">Todas</TabsTrigger>
                  <TabsTrigger value="receitas">Receitas</TabsTrigger>
                  <TabsTrigger value="despesas">Despesas</TabsTrigger>
                </TabsList>

                <TabsContent value="todas" className="mt-4">
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {transacoes.map((transacao) => (
                      <div key={transacao.id} className="flex justify-between items-center p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{transacao.descricao}</p>
                          <p className="text-sm text-muted-foreground">{transacao.categoria} • {transacao.data}</p>
                        </div>
                        <span className={`font-semibold ${
                          transacao.tipo === 'receita' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {transacao.tipo === 'receita' ? '+' : '-'}R$ {transacao.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="receitas" className="mt-4">
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {receitas.map((transacao) => (
                      <div key={transacao.id} className="flex justify-between items-center p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{transacao.descricao}</p>
                          <p className="text-sm text-muted-foreground">{transacao.categoria} • {transacao.data}</p>
                        </div>
                        <span className="font-semibold text-green-600">
                          +R$ {transacao.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="despesas" className="mt-4">
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {despesas.map((transacao) => (
                      <div key={transacao.id} className="flex justify-between items-center p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{transacao.descricao}</p>
                          <p className="text-sm text-muted-foreground">{transacao.categoria} • {transacao.data}</p>
                        </div>
                        <span className="font-semibold text-red-600">
                          -R$ {transacao.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ReceitasDespesas;