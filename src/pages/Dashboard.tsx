import { useAuth } from "@/hooks/useAuth";
import { useDashboard } from "@/hooks/useDashboard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const Dashboard = () => {
  const { user } = useAuth();
  const {
    saldoTotal,
    receitasMes,
    despesasMes,
    totalInvestido,
    objetivosAtivos,
    objetivosConcluidos,
    transacoesRecentes,
    loading,
    error
  } = useDashboard();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-red-600">Erro</CardTitle>
            <CardDescription>Ocorreu um erro ao carregar os dados do dashboard</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Debug: confirm auth context reaches Dashboard
  console.log('Dashboard: user from context =', user);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6">
        <h2 className="text-3xl font-bold mb-1">Bem-vindo, {user?.email || 'usuário'}!</h2>
        <p className="text-muted-foreground mb-8">Aqui você organiza e tem controle total da sua vida financeira.</p>
        {/* Cards de Resumo */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Saldo Total</CardDescription>
              <CardTitle className="text-2xl text-primary">
                R$ {saldoTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </CardTitle>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Receitas do Mês</CardDescription>
              <CardTitle className="text-2xl text-green-600">
                R$ {receitasMes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </CardTitle>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Despesas do Mês</CardDescription>
              <CardTitle className="text-2xl text-red-600">
                R$ {despesasMes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </CardTitle>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Objetivos Ativos</CardDescription>
              <CardTitle className="text-2xl text-blue-600">
                {objetivosAtivos}
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
                {transacoesRecentes.length > 0 ? (
                  transacoesRecentes.map((transacao) => (
                    <div key={transacao.id} className="flex justify-between items-center p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{transacao.descricao}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(transacao.data).toLocaleDateString('pt-BR')}
                        </p>
                        {transacao.categoria && (
                          <p className="text-xs text-muted-foreground">{transacao.categoria}</p>
                        )}
                      </div>
                      <span className={`font-semibold ${
                        transacao.tipo === 'receita' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        R$ {Math.abs(transacao.valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground text-center py-4">
                    Nenhuma transação encontrada
                  </p>
                )}
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
                  R$ {receitasMes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span>Total de Despesas:</span>
                <span className="font-semibold text-red-600">
                  R$ {despesasMes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="border-t pt-2">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Saldo do Mês:</span>
                  <span className="font-bold text-primary">
                    R$ {(receitasMes - despesasMes).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
              <div className="mt-4 space-y-2">
                <p className="text-sm text-muted-foreground">
                  Você tem <strong>{objetivosAtivos}</strong> objetivos ativos.
                </p>
                <p className="text-sm text-muted-foreground">
                  Total investido em objetivos: <strong>R$ {totalInvestido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong>
                </p>
                <p className="text-sm text-muted-foreground">
                  Objetivos concluídos: <strong>{objetivosConcluidos}</strong>
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