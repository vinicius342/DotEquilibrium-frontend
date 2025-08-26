import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const Dashboard = () => {
  const resumoFinanceiro = {
    saldoTotal: 15750.80,
    receitasMes: 8500.00,
    despesasMes: 3200.50,
    investimentos: 45000.00,
    objetivosPendentes: 3
  };

  const transacoesRecentes = [
    { id: 1, descricao: "Salário", valor: 5000, tipo: "receita", data: "2024-01-15" },
    { id: 2, descricao: "Supermercado", valor: -250, tipo: "despesa", data: "2024-01-14" },
    { id: 3, descricao: "Freelance", valor: 1500, tipo: "receita", data: "2024-01-13" },
    { id: 4, descricao: "Conta de luz", valor: -180, tipo: "despesa", data: "2024-01-12" }
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Dashboard Financeiro</h1>
          <nav className="flex gap-4">
            <Link to="/receitas-despesas">
              <Button variant="outline">Receitas & Despesas</Button>
            </Link>
            <Link to="/investimentos">
              <Button variant="outline">Investimentos</Button>
            </Link>
            <Link to="/folha-pagamento">
              <Button variant="outline">Folha de Pagamento</Button>
            </Link>
            <Link to="/objetivos">
              <Button variant="outline">Objetivos</Button>
            </Link>
          </nav>
        </div>

        {/* Cards de Resumo */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Saldo Total</CardDescription>
              <CardTitle className="text-2xl text-primary">
                R$ {resumoFinanceiro.saldoTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </CardTitle>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Receitas do Mês</CardDescription>
              <CardTitle className="text-2xl text-green-600">
                R$ {resumoFinanceiro.receitasMes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </CardTitle>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Despesas do Mês</CardDescription>
              <CardTitle className="text-2xl text-red-600">
                R$ {resumoFinanceiro.despesasMes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </CardTitle>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Investimentos</CardDescription>
              <CardTitle className="text-2xl text-blue-600">
                R$ {resumoFinanceiro.investimentos.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </CardTitle>
            </CardHeader>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Transações Recentes */}
          <Card>
            <CardHeader>
              <CardTitle>Transações Recentes</CardTitle>
              <CardDescription>Últimas movimentações da conta</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {transacoesRecentes.map((transacao) => (
                  <div key={transacao.id} className="flex justify-between items-center p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{transacao.descricao}</p>
                      <p className="text-sm text-muted-foreground">{transacao.data}</p>
                    </div>
                    <span className={`font-semibold ${
                      transacao.tipo === 'receita' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {transacao.tipo === 'receita' ? '+' : ''}R$ {Math.abs(transacao.valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Resumo Mensal */}
          <Card>
            <CardHeader>
              <CardTitle>Resumo do Mês</CardTitle>
              <CardDescription>Análise financeira mensal</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span>Total de Receitas:</span>
                <span className="font-semibold text-green-600">
                  R$ {resumoFinanceiro.receitasMes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span>Total de Despesas:</span>
                <span className="font-semibold text-red-600">
                  R$ {resumoFinanceiro.despesasMes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="border-t pt-2">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Saldo do Mês:</span>
                  <span className="font-bold text-primary">
                    R$ {(resumoFinanceiro.receitasMes - resumoFinanceiro.despesasMes).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
              <div className="mt-4">
                <p className="text-sm text-muted-foreground">
                  Você tem <strong>{resumoFinanceiro.objetivosPendentes}</strong> objetivos financeiros pendentes.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;