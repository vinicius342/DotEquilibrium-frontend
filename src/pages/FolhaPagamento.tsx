import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Trash2, Edit, Plus, DollarSign, Users, Calendar, TrendingUp, PlayCircle, StopCircle, CreditCard, Banknote } from "lucide-react";
import { usePayrollData } from "@/hooks/usePayrollData";
import { Employee, PayrollPeriod, PayrollPeriodItem } from "@/services/payrollApi";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";

const FolhaPagamento = () => {
  const {
    employees,
    payrolls,
    advancePayments,
    payrollPeriods,
    activePeriod,
    periodItems,
    allPeriodItems,
    loading,
    error,
    createEmployee,
    updateEmployee,
    deleteEmployee,
    createPayroll,
    createAdvancePayment,
    createPayrollPeriod,
    updatePayrollPeriod,
    deletePayrollPeriod,
    closePeriod,
    createPeriodItem,
    deletePeriodItem,
    fetchActivePeriod,
    fetchPeriodItems,
  } = usePayrollData();

  const [novoFuncionario, setNovoFuncionario] = useState({
    name: "",
    role: "",
    salary: "",
    hiring_date: "",
  });

  const [novoPagamento, setNovoPagamento] = useState({
    employee: "",
    amount: "",
    description: "",
    payment_date: new Date().toISOString().split('T')[0],
    is_paid: false,
    payment_type: "salary", // salary, daily, weekly, bonus, extra
  });

  const [novoAdiantamento, setNovoAdiantamento] = useState({
    employee: "",
    date_given: "",
    amount: "",
    description: "",
  });

  const [folhaAtual, setFolhaAtual] = useState({
    mes: new Date().getMonth() + 1,
    ano: new Date().getFullYear(),
  });

  const [novoPeriodo, setNovoPeriodo] = useState({
    name: "",
    start_date: new Date().toISOString().split('T')[0],
    end_date: "",
  });

  const [novoItemPeriodo, setNovoItemPeriodo] = useState({
    employee: "",
    payment_type: "salary",
    amount: "",
    description: "",
    is_advance: false,
  });

  const [novoAdiantamentoPeriodo, setNovoAdiantamentoPeriodo] = useState({
    employee: "",
    amount: "",
    description: "",
  });

  const [modalPagamentoAberto, setModalPagamentoAberto] = useState(false);
  const [modalAdiantamentoAberto, setModalAdiantamentoAberto] = useState(false);
  const [modalNovoFuncionarioAberto, setModalNovoFuncionarioAberto] = useState(false);
  const [modalEditarPeriodo, setModalEditarPeriodo] = useState(false);
  const [periodoEditando, setPeriodoEditando] = useState({
    name: "",
    start_date: "",
    end_date: "",
  });

  // Novo estado para modal de pagamento do período
  const [modalPagamentoPeriodoAberto, setModalPagamentoPeriodoAberto] = useState(false);
  const [novoPagamentoPeriodo, setNovoPagamentoPeriodo] = useState({
    employee: "",
    payment_type: "salary",
    amount: "",
    payment_date: new Date().toISOString().split('T')[0],
    description: "",
  });

  // Estado para controlar funcionários expandidos
  const [funcionariosExpandidos, setFuncionariosExpandidos] = useState<Set<string>>(new Set());
  
  // Estado para controlar funcionários expandidos nos períodos fechados
  const [funcionariosExpandidosFechados, setFuncionariosExpandidosFechados] = useState<{ [periodId: string]: Set<string> }>({});

  // Função para alternar expansão do funcionário
  const toggleFuncionarioExpandido = (empId: string) => {
    const novosExpandidos = new Set(funcionariosExpandidos);
    if (novosExpandidos.has(empId)) {
      novosExpandidos.delete(empId);
    } else {
      novosExpandidos.add(empId);
    }
    setFuncionariosExpandidos(novosExpandidos);
  };

  // Função para alternar expansão do funcionário em períodos fechados
  const toggleFuncionarioExpandidoFechado = (periodId: string, empId: string) => {
    const novosFuncionariosExpandidos = { ...funcionariosExpandidosFechados };
    if (!novosFuncionariosExpandidos[periodId]) {
      novosFuncionariosExpandidos[periodId] = new Set();
    }
    
    if (novosFuncionariosExpandidos[periodId].has(empId)) {
      novosFuncionariosExpandidos[periodId].delete(empId);
    } else {
      novosFuncionariosExpandidos[periodId].add(empId);
    }
    
    setFuncionariosExpandidosFechados(novosFuncionariosExpandidos);
  };

  useEffect(() => {
    if (modalEditarPeriodo && activePeriod) {
      setPeriodoEditando({
        name: activePeriod.name,
        start_date: activePeriod.start_date,
        end_date: activePeriod.end_date,
      });
    }
  }, [modalEditarPeriodo, activePeriod]);

  // Calcular estatísticas
  const totalFuncionarios = employees.filter(emp => !emp.termination_date).length;
  const totalSalarios = employees
    .filter(emp => !emp.termination_date)
    .reduce((sum, emp) => sum + Number(emp.salary), 0);

  const folhasDoMes = payrolls.filter(payroll => {
    const payrollDate = new Date(payroll.period_start);
    return payrollDate.getMonth() + 1 === folhaAtual.mes &&
      payrollDate.getFullYear() === folhaAtual.ano;
  });

  const totalDescontos = folhasDoMes.reduce((sum, payroll) => sum + Number(payroll.deductions), 0);
  const totalLiquido = folhasDoMes.reduce((sum, payroll) => sum + Number(payroll.net_amount), 0);

  // Estatísticas do período ativo - categorização correta
  // 1. Pagamentos processados: não são adiantamentos E foram processados
  const pagamentosProcessados = periodItems.filter(item => !item.is_advance && item.is_processed);

  // 2. Pagamentos pendentes: não são adiantamentos E não foram processados  
  const pagamentosPendentes = periodItems.filter(item => !item.is_advance && !item.is_processed);

  // 3. Adiantamentos: são adiantamentos (sempre processados pois são valores já pagos)
  const adiantamentos = periodItems.filter(item => item.is_advance);

  const totalPagamentosProcessados = pagamentosProcessados.reduce((sum, item) => sum + Number(item.amount), 0);
  const totalPagamentosPendentes = pagamentosPendentes.reduce((sum, item) => sum + Number(item.amount), 0);
  const totalAdiantamentos = adiantamentos.reduce((sum, item) => sum + Number(item.amount), 0);
  const totalPeriodoAtivo = totalPagamentosProcessados; // Apenas pagamentos processados contam como "receita"
  const funcionariosPeriodoAtivo = new Set(periodItems.map(item => item.employee)).size;

  const handleSubmitFuncionario = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!novoFuncionario.name || !novoFuncionario.role || !novoFuncionario.salary || !novoFuncionario.hiring_date) {
      alert("Preencha todos os campos obrigatórios");
      return;
    }

    try {
      await createEmployee({
        name: novoFuncionario.name,
        role: novoFuncionario.role,
        salary: parseFloat(novoFuncionario.salary),
        hiring_date: novoFuncionario.hiring_date,
      });

      setNovoFuncionario({
        name: "",
        role: "",
        salary: "",
        hiring_date: "",
      });

      alert("Funcionário adicionado com sucesso!");
    } catch (error) {
      console.error('Erro ao adicionar funcionário:', error);
      alert("Erro ao adicionar funcionário. Verifique os dados e tente novamente.");
    }
  };

  const handleSubmitPagamento = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!novoPagamento.employee || !novoPagamento.amount || !novoPagamento.payment_date) {
      alert("Preencha todos os campos obrigatórios");
      return;
    }

    try {
      const amount = parseFloat(novoPagamento.amount);

      // Se for marcado como pago, criar um registro de folha
      if (novoPagamento.is_paid) {
        await createPayroll({
          employee: parseInt(novoPagamento.employee),
          period_start: novoPagamento.payment_date, // Usa a mesma data para início
          period_end: novoPagamento.payment_date,   // e fim do período
          gross_amount: amount,
          deductions: 0, // Sem descontos por padrão
          net_amount: amount,
          payment_date: novoPagamento.payment_date,
        });
      } else {
        // Se não pago, criar como adiantamento/pendência
        await createAdvancePayment({
          employee: parseInt(novoPagamento.employee),
          date_given: novoPagamento.payment_date,
          amount: amount,
          description: novoPagamento.description || `${novoPagamento.payment_type === 'daily' ? 'Diária' :
            novoPagamento.payment_type === 'weekly' ? 'Semanal' :
              novoPagamento.payment_type === 'bonus' ? 'Bônus' :
                novoPagamento.payment_type === 'extra' ? 'Extra' : 'Salário'} - ${new Date(novoPagamento.payment_date).toLocaleDateString('pt-BR')}`,
        });
      }

      setNovoPagamento({
        employee: "",
        amount: "",
        description: "",
        payment_date: new Date().toISOString().split('T')[0],
        is_paid: false,
        payment_type: "salary",
      });

      alert(novoPagamento.is_paid ? "Pagamento registrado e marcado como pago!" : "Pagamento registrado como pendente!");
    } catch (error) {
      console.error('Erro ao registrar pagamento:', error);
      alert("Erro ao registrar pagamento. Verifique os dados e tente novamente.");
    }
  };

  const handleSubmitAdiantamento = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!novoAdiantamento.employee || !novoAdiantamento.date_given || !novoAdiantamento.amount) {
      alert("Preencha todos os campos obrigatórios");
      return;
    }

    try {
      await createAdvancePayment({
        employee: parseInt(novoAdiantamento.employee),
        date_given: novoAdiantamento.date_given,
        amount: parseFloat(novoAdiantamento.amount),
        description: novoAdiantamento.description,
      });

      setNovoAdiantamento({
        employee: "",
        date_given: "",
        amount: "",
        description: "",
      });

      alert("Adiantamento registrado com sucesso!");
    } catch (error) {
      console.error('Erro ao registrar adiantamento:', error);
      alert("Erro ao registrar adiantamento. Verifique os dados e tente novamente.");
    }
  };

  const handleDeleteEmployee = async (id: number) => {
    if (confirm("Tem certeza que deseja excluir este funcionário?")) {
      try {
        await deleteEmployee(id);
        alert("Funcionário excluído com sucesso!");
      } catch (error) {
        console.error('Erro ao excluir funcionário:', error);
        alert("Erro ao excluir funcionário. Tente novamente.");
      }
    }
  };

  const handleSubmitNovoPeriodo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!novoPeriodo.name || !novoPeriodo.start_date || !novoPeriodo.end_date) {
      alert("Preencha todos os campos obrigatórios");
      return;
    }

    try {
      await createPayrollPeriod({
        name: novoPeriodo.name,
        start_date: novoPeriodo.start_date,
        end_date: novoPeriodo.end_date,
        status: 'active',
      });

      setNovoPeriodo({
        name: "",
        start_date: new Date().toISOString().split('T')[0],
        end_date: "",
      });

      alert("Período criado e ativado com sucesso!");
    } catch (error) {
      console.error('Erro ao criar período:', error);
      alert("Erro ao criar período. Verifique os dados e tente novamente.");
    }
  };

  const handleAdicionarItemPeriodo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activePeriod) {
      alert("Nenhum período ativo encontrado");
      return;
    }
    if (!novoItemPeriodo.employee || !novoItemPeriodo.amount) {
      alert("Preencha todos os campos obrigatórios");
      return;
    }
    try {
      await createPeriodItem({
        period: activePeriod.id!,
        employee: parseInt(novoItemPeriodo.employee),
        payment_type: novoItemPeriodo.payment_type as any,
        amount: parseFloat(novoItemPeriodo.amount),
        description: novoItemPeriodo.description,
        is_processed: false, // Pagamentos normais começam como pendentes
        is_advance: false, // Pagamentos normais não são adiantamentos
      });

      setNovoItemPeriodo({
        employee: "",
        payment_type: "salary",
        amount: "",
        description: "",
        is_advance: false, // Resetar mas não usar mais
      });

      setModalPagamentoAberto(false);
      alert("Item adicionado ao período com sucesso!");
    } catch (error) {
      console.error('Erro ao adicionar item:', error);
      alert("Erro ao adicionar item. Verifique os dados e tente novamente.");
    }
  };

  const handleAdiantamentoPeriodo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activePeriod) {
      alert("Nenhum período ativo encontrado");
      return;
    }
    if (!novoAdiantamentoPeriodo.employee || !novoAdiantamentoPeriodo.amount) {
      alert("Preencha todos os campos obrigatórios");
      return;
    }
    try {
      await createPeriodItem({
        period: activePeriod.id!,
        employee: parseInt(novoAdiantamentoPeriodo.employee),
        payment_type: 'other',
        amount: parseFloat(novoAdiantamentoPeriodo.amount),
        description: novoAdiantamentoPeriodo.description || 'Adiantamento',
        is_processed: true, // Adiantamentos são valores já pagos
        is_advance: true,
      });

      setNovoAdiantamentoPeriodo({
        employee: "",
        amount: "",
        description: "",
      });

      setModalAdiantamentoAberto(false);
      alert("Adiantamento registrado no período com sucesso!");
    } catch (error) {
      console.error('Erro ao registrar adiantamento:', error);
      alert("Erro ao registrar adiantamento. Verifique os dados e tente novamente.");
    }
  };

  const handleFecharPeriodo = async () => {
    if (!activePeriod) return;

    if (confirm("Tem certeza que deseja fechar este período? Esta ação não pode ser desfeita.")) {
      try {
        await closePeriod(activePeriod.id!);
        alert("Período fechado com sucesso!");
      } catch (error) {
        console.error('Erro ao fechar período:', error);
        alert("Erro ao fechar período. Tente novamente.");
      }
    }
  };

  const handleRemoverItemPeriodo = async (id: number) => {
    if (confirm("Tem certeza que deseja remover este item?")) {
      try {
        // Implementar remoção via API quando disponível
        alert("Funcionalidade de remoção será implementada em breve");
      } catch (error) {
        console.error('Erro ao remover item:', error);
        alert("Erro ao remover item. Tente novamente.");
      }
    }
  };

  const handleExcluirPeriodo = async () => {
    if (!activePeriod) return;
    if (confirm("Tem certeza que deseja excluir este período? Esta ação não pode ser desfeita.")) {
      try {
        await deletePayrollPeriod(activePeriod.id!);
        alert("Período excluído com sucesso!");
        // Não precisa do reload, o hook já atualiza o estado
      } catch (error) {
        alert("Erro ao excluir período. Tente novamente.");
      }
    }
  };

  const meses = [
    { value: 1, label: "Janeiro" },
    { value: 2, label: "Fevereiro" },
    { value: 3, label: "Março" },
    { value: 4, label: "Abril" },
    { value: 5, label: "Maio" },
    { value: 6, label: "Junho" },
    { value: 7, label: "Julho" },
    { value: 8, label: "Agosto" },
    { value: 9, label: "Setembro" },
    { value: 10, label: "Outubro" },
    { value: 11, label: "Novembro" },
    { value: 12, label: "Dezembro" },
  ];

  const handleSalvarEdicaoPeriodo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!periodoEditando.name || !periodoEditando.start_date || !periodoEditando.end_date) {
      alert("Preencha todos os campos obrigatórios");
      return;
    }
    try {
      await updatePayrollPeriod(activePeriod.id!, {
        name: periodoEditando.name,
        start_date: periodoEditando.start_date,
        end_date: periodoEditando.end_date,
        status: activePeriod.status,
      });
      setModalEditarPeriodo(false);
      alert("Período atualizado com sucesso!");
    } catch (error) {
      alert("Erro ao atualizar período. Tente novamente.");
    }
  };

  const handleAdicionarPagamentoPeriodo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activePeriod) {
      alert("Nenhum período ativo encontrado");
      return;
    }
    if (!novoPagamentoPeriodo.employee || !novoPagamentoPeriodo.amount || !novoPagamentoPeriodo.payment_date) {
      alert("Preencha todos os campos obrigatórios");
      return;
    }
    try {
      await createPeriodItem({
        period: activePeriod.id!,
        employee: parseInt(novoPagamentoPeriodo.employee),
        payment_type: novoPagamentoPeriodo.payment_type as any,
        amount: parseFloat(novoPagamentoPeriodo.amount),
        payment_date: novoPagamentoPeriodo.payment_date,
        description: novoPagamentoPeriodo.description,
        is_processed: novoPagamentoPeriodo.payment_type === 'advance' ? true : false,
        is_advance: novoPagamentoPeriodo.payment_type === 'advance',
      });
      setNovoPagamentoPeriodo({
        employee: "",
        payment_type: "salary",
        amount: "",
        payment_date: new Date().toISOString().split('T')[0],
        description: "",
      });
      setModalPagamentoPeriodoAberto(false);
      alert("Pagamento adicionado ao período com sucesso!");
    } catch (error) {
      alert("Erro ao adicionar pagamento. Verifique os dados e tente novamente.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando dados da folha de pagamento...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>Tentar Novamente</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Folha de Pagamento</h1>
        </div>

        <Tabs defaultValue="periodo-ativo">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="periodo-ativo">Período Ativo</TabsTrigger>
            <TabsTrigger value="periodos-fechados">Períodos Fechados</TabsTrigger>
            <TabsTrigger value="funcionarios">Funcionários</TabsTrigger>
            <TabsTrigger value="folhas">Folhas</TabsTrigger>
            <TabsTrigger value="adiantamentos">Adiantamentos</TabsTrigger>
            <TabsTrigger value="processar">Novo Pagamento</TabsTrigger>
          </TabsList>

          {/* Período Ativo */}
          <TabsContent value="periodo-ativo">
            {activePeriod ? (
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <PlayCircle className="h-5 w-5 text-green-600" />
                      {activePeriod.name}
                    </CardTitle>
                    <CardDescription>
                      {new Date(activePeriod.start_date).toLocaleDateString('pt-BR')} - {new Date(activePeriod.end_date).toLocaleDateString('pt-BR')}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={() => setModalPagamentoPeriodoAberto(true)}>
                      <Plus className="mr-2 h-4 w-4" /> Adicionar Pagamento
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button id="dropdown-periodo" variant="outline">Opções</Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setModalEditarPeriodo(true)}>
                          Editar Período
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={handleFecharPeriodo} className="text-blue-600 focus:bg-blue-50">
                          Fechar Período
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={handleExcluirPeriodo} className="text-red-600 focus:bg-red-50">
                          Excluir Período
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                {/* Lista de funcionários com pagamentos no período */}
                <CardContent>
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold mb-2">Pagamentos do Período</h4>
                    <div className="flex items-center gap-3" style={{ fontSize: '1.25rem', fontWeight: '600' }}>
                      {(() => {
                        const total = periodItems.filter(item => !item.is_processed).reduce((sum, i) => sum + Number(i.amount), 0);
                        return <>Total:
                          <div className="px-2 flex " style={{ backgroundColor: '#3d4451', borderRadius: '0.375rem', display: 'flex', alignItems: 'center' }}>
                            <h3 className='flex items-center' style={{ fontSize: '1.25rem', fontWeight: '600' }}>
                              {total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} <span className="ml-1 text-xs text-muted-foreground">R$</span>
                            </h3>
                          </div>
                        </>;
                      })()}
                    </div>
                  </div>
                  <div className="space-y-2">
                    {(() => {
                      // Agrupar por funcionário
                      const itemsPorFuncionario: { [key: string]: PayrollPeriodItem[] } = {};
                      periodItems.forEach(item => {
                        const empId = String(item.employee);
                        if (!itemsPorFuncionario[empId]) itemsPorFuncionario[empId] = [];
                        itemsPorFuncionario[empId].push(item);
                      });
                      // Mostrar lista
                      const funcionariosComPagamento = Object.keys(itemsPorFuncionario);
                      
                      if (funcionariosComPagamento.length === 0) {
                        return <div className="text-muted-foreground">Nenhum pagamento registrado neste período.</div>;
                      }
                      return funcionariosComPagamento.map(empId => {
                        const itens = itemsPorFuncionario[empId];
                        const funcionario = employees.find(e => e.id?.toString() === empId);
                        const pagos = itens.filter(i => i.is_processed);
                        const pendentes = itens.filter(i => !i.is_processed);
                        const valorPago = pagos.reduce((sum, i) => sum + Number(i.amount), 0);
                        const valorPendente = pendentes.reduce((sum, i) => sum + Number(i.amount), 0) - valorPago;
                        const total = pendentes.reduce((sum, i) => sum + Number(i.amount), 0);
                        return (
                          <div key={empId}>
                            <div className="flex items-center justify-between border rounded px-3 py-2">
                              <div className="flex-1">
                                <span className="font-medium">{funcionario ? funcionario.name : 'Funcionário #' + empId}</span>
                                <span className="ml-2 text-xs text-muted-foreground">{funcionario?.role}</span>
                              </div>
                              <div className="flex items-center gap-3">
                                <div className="text-right">
                                  <span className="block font-semibold">Total: R$ {total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                                  <span className="block text-green-600 text-xs">Pago: R$ {valorPago.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                                  {valorPendente > 0 && (
                                    <span className="block text-orange-600 text-xs">Pendente: R$ {valorPendente.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                                  )}
                                </div>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => toggleFuncionarioExpandido(empId)}
                                >
                                  {funcionariosExpandidos.has(empId) ? 'Ocultar' : 'Ver Detalhes'}
                                </Button>
                              </div>
                            </div>
                            {funcionariosExpandidos.has(empId) && (
                              <div className="mt-2 ml-4 space-y-1 border-l-2 border-gray-200 pl-4">
                                <h6 className="font-medium text-sm text-gray-700">Movimentações no Período:</h6>
                                {itens.map((item, index) => (
                                  <div key={item.id || index} className="flex justify-between items-center py-1 text-sm">
                                    <div>
                                      <span className="font-medium">{item.description || 'Sem descrição'}</span>
                                      <span className="ml-2 text-xs text-gray-500">
                                        {item.payment_type === 'salary' ? 'Salário' :
                                         item.payment_type === 'daily' ? 'Diária' :
                                         item.payment_type === 'weekly' ? 'Semanal' :
                                         item.payment_type === 'bonus' ? 'Bônus' :
                                         item.payment_type === 'extra' ? 'Hora Extra' :
                                         item.payment_type === 'other' ? 'Outros' : item.payment_type}
                                      </span>
                                      {item.is_advance && (
                                        <span className="ml-1 text-xs bg-orange-100 text-orange-800 px-1 rounded">Adiantamento</span>
                                      )}
                                    </div>
                                    <div className="text-right">
                                      <span className={`font-medium ${item.is_processed ? 'text-green-600' : 'text-orange-600'}`}>
                                        R$ {Number(item.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                      </span>
                                      <span className="block text-xs text-gray-500">
                                        {item.is_processed ? 'Processado' : 'Pendente'}
                                      </span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      });
                    })()}
                  </div>
                </CardContent>
                {/* Modal de adicionar pagamento ao período */}
                <Dialog open={modalPagamentoPeriodoAberto} onOpenChange={setModalPagamentoPeriodoAberto}>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>Adicionar Pagamento ao Período</DialogTitle>
                      <DialogDescription>Registre um pagamento manual para um funcionário neste período</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleAdicionarPagamentoPeriodo} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="period-payment-employee">Funcionário *</Label>
                        <Select value={novoPagamentoPeriodo.employee} onValueChange={value => setNovoPagamentoPeriodo({ ...novoPagamentoPeriodo, employee: value })}>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione um funcionário" />
                          </SelectTrigger>
                          <SelectContent>
                            {employees.filter(emp => !emp.termination_date).map(employee => (
                              <SelectItem key={employee.id} value={employee.id!.toString()}>
                                {employee.name} - {employee.role}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="period-payment-type">Tipo de Pagamento</Label>
                        <Select value={novoPagamentoPeriodo.payment_type} onValueChange={value => setNovoPagamentoPeriodo({ ...novoPagamentoPeriodo, payment_type: value as any })}>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o tipo" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="daily">Diária</SelectItem>
                            <SelectItem value="weekly">Semanal</SelectItem>
                            <SelectItem value="salary">Salário Mensal</SelectItem>
                            <SelectItem value="bonus">Bônus</SelectItem>
                            <SelectItem value="extra">Hora Extra</SelectItem>
                            <SelectItem value="advance">Adiantamento</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="period-payment-amount">Valor (R$) *</Label>
                          <Input
                            id="period-payment-amount"
                            type="number"
                            step="0.01"
                            min="0"
                            value={novoPagamentoPeriodo.amount}
                            onChange={e => setNovoPagamentoPeriodo({ ...novoPagamentoPeriodo, amount: e.target.value })}
                            placeholder="0,00"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="period-payment-date">Data *</Label>
                          <Input
                            id="period-payment-date"
                            type="date"
                            value={novoPagamentoPeriodo.payment_date}
                            onChange={e => setNovoPagamentoPeriodo({ ...novoPagamentoPeriodo, payment_date: e.target.value })}
                            required
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="period-payment-description">Descrição</Label>
                        <Input
                          id="period-payment-description"
                          type="text"
                          value={novoPagamentoPeriodo.description}
                          onChange={e => setNovoPagamentoPeriodo({ ...novoPagamentoPeriodo, description: e.target.value })}
                          placeholder="Descrição adicional (opcional)"
                        />
                      </div>
                      <Button type="submit" className="w-full">
                        <DollarSign className="mr-2 h-4 w-4" />
                        Adicionar Pagamento
                      </Button>
                    </form>
                  </DialogContent>
                </Dialog>
                {/* Modal de edição do período */}
                <Dialog open={modalEditarPeriodo} onOpenChange={setModalEditarPeriodo}>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>Editar Período</DialogTitle>
                      <DialogDescription>Altere as informações do período de pagamento</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSalvarEdicaoPeriodo} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="edit-period-name">Nome do Período *</Label>
                        <Input
                          id="edit-period-name"
                          value={periodoEditando.name}
                          onChange={e => setPeriodoEditando({ ...periodoEditando, name: e.target.value })}
                          required
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="edit-period-start">Data Início *</Label>
                          <Input
                            id="edit-period-start"
                            type="date"
                            value={periodoEditando.start_date}
                            onChange={e => setPeriodoEditando({ ...periodoEditando, start_date: e.target.value })}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="edit-period-end">Data Fim *</Label>
                          <Input
                            id="edit-period-end"
                            type="date"
                            value={periodoEditando.end_date}
                            onChange={e => setPeriodoEditando({ ...periodoEditando, end_date: e.target.value })}
                            required
                          />
                        </div>
                      </div>
                      <Button type="submit" className="w-full">
                        Salvar Alterações
                      </Button>
                    </form>
                  </DialogContent>
                </Dialog>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Nenhum Período Ativo</CardTitle>
                  <CardDescription>
                    Crie um novo período de pagamento para começar a registrar valores
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmitNovoPeriodo} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="period-name">Nome do Período *</Label>
                      <Input
                        id="period-name"
                        value={novoPeriodo.name}
                        onChange={(e) => setNovoPeriodo({ ...novoPeriodo, name: e.target.value })}
                        placeholder="Ex: Folha Janeiro 2024"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="period-start">Data Início *</Label>
                        <Input
                          id="period-start"
                          type="date"
                          value={novoPeriodo.start_date}
                          onChange={(e) => setNovoPeriodo({ ...novoPeriodo, start_date: e.target.value })}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="period-end">Data Fim *</Label>
                        <Input
                          id="period-end"
                          type="date"
                          value={novoPeriodo.end_date}
                          onChange={(e) => setNovoPeriodo({ ...novoPeriodo, end_date: e.target.value })}
                          required
                        />
                      </div>
                    </div>

                    <Button type="submit" className="w-full">
                      <PlayCircle className="mr-2 h-4 w-4" />
                      Iniciar Novo Período
                    </Button>
                  </form>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Períodos Fechados */}
          <TabsContent value="periodos-fechados">
            <Card>
              <CardHeader>
                <CardTitle>Períodos Fechados</CardTitle>
                <CardDescription>Visualizar períodos de pagamento já fechados</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {payrollPeriods.filter(period => period.status === 'closed').map((period) => (
                    <div key={period.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-semibold flex items-center gap-2">
                            <StopCircle className="h-4 w-4 text-gray-500" />
                            {period.name}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {new Date(period.start_date).toLocaleDateString('pt-BR')} - {new Date(period.end_date).toLocaleDateString('pt-BR')}
                          </p>
                          {period.closed_at && (
                            <p className="text-xs text-muted-foreground">
                              Fechado em: {new Date(period.closed_at).toLocaleDateString('pt-BR')}
                            </p>
                          )}
                        </div>
                        <Badge variant="secondary">Fechado</Badge>
                      </div>

                      {/* Resumo do período fechado */}
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        {(() => {
                          const periodItemsForThisPeriod = allPeriodItems[period.id!] || [];
                          const totalProcessed = periodItemsForThisPeriod
                            .filter(item => item.is_processed)
                            .reduce((sum, item) => sum + Number(item.amount), 0);
                          const totalItems = periodItemsForThisPeriod.length;
                          const uniqueEmployees = new Set(periodItemsForThisPeriod.map(item => item.employee)).size;

                          return (
                            <>
                              <div className="text-center">
                                <p className="text-muted-foreground">Total Pago</p>
                                <p className="font-semibold text-green-600">
                                  R$ {totalProcessed.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                </p>
                              </div>
                              <div className="text-center">
                                <p className="text-muted-foreground">Funcionários</p>
                                <p className="font-semibold">{uniqueEmployees}</p>
                              </div>
                              <div className="text-center">
                                <p className="text-muted-foreground">Pagamentos</p>
                                <p className="font-semibold">{totalItems}</p>
                              </div>
                            </>
                          );
                        })()}
                      </div>

                      {/* Botão para carregar detalhes do período fechado */}
                      {!allPeriodItems[period.id!] && (
                        <div className="mt-3">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => fetchPeriodItems(period.id!)}
                          >
                            Ver Detalhes
                          </Button>
                        </div>
                      )}

                      {/* Lista de funcionários com pagamentos do período fechado */}
                      {allPeriodItems[period.id!] && allPeriodItems[period.id!].length > 0 && (
                        <div className="mt-4 border-t pt-3">
                          <h5 className="font-medium mb-2 text-sm">Funcionários do Período:</h5>
                          <div className="space-y-2">
                            {(() => {
                              // Agrupar por funcionário
                              const itemsPorFuncionario: { [key: string]: PayrollPeriodItem[] } = {};
                              allPeriodItems[period.id!].forEach(item => {
                                const empId = String(item.employee);
                                if (!itemsPorFuncionario[empId]) itemsPorFuncionario[empId] = [];
                                itemsPorFuncionario[empId].push(item);
                              });

                              return Object.keys(itemsPorFuncionario).map(empId => {
                                const itens = itemsPorFuncionario[empId];
                                const funcionario = employees.find(e => e.id?.toString() === empId);
                                const total = itens.reduce((sum, i) => sum + Number(i.amount), 0);
                                const pagos = itens.filter(i => i.is_processed);
                                const pendentes = itens.filter(i => !i.is_processed);
                                const valorPago = pagos.reduce((sum, i) => sum + Number(i.amount), 0);
                                const valorPendente = pendentes.reduce((sum, i) => sum + Number(i.amount), 0);

                                return (
                                  <div key={empId}>
                                    <div className="flex items-center justify-between border rounded px-3 py-2 text-sm">
                                      <div className="flex-1">
                                        <span className="font-medium">{funcionario ? funcionario.name : 'Funcionário #' + empId}</span>
                                        <span className="ml-2 text-xs text-muted-foreground">{funcionario?.role}</span>
                                      </div>
                                      <div className="flex items-center gap-3">
                                        <div className="text-right">
                                          <span className="block font-semibold text-xs">Total: R$ {total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                                          <span className="block text-green-600 text-xs">Pago: R$ {valorPago.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                                          {valorPendente > 0 && (
                                            <span className="block text-orange-600 text-xs">Pendente: R$ {valorPendente.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                                          )}
                                        </div>
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          onClick={() => toggleFuncionarioExpandidoFechado(String(period.id), empId)}
                                        >
                                          {(funcionariosExpandidosFechados[String(period.id)] || new Set()).has(empId) ? 'Ocultar' : 'Ver Detalhes'}
                                        </Button>
                                      </div>
                                    </div>
                                    {(funcionariosExpandidosFechados[String(period.id)] || new Set()).has(empId) && (
                                      <div className="mt-2 ml-4 space-y-1 border-l-2 border-gray-200 pl-4">
                                        <h6 className="font-medium text-sm text-gray-700">Movimentações no Período:</h6>
                                        {itens.map((item, index) => (
                                          <div key={item.id || index} className="flex justify-between items-center py-1 text-sm">
                                            <div>
                                              <span className="font-medium">{item.description || 'Sem descrição'}</span>
                                              <span className="ml-2 text-xs text-gray-500">
                                                {item.payment_type === 'salary' ? 'Salário' :
                                                 item.payment_type === 'daily' ? 'Diária' :
                                                 item.payment_type === 'weekly' ? 'Semanal' :
                                                 item.payment_type === 'bonus' ? 'Bônus' :
                                                 item.payment_type === 'extra' ? 'Hora Extra' :
                                                 item.payment_type === 'other' ? 'Outros' : item.payment_type}
                                              </span>
                                              {item.is_advance && (
                                                <span className="ml-1 text-xs bg-orange-100 text-orange-800 px-1 rounded">Adiantamento</span>
                                              )}
                                            </div>
                                            <div className="text-right">
                                              <span className={`font-medium ${item.is_processed ? 'text-green-600' : 'text-orange-600'}`}>
                                                R$ {Number(item.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                              </span>
                                              <span className="block text-xs text-gray-500">
                                                {item.is_processed ? 'Processado' : 'Pendente'}
                                              </span>
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                );
                              });
                            })()}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}

                  {payrollPeriods.filter(period => period.status === 'closed').length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      Nenhum período fechado encontrado
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Lista de Funcionários */}
          <TabsContent value="funcionarios">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Lista de Funcionários</CardTitle>
                  <CardDescription>Gerenciar funcionários ativos</CardDescription>
                </div>
                <Button onClick={() => setModalNovoFuncionarioAberto(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Adicionar Funcionário
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {employees.filter(emp => !emp.termination_date).map((employee) => (
                    <div key={employee.id} className="flex justify-between items-center p-4 border rounded-lg">
                      <div className="flex-1">
                        <h3 className="font-medium">{employee.name}</h3>
                        <p className="text-sm text-muted-foreground">{employee.role}</p>
                        <p className="text-xs text-muted-foreground">
                          Admitido em: {new Date(employee.hiring_date).toLocaleDateString('pt-BR')}
                        </p>
                        <Badge variant="secondary" className="mt-1">
                          Ativo
                        </Badge>
                      </div>
                      <div className="text-right space-y-1">
                        <p className="text-sm text-muted-foreground">Salário</p>
                        <p className="font-semibold">
                          R$ {Number(employee.salary).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </p>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => employee.id && handleDeleteEmployee(employee.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                  {employees.filter(emp => !emp.termination_date).length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      Nenhum funcionário ativo encontrado
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
            <Dialog open={modalNovoFuncionarioAberto} onOpenChange={setModalNovoFuncionarioAberto}>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Adicionar Funcionário</DialogTitle>
                  <DialogDescription>Cadastre um novo funcionário na folha de pagamento</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmitFuncionario} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome Completo *</Label>
                    <Input
                      id="name"
                      value={novoFuncionario.name}
                      onChange={(e) => setNovoFuncionario({ ...novoFuncionario, name: e.target.value })}
                      placeholder="Nome do funcionário"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="role">Cargo *</Label>
                    <Input
                      id="role"
                      value={novoFuncionario.role}
                      onChange={(e) => setNovoFuncionario({ ...novoFuncionario, role: e.target.value })}
                      placeholder="Ex: Desenvolvedor, Designer, Gerente..."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="salary">Salário *</Label>
                    <Input
                      id="salary"
                      type="number"
                      step="0.01"
                      value={novoFuncionario.salary}
                      onChange={(e) => setNovoFuncionario({ ...novoFuncionario, salary: e.target.value })}
                      placeholder="0,00"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="hiring_date">Data de Admissão *</Label>
                    <Input
                      id="hiring_date"
                      type="date"
                      value={novoFuncionario.hiring_date}
                      onChange={(e) => setNovoFuncionario({ ...novoFuncionario, hiring_date: e.target.value })}
                    />
                  </div>

                  <Button type="submit" className="w-full">
                    <Plus className="mr-2 h-4 w-4" />
                    Adicionar Funcionário
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </TabsContent>

          {/* Folhas de Pagamento */}
          <TabsContent value="folhas">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Folhas de Pagamento</CardTitle>
                    <CardDescription>Histórico de folhas processadas</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Select value={folhaAtual.mes.toString()} onValueChange={(value) => setFolhaAtual({ ...folhaAtual, mes: parseInt(value) })}>
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {meses.map((mes) => (
                          <SelectItem key={mes.value} value={mes.value.toString()}>{mes.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select value={folhaAtual.ano.toString()} onValueChange={(value) => setFolhaAtual({ ...folhaAtual, ano: parseInt(value) })}>
                      <SelectTrigger className="w-24">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="2024">2024</SelectItem>
                        <SelectItem value="2025">2025</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {folhasDoMes.map((folha) => (
                    <div key={folha.id} className="flex justify-between items-center p-4 border rounded-lg">
                      <div className="flex-1">
                        <h3 className="font-medium">{folha.employee_name}</h3>
                        <p className="text-sm text-muted-foreground">
                          Período: {new Date(folha.period_start).toLocaleDateString('pt-BR')} - {new Date(folha.period_end).toLocaleDateString('pt-BR')}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Pagamento: {new Date(folha.payment_date).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                      <div className="text-right space-y-1">
                        <p className="text-sm text-muted-foreground">Bruto</p>
                        <p className="font-semibold">R$ {Number(folha.gross_amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                        <p className="text-sm text-red-600">
                          Descontos: R$ {Number(folha.deductions).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </p>
                        <p className="text-sm font-medium text-green-600">
                          Líquido: R$ {Number(folha.net_amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </p>
                      </div>
                    </div>
                  ))}
                  {folhasDoMes.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      Nenhuma folha de pagamento encontrada para este período
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Adiantamentos */}
          <TabsContent value="adiantamentos">
            <Card>
              <CardHeader>
                <CardTitle>Adiantamentos</CardTitle>
                <CardDescription>Histórico de adiantamentos concedidos</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {advancePayments.map((advance) => (
                    <div key={advance.id} className="flex justify-between items-center p-4 border rounded-lg">
                      <div className="flex-1">
                        <h3 className="font-medium">{advance.employee_name}</h3>
                        <p className="text-sm text-muted-foreground">{advance.description}</p>
                        <p className="text-xs text-muted-foreground">
                          Data: {new Date(advance.date_given).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Valor</p>
                        <p className="font-semibold text-orange-600">
                          R$ {Number(advance.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </p>
                      </div>
                    </div>
                  ))}
                  {advancePayments.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      Nenhum adiantamento encontrado
                    </div>
                  )}
                </div>

                {/* Formulário para novo adiantamento */}
                <div className="mt-8 border-t pt-6">
                  <h4 className="font-medium mb-4">Registrar Novo Adiantamento</h4>
                  <form onSubmit={handleSubmitAdiantamento} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="advance-employee">Funcionário *</Label>
                        <Select value={novoAdiantamento.employee} onValueChange={(value) => setNovoAdiantamento({ ...novoAdiantamento, employee: value })}>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione um funcionário" />
                          </SelectTrigger>
                          <SelectContent>
                            {employees.filter(emp => !emp.termination_date).map((employee) => (
                              <SelectItem key={employee.id} value={employee.id!.toString()}>
                                {employee.name} - {employee.role}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="advance-date">Data *</Label>
                        <Input
                          id="advance-date"
                          type="date"
                          value={novoAdiantamento.date_given}
                          onChange={(e) => setNovoAdiantamento({ ...novoAdiantamento, date_given: e.target.value })}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="advance-amount">Valor *</Label>
                        <Input
                          id="advance-amount"
                          type="number"
                          step="0.01"
                          value={novoAdiantamento.amount}
                          onChange={(e) => setNovoAdiantamento({ ...novoAdiantamento, amount: e.target.value })}
                          placeholder="0,00"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="advance-description">Descrição</Label>
                        <Input
                          id="advance-description"
                          value={novoAdiantamento.description}
                          onChange={(e) => setNovoAdiantamento({ ...novoAdiantamento, description: e.target.value })}
                          placeholder="Motivo do adiantamento"
                        />
                      </div>
                    </div>

                    <Button type="submit" className="w-full">
                      <Plus className="mr-2 h-4 w-4" />
                      Registrar Adiantamento
                    </Button>
                  </form>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Processar Novo Pagamento */}
          <TabsContent value="processar">
            <Card>
              <CardHeader>
                <CardTitle>Novo Pagamento</CardTitle>
                <CardDescription>
                  Registre um pagamento para um funcionário. Pode ser diária, semanal, bônus ou salário mensal.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmitPagamento} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="payroll-employee">Funcionário *</Label>
                    <Select value={novoPagamento.employee} onValueChange={(value) => setNovoPagamento({ ...novoPagamento, employee: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um funcionário" />
                      </SelectTrigger>
                      <SelectContent>
                        {employees.filter(emp => !emp.termination_date).map((employee) => (
                          <SelectItem key={employee.id} value={employee.id!.toString()}>
                            {employee.name} - {employee.role}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="tipo-pagamento">Tipo de Pagamento</Label>
                    <Select value={novoPagamento.payment_type} onValueChange={(value) => setNovoPagamento({ ...novoPagamento, payment_type: value as any })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Diária</SelectItem>
                        <SelectItem value="weekly">Semanal</SelectItem>
                        <SelectItem value="salary">Salário Mensal</SelectItem>
                        <SelectItem value="bonus">Bônus</SelectItem>
                        <SelectItem value="extra">Hora Extra</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="valor">Valor (R$) *</Label>
                      <Input
                        id="valor"
                        type="number"
                        step="0.01"
                        min="0"
                        value={novoPagamento.amount}
                        onChange={(e) => setNovoPagamento({ ...novoPagamento, amount: e.target.value })}
                        placeholder="0,00"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="data-pagamento">Data *</Label>
                      <Input
                        id="data-pagamento"
                        type="date"
                        value={novoPagamento.payment_date}
                        onChange={(e) => setNovoPagamento({ ...novoPagamento, payment_date: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="descricao">Descrição</Label>
                    <Input
                      id="descricao"
                      type="text"
                      value={novoPagamento.description}
                      onChange={(e) => setNovoPagamento({ ...novoPagamento, description: e.target.value })}
                      placeholder="Descrição adicional (opcional)"
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="is-paid"
                      checked={novoPagamento.is_paid}
                      onChange={(e) => setNovoPagamento({ ...novoPagamento, is_paid: e.target.checked })}
                      className="rounded border-gray-300"
                    />
                    <Label htmlFor="is-paid" className="text-sm">
                      Marcar como pago (se desmarcado, ficará como pendente)
                    </Label>
                  </div>

                  <Button type="submit" className="w-full">
                    <Users className="mr-2 h-4 w-4" />
                    Registrar Pagamento
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default FolhaPagamento;