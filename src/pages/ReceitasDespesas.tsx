import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useFinanceData } from "@/hooks/useFinanceData";
import { financeAPI } from "@/services/api";
import { Loader2, AlertCircle, Trash2, Edit2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

const ReceitasDespesas = () => {
  const {
    transactions,
    categories,
    incomes,
    expenses,
    totalIncomes,
    totalExpenses,
    balance,
    loading,
    error,
    createTransaction,
    deleteTransaction,
    refreshData,
    recurringBills,
    createRecurringBill,
    deleteRecurringBill,
    totalRecurringBills,
  } = useFinanceData();

  const [novaTransacao, setNovaTransacao] = useState({
    descricao: "",
    valor: "",
    categoria: "",
    tipo: "income" as "income" | "expense"
  });

  const [novaCategoria, setNovaCategoria] = useState("");
  const [categoriaEditando, setCategoriaEditando] = useState<number | null>(null);
  const [nomeEditando, setNomeEditando] = useState("");
  const [catLoading, setCatLoading] = useState(false);

  // Remover simulação local de contas mensais
  // const [contasMensais, setContasMensais] = useState<any[]>([]); // Simulação local
  // const totalContasAPagar = contasMensais.reduce((acc, conta) => acc + Number(conta.valor || 0), 0);

  // Novo estado para formulário de conta mensal
  const [novaConta, setNovaConta] = useState({
    descricao: "",
    valor: "",
    dia: "1",
    frequencia: "monthly",
    categoria: "none",
  });
  const [contaLoading, setContaLoading] = useState(false);

  // Estado para armazenar contas recorrentes com dados do período
  const [recurringBillsWithPeriod, setRecurringBillsWithPeriod] = useState<any[]>([]);

  // Estado para controlar o mês selecionado (padrão: mês atual)
  const [mesSelecionado, setMesSelecionado] = useState(() => {
    const hoje = new Date();
    return `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, '0')}`;
  });

  // Buscar contas recorrentes com dados do período selecionado
  const fetchRecurringBillsForPeriod = async (year: number, month: number) => {
    try {
      const response = await financeAPI.get(`/api/finance/recurring-bills/?year=${year}&month=${month}`);
      console.log('Response from API:', response); // Debug log
      
      // Verificar se response tem a estrutura esperada
      const bills = Array.isArray(response) ? response : (response.data || response.results || []);
      
      // Calcular o último dia do mês selecionado
      const lastDayOfMonth = new Date(year, month, 0, 23, 59, 59, 999);
      return bills
        .filter((bill: any) => {
          // Só mostrar contas criadas até o último dia do mês selecionado
          if (!bill.created_at) return true;
          const created = new Date(bill.created_at);
          if (created.getTime() > lastDayOfMonth.getTime()) return false;
          
          // Se foi desativada, só mostrar se foi desativada após o mês selecionado
          if (bill.deactivated_at) {
            const deactivated = new Date(bill.deactivated_at);
            const firstDayOfMonth = new Date(year, month - 1, 1);
            return deactivated.getTime() > firstDayOfMonth.getTime();
          }
          
          return true;
        })
        .map((bill: any) => {
          let status_for_period = bill.payment_for_period?.status || 'pending';
          let due_date = bill.payment_for_period?.due_date;
          // Se não existe payment_for_period, calcular o vencimento do mês
          if (!bill.payment_for_period) {
            // Calcular a data de vencimento para o mês/ano consultado
            const venc = new Date(year, month - 1, bill.due_day);
            const hoje = new Date();
            hoje.setHours(0,0,0,0);
            if (venc.getTime() < hoje.getTime()) {
              status_for_period = 'overdue';
            }
          } else if (status_for_period === 'pending' && due_date) {
            // Se está pendente e o vencimento já passou
            const hoje = new Date();
            hoje.setHours(0,0,0,0);
            const venc = new Date(due_date);
            if (venc.getTime() < hoje.getTime()) {
              status_for_period = 'overdue';
            }
          }
          return {
            ...bill,
            status_for_period,
            payment_id: bill.payment_for_period?.id || null,
            paid_date: bill.payment_for_period?.paid_date || null,
            amount_paid: bill.payment_for_period?.amount_paid || null,
          };
        });
    } catch (error) {
      console.error('Erro ao buscar contas recorrentes do período:', error);
      return [];
    }
  };

  // Effect para buscar dados quando o mês mudar
  useEffect(() => {
    const loadDataForPeriod = async () => {
      const [year, month] = mesSelecionado.split('-').map(Number);
      const billsForPeriod = await fetchRecurringBillsForPeriod(year, month);
      setRecurringBillsWithPeriod(billsForPeriod);
    };

    if (mesSelecionado) {
      loadDataForPeriod();
    }
  }, [mesSelecionado, recurringBills]);

  const [submitting, setSubmitting] = useState(false);
  const [modalTransacaoAberto, setModalTransacaoAberto] = useState(false);
  const [modalContaAberto, setModalContaAberto] = useState(false);
  const [modalNovaCategoriaAberto, setModalNovaCategoriaAberto] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!novaTransacao.descricao || !novaTransacao.valor || !novaTransacao.categoria) {
      alert("Preencha todos os campos");
      return;
    }
    try {
      setSubmitting(true);
      // Corrige a data para o fuso horário local
      const hoje = new Date();
      const dataFormatada = hoje.toLocaleDateString('sv-SE'); // yyyy-mm-dd
      await createTransaction({
        title: novaTransacao.descricao,
        description: novaTransacao.descricao,
        amount: parseFloat(novaTransacao.valor),
        categoryId: parseInt(novaTransacao.categoria),
        date: dataFormatada,
        type: novaTransacao.tipo,
      });
      setNovaTransacao({
        descricao: "",
        valor: "",
        categoria: "",
        tipo: "income"
      });
    } catch (err) {
      console.error('Erro ao criar transação:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number, type: "income" | "expense") => {
    if (confirm("Tem certeza que deseja excluir esta transação?")) {
      try {
        await deleteTransaction(id, type);
      } catch (err) {
        console.error('Erro ao deletar transação:', err);
      }
    }
  };

  // Funções para gerenciar categorias
  const handleAddCategoria = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!novaCategoria.trim()) return;

    setCatLoading(true);
    try {
      await financeAPI.createCategory({ name: novaCategoria.trim() });
      setNovaCategoria("");
      await refreshData();
    } catch (err) {
      console.error('Erro ao adicionar categoria:', err);
      alert("Erro ao adicionar categoria");
    } finally {
      setCatLoading(false);
    }
  };

  const handleEditCategoria = async (id: number) => {
    if (!nomeEditando.trim()) return;

    setCatLoading(true);
    try {
      await financeAPI.updateCategory(id, { name: nomeEditando.trim() });
      setCategoriaEditando(null);
      setNomeEditando("");
      await refreshData();
    } catch (err) {
      console.error('Erro ao editar categoria:', err);
      alert("Erro ao editar categoria");
    } finally {
      setCatLoading(false);
    }
  };

  const handleDeleteCategoria = async (id: number) => {
    if (!confirm("Tem certeza que deseja excluir esta categoria?")) return;

    setCatLoading(true);
    try {
      await financeAPI.deleteCategory(id);
      await refreshData();
    } catch (err) {
      console.error('Erro ao excluir categoria:', err);
      alert("Erro ao excluir categoria");
    } finally {
      setCatLoading(false);
    }
  };

  // Função para adicionar conta mensal recorrente
  const handleAddConta = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!novaConta.descricao.trim() || !novaConta.valor || !novaConta.dia) {
      alert("Preencha todos os campos obrigatórios");
      return;
    }
    setContaLoading(true);
    try {
      await createRecurringBill({
        name: novaConta.descricao,
        description: "",
        value: parseFloat(novaConta.valor),
        due_day: parseInt(novaConta.dia),
        frequency: novaConta.frequencia as any,
        category: novaConta.categoria === "none" ? null : parseInt(novaConta.categoria),
        is_active: true,
        status: 'pending',
      });
      setNovaConta({ descricao: "", valor: "", dia: "1", frequencia: "monthly", categoria: "none" });
      alert("Conta mensal adicionada com sucesso!");
      await refreshData();
    } catch (err) {
      console.error('Erro ao adicionar conta mensal:', err);
      alert("Erro ao adicionar conta mensal");
    } finally {
      setContaLoading(false);
    }
  };

  // Atualiza status para overdue se passar do vencimento e não estiver pago
  useEffect(() => {
    const today = new Date();
    recurringBills.forEach(async (bill) => {
      if (
        bill.status !== "paid" &&
        bill.status !== "overdue" &&
        bill.is_active &&
        bill.due_day < today.getDate()
      ) {
        // Atualiza para overdue
        await financeAPI.updateRecurringBill(bill.id, { status: "overdue" });
        await refreshData();
      }
    });
    // eslint-disable-next-line
  }, [recurringBills]);

  // Função para marcar como pago para o período específico
  const handleMarkAsPaidForPeriod = async (billId: number) => {
    const [year, month] = mesSelecionado.split('-').map(Number);
    try {
      await financeAPI.post(`/api/finance/recurring-bills/${billId}/mark_paid/`, {
        year,
        month
      });
      // Recarregar os dados do período
      const billsForPeriod = await fetchRecurringBillsForPeriod(year, month);
      setRecurringBillsWithPeriod(billsForPeriod);
      await refreshData();
    } catch (err) {
      console.error('Erro ao marcar conta como paga:', err);
      alert("Erro ao marcar conta como paga");
    }
  };

  // Função para marcar como pendente para o período específico
  const handleMarkAsPendingForPeriod = async (billId: number) => {
    const [year, month] = mesSelecionado.split('-').map(Number);
    try {
      await financeAPI.post(`/api/finance/recurring-bills/${billId}/mark_pending/`, {
        year,
        month
      });
      // Recarregar os dados do período
      const billsForPeriod = await fetchRecurringBillsForPeriod(year, month);
      setRecurringBillsWithPeriod(billsForPeriod);
      await refreshData();
    } catch (err) {
      console.error('Erro ao marcar conta como pendente:', err);
      alert("Erro ao marcar conta como pendente");
    }
  };

  // Função para desativar conta mensal recorrente (em vez de deletar)
  const handleDeactivateRecurringBill = async (billId: number) => {
    if (!confirm('Tem certeza que deseja desativar esta conta mensal? Ela não aparecerá mais nos próximos meses, mas o histórico será mantido.')) return;

    try {
      // Usar uma chamada API personalizada para desativar
      await financeAPI.post(`/api/finance/recurring-bills/${billId}/deactivate/`, {});
      
      // Recarregar os dados
      const [year, month] = mesSelecionado.split('-').map(Number);
      const billsForPeriod = await fetchRecurringBillsForPeriod(year, month);
      setRecurringBillsWithPeriod(billsForPeriod);
      await refreshData();
    } catch (err) {
      console.error('Erro ao desativar conta mensal:', err);
      alert("Erro ao desativar conta mensal");
    }
  };

  // Filtrar transações baseado no mês selecionado
  const transacoesFiltradas = transactions.filter((transaction) => {
    const dataTransacao = new Date(transaction.date);
    const [anoSelecionado, mesSelecionadoNum] = mesSelecionado.split('-').map(Number);
    
    return dataTransacao.getFullYear() === anoSelecionado && 
           (dataTransacao.getMonth() + 1) === mesSelecionadoNum;
  });

  const receitasFiltradas = incomes.filter((income) => {
    const dataTransacao = new Date(income.date);
    const [anoSelecionado, mesSelecionadoNum] = mesSelecionado.split('-').map(Number);
    
    return dataTransacao.getFullYear() === anoSelecionado && 
           (dataTransacao.getMonth() + 1) === mesSelecionadoNum;
  });

  const despesasFiltradas = expenses.filter((expense) => {
    const dataTransacao = new Date(expense.date);
    const [anoSelecionado, mesSelecionadoNum] = mesSelecionado.split('-').map(Number);
    
    return dataTransacao.getFullYear() === anoSelecionado && 
           (dataTransacao.getMonth() + 1) === mesSelecionadoNum;
  });

  // Filtrar contas recorrentes baseado no mês selecionado
  // Nota: Agora usamos recurringBillsWithPeriod que já tem os dados do período específico

  // Cálculo dos totais baseado nas transações filtradas
  const totalReceitasFiltradas = receitasFiltradas.reduce((acc, income) => acc + Number(income.amount), 0);
  const totalDespesasFiltradas = despesasFiltradas.reduce((acc, expense) => acc + Number(expense.amount), 0);

  // Cálculo baseado nas contas recorrentes com dados do período específico
  const totalContasPagasPeriodo = recurringBillsWithPeriod
    .filter((bill) => bill.status_for_period === 'paid')
    .reduce((acc, bill) => acc + Number(bill.amount_paid || bill.value), 0);

  const totalContasAPagarPeriodo = recurringBillsWithPeriod
    .filter((bill) => bill.status_for_period !== 'paid' && bill.is_active)
    .reduce((acc, bill) => acc + Number(bill.value), 0);

  const safeTotalIncomes = Number(totalReceitasFiltradas) || 0;
  const safeTotalExpenses = Number(totalDespesasFiltradas) || 0;
  const safeBalance = safeTotalIncomes - safeTotalExpenses - totalContasPagasPeriodo;

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Carregando dados financeiros...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6">
        {/* Card Contas a Pagar */}

        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Receitas & Despesas</h1>
          <div className="flex items-center gap-2">
            <Label htmlFor="mes-selecionado" className="text-sm font-medium">
              Mês:
            </Label>
            <Input
              id="mes-selecionado"
              type="month"
              value={mesSelecionado}
              onChange={(e) => setMesSelecionado(e.target.value)}
            />
          </div>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Resumo */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Receitas</CardDescription>
              <CardTitle className="text-2xl text-green-600">
                R$ {safeTotalIncomes.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </CardTitle>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Despesas</CardDescription>
              <CardTitle className="text-2xl text-red-600">
                R$ {safeTotalExpenses.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </CardTitle>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Saldo</CardDescription>
              <CardTitle className={`text-2xl ${safeBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                R$ {safeBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Contas a Pagar</CardDescription>
              <CardTitle className="text-2xl text-yellow-500">
                R$ {totalContasAPagarPeriodo.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </CardTitle>
            </CardHeader>
          </Card>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Modal de Cadastro de Transação */}
            <Dialog open={modalTransacaoAberto} onOpenChange={setModalTransacaoAberto}>
              <DialogTrigger asChild>
                {/* O botão ficará na header de transações, não aqui */}
                <></>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Adicionar Transação</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="tipo">Tipo</Label>
                    <Select value={novaTransacao.tipo} onValueChange={(value: "income" | "expense") => setNovaTransacao({ ...novaTransacao, tipo: value, categoria: "" })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="income">Receita</SelectItem>
                        <SelectItem value="expense">Despesa</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="descricao">Descrição</Label>
                    <Input
                      id="descricao"
                      value={novaTransacao.descricao}
                      onChange={(e) => setNovaTransacao({ ...novaTransacao, descricao: e.target.value })}
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
                      onChange={(e) => setNovaTransacao({ ...novaTransacao, valor: e.target.value })}
                      placeholder="0,00"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="categoria">Categoria</Label>
                    <div className="flex gap-2 items-center">
                      <Select value={novaTransacao.categoria} onValueChange={(value) => setNovaTransacao({ ...novaTransacao, categoria: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione uma categoria" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category.id} value={category.id.toString()}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button type="button" variant="outline" size="sm" onClick={() => setModalNovaCategoriaAberto(true)}>
                        Nova Categoria
                      </Button>
                    </div>
                  </div>
                  <Button type="submit" className="w-full" disabled={submitting}>
                    {submitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Adicionando...
                      </>
                    ) : (
                      'Adicionar Transação'
                    )}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
            {/* Modal Nova Categoria */}
            <Dialog open={modalNovaCategoriaAberto} onOpenChange={setModalNovaCategoriaAberto}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Nova Categoria</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleAddCategoria} className="flex gap-2">
                  <Input
                    placeholder="Nome da nova categoria"
                    value={novaCategoria}
                    onChange={(e) => setNovaCategoria(e.target.value)}
                    disabled={catLoading}
                    className="flex-1"
                  />
                  <Button type="submit" disabled={catLoading || !novaCategoria.trim()}>
                    {catLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Adicionando...
                      </>
                    ) : (
                      'Adicionar'
                    )}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
            {/* Lista de Transações */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Movimentações</CardTitle>
                  <CardDescription>Histórico de receitas e despesas</CardDescription>
                </div>
                <Button onClick={() => setModalTransacaoAberto(true)}>
                  Nova Movimentação
                </Button>
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
                      {transacoesFiltradas.map((transaction) => (
                        <div key={`${transaction.type}-${transaction.id}`} className="flex justify-between items-center p-3 border rounded-lg">
                          <div>
                            <p className="font-medium">{transaction.title}</p>
                            <p className="text-sm text-muted-foreground">{transaction.category.name} • {transaction.date}</p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className={`font-semibold ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                              }`}>
                              {transaction.type === 'income' ? '+' : '-'}R$ {transaction.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(transaction.id, transaction.type)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                      {transacoesFiltradas.length === 0 && (
                        <p className="text-center text-muted-foreground py-8">
                          Nenhuma transação encontrada para este mês
                        </p>
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="receitas" className="mt-4">
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {receitasFiltradas.map((transaction) => (
                        <div key={`income-${transaction.id}`} className="flex justify-between items-center p-3 border rounded-lg">
                          <div>
                            <p className="font-medium">{transaction.title}</p>
                            <p className="text-sm text-muted-foreground">{transaction.category.name} • {transaction.date}</p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="font-semibold text-green-600">
                              +R$ {transaction.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(transaction.id, 'income')}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                      {receitasFiltradas.length === 0 && (
                        <p className="text-center text-muted-foreground py-8">
                          Nenhuma receita encontrada para este mês
                        </p>
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="despesas" className="mt-4">
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {despesasFiltradas.map((transaction) => (
                        <div key={`expense-${transaction.id}`} className="flex justify-between items-center p-3 border rounded-lg">
                          <div>
                            <p className="font-medium">{transaction.title}</p>
                            <p className="text-sm text-muted-foreground">{transaction.category.name} • {transaction.date}</p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="font-semibold text-red-600">
                              -R$ {transaction.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(transaction.id, 'expense')}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                      {despesasFiltradas.length === 0 && (
                        <p className="text-center text-muted-foreground py-8">
                          Nenhuma despesa encontrada para este mês
                        </p>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
            {/* Card de Contas Recorrentes com status e ação */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Contas Recorrentes</CardTitle>
                  <CardDescription>Veja e altere as suas contas recorrentes</CardDescription>
                </div>
                <Dialog open={modalContaAberto} onOpenChange={setModalContaAberto}>
                  <DialogTrigger asChild>
                    <Button>Nova Conta Mensal</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Adicionar Conta Mensal</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleAddConta} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="descricao-conta">Descrição</Label>
                        <Input
                          id="descricao-conta"
                          placeholder="Ex: Aluguel, Luz, Água..."
                          value={novaConta.descricao}
                          onChange={(e) => setNovaConta({ ...novaConta, descricao: e.target.value })}
                          disabled={contaLoading}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="valor-conta">Valor</Label>
                        <Input
                          id="valor-conta"
                          type="number"
                          step="0.01"
                          placeholder="0,00"
                          value={novaConta.valor}
                          onChange={(e) => setNovaConta({ ...novaConta, valor: e.target.value })}
                          disabled={contaLoading}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="dia-conta">Dia de Vencimento</Label>
                        <Input
                          id="dia-conta"
                          type="number"
                          min="1"
                          max="31"
                          value={novaConta.dia}
                          onChange={(e) => setNovaConta({ ...novaConta, dia: e.target.value })}
                          disabled={contaLoading}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="frequencia-conta">Frequência</Label>
                        <Select value={novaConta.frequencia} onValueChange={(value) => setNovaConta({ ...novaConta, frequencia: value })}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="monthly">Mensal</SelectItem>
                            <SelectItem value="weekly">Semanal</SelectItem>
                            <SelectItem value="yearly">Anual</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="categoria-conta">Categoria</Label>
                        <div className="flex gap-2 items-center">
                          <Select value={novaConta.categoria} onValueChange={(value) => setNovaConta({ ...novaConta, categoria: value })}>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione uma categoria" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">Sem categoria</SelectItem>
                              {categories.map((category) => (
                                <SelectItem key={category.id} value={category.id.toString()}>
                                  {category.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Button type="button" variant="outline" size="sm" onClick={() => setModalNovaCategoriaAberto(true)}>
                            Nova Categoria
                          </Button>
                        </div>
                      </div>
                      <Button type="submit" className="w-full" disabled={contaLoading || !novaConta.descricao.trim() || !novaConta.valor || !novaConta.dia}>
                        {contaLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Adicionando...
                          </>
                        ) : (
                          'Adicionar Conta Mensal'
                        )}
                      </Button>
                    </form>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {recurringBillsWithPeriod.length === 0 && (
                    <p className="text-center text-muted-foreground py-8">
                      Nenhuma conta recorrente cadastrada para este mês
                    </p>
                  )}
                  {recurringBillsWithPeriod.map((bill) => (
                    <div key={bill.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={bill.status_for_period === 'paid'}
                          onChange={async (e) => {
                            if (e.target.checked) {
                              await handleMarkAsPaidForPeriod(bill.id);
                            } else {
                              await handleMarkAsPendingForPeriod(bill.id);
                            }
                          }}
                          className="accent-green-600 w-5 h-5"
                          aria-label={bill.status_for_period === 'paid' ? 'Desmarcar como paga' : 'Marcar como paga'}
                        />
                        <span className="font-medium">{bill.name}</span>
                        <span className="ml-2 text-sm text-muted-foreground">R$ {Number(bill.value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })} • Dia {bill.due_day} • {bill.frequency === 'monthly' ? 'Mensal' : bill.frequency === 'weekly' ? 'Semanal' : 'Anual'}</span>
                        <span className="ml-2 text-xs font-semibold" style={{ color: bill.status_for_period === 'paid' ? '#16a34a' : bill.status_for_period === 'overdue' ? '#dc2626' : '#eab308' }}>
                          {bill.status_for_period === 'paid' ? 'Pago' : bill.status_for_period === 'overdue' ? 'Atrasado' : 'Pendente'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeactivateRecurringBill(bill.id)}
                          className="text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Card de Categorias */}
            <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Categorias</CardTitle>
                <CardDescription>Adicione, edite ou exclua categorias</CardDescription>
              </div>
              <Button onClick={() => setModalNovaCategoriaAberto(true)}>
                Nova Categoria
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                  {categories.map((category) => (
                    <div key={category.id} className="flex items-center justify-between p-3 border rounded-lg">
                      {categoriaEditando === category.id ? (
                        <div className="flex items-center gap-2 flex-1">
                          <Input
                            value={nomeEditando}
                            onChange={(e) => setNomeEditando(e.target.value)}
                            className="flex-1"
                            disabled={catLoading}
                          />
                          <Button
                            size="sm"
                            onClick={() => handleEditCategoria(category.id)}
                            disabled={catLoading || !nomeEditando.trim()}
                          >
                            Salvar
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setCategoriaEditando(null);
                              setNomeEditando("");
                            }}
                            disabled={catLoading}
                          >
                            Cancelar
                          </Button>
                        </div>
                      ) : (
                        <>
                          <span className="font-medium">{category.name}</span>
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                setCategoriaEditando(category.id);
                                setNomeEditando(category.name);
                              }}
                              disabled={catLoading}
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDeleteCategoria(category.id)}
                              disabled={catLoading}
                              className="text-red-600"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                  {categories.length === 0 && (
                    <p className="text-center text-muted-foreground py-8">
                      Nenhuma categoria encontrada
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

          </div>
        </div>
      </div>
    </div>
  );
};

export default ReceitasDespesas;