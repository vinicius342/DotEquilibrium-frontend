import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, PiggyBank, Minus, Filter } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useObjectives } from "@/hooks/useObjectives";
import { CreateObjectiveData, AddDepositData, WithdrawData } from "@/services/objectiveApi";

const Objetivos = () => {
  const { toast } = useToast();
  const {
    objectivesActive,
    objectivesCompleted,
    totalInvested,
    totalTargets,
    loading,
    error,
    createObjective,
    addDeposit,
    withdraw,
  } = useObjectives();

  const [novoObjetivo, setNovoObjetivo] = useState<CreateObjectiveData>({
    title: "",
    target_value: 0,
    current_value: 0,
    deadline: null,
    category: "",
    description: "",
  });

  const [deposito, setDeposito] = useState<AddDepositData & { objetivoSlug: string }>({
    objetivoSlug: "",
    amount: 0,
    description: "",
  });

  const [saque, setSaque] = useState<WithdrawData & { objetivoSlug: string }>({
    objetivoSlug: "",
    amount: 0,
    description: "",
  });

  // Estados dos modais
  const [isNewObjectiveModalOpen, setIsNewObjectiveModalOpen] = useState(false);
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);

  // Estado do filtro para objetivos concluídos
  const [completedFilter, setCompletedFilter] = useState("30dias");

  const categorias = [
    { value: "lazer", label: "Lazer" },
    { value: "transporte", label: "Transporte" },
    { value: "casa", label: "Casa" },
    { value: "educacao", label: "Educação" },
    { value: "emergencia", label: "Emergência" },
    { value: "investimento", label: "Investimento" },
    { value: "outros", label: "Outros" },
  ];

  const filtrosCompletos = [
    { value: "todos", label: "Todos" },
    { value: "30dias", label: "Últimos 30 dias" },
    { value: "3meses", label: "Últimos 3 meses" },
    { value: "6meses", label: "Últimos 6 meses" },
    { value: "1ano", label: "Último ano" },
  ];

  const handleSubmitObjetivo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!novoObjetivo.title || !novoObjetivo.target_value || !novoObjetivo.category) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive",
      });
      return;
    }

    const success = await createObjective(novoObjetivo);
    if (success) {
      toast({
        title: "Sucesso",
        description: "Objetivo criado com sucesso!",
      });
      setNovoObjetivo({
        title: "",
        target_value: 0,
        current_value: 0,
        deadline: null,
        category: "",
        description: "",
      });
      setIsNewObjectiveModalOpen(false); // Fechar modal
    } else {
      toast({
        title: "Erro",
        description: "Erro ao criar objetivo",
        variant: "destructive",
      });
    }
  };

  const handleDeposito = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deposito.objetivoSlug || !deposito.amount) {
      toast({
        title: "Erro",
        description: "Selecione um objetivo e informe o valor",
        variant: "destructive",
      });
      return;
    }

    // Validar se o valor não excede o restante para a meta
    const objetivoSelecionado = objectivesActive.find(obj => obj.slug === deposito.objetivoSlug);
    if (objetivoSelecionado) {
      const valorRestante = objetivoSelecionado.remaining_amount;
      if (deposito.amount > valorRestante && valorRestante > 0) {
        toast({
          title: "Erro",
          description: `Valor não pode exceder R$ ${valorRestante.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} (restante para a meta)`,
          variant: "destructive",
        });
        return;
      }
    }

    const success = await addDeposit(deposito.objetivoSlug, {
      amount: deposito.amount,
      description: deposito.description,
    });
    
    if (success) {
      toast({
        title: "Sucesso",
        description: "Depósito adicionado com sucesso!",
      });
      setDeposito({ objetivoSlug: "", amount: 0, description: "" });
      setIsDepositModalOpen(false); // Fechar modal
    } else {
      toast({
        title: "Erro", 
        description: error || "Erro ao adicionar depósito",
        variant: "destructive",
      });
    }
  };

  const handleSaque = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!saque.objetivoSlug || !saque.amount) {
      toast({
        title: "Erro",
        description: "Selecione um objetivo e informe o valor",
        variant: "destructive",
      });
      return;
    }

    const success = await withdraw(saque.objetivoSlug, {
      amount: saque.amount,
      description: saque.description,
    });
    
    if (success) {
      toast({
        title: "Sucesso",
        description: "Saque realizado com sucesso!",
      });
      setSaque({ objetivoSlug: "", amount: 0, description: "" });
      setIsWithdrawModalOpen(false); // Fechar modal
    } else {
      toast({
        title: "Erro", 
        description: error || "Erro ao realizar saque",
        variant: "destructive",
      });
    }
  };

  const calcularDiasRestantes = (diasRestantes: number | null) => {
    if (diasRestantes === null) return "Sem prazo definido";
    if (diasRestantes < 0) return "Prazo vencido";
    return `${diasRestantes} dias restantes`;
  };

  // Função para filtrar objetivos concluídos por período
  const filtrarObjetivosConcluidos = () => {
    if (completedFilter === "todos") {
      return objectivesCompleted;
    }

    const agora = new Date();
    let dataLimite: Date;

    switch (completedFilter) {
      case "30dias":
        dataLimite = new Date(agora.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case "3meses":
        dataLimite = new Date(agora.getFullYear(), agora.getMonth() - 3, agora.getDate());
        break;
      case "6meses":
        dataLimite = new Date(agora.getFullYear(), agora.getMonth() - 6, agora.getDate());
        break;
      case "1ano":
        dataLimite = new Date(agora.getFullYear() - 1, agora.getMonth(), agora.getDate());
        break;
      default:
        return objectivesCompleted;
    }

    return objectivesCompleted.filter(objetivo => {
      // Se não tem data de conclusão, usar data de criação como fallback
      const dataCompletado = objetivo.completed_at 
        ? new Date(objetivo.completed_at) 
        : new Date(objetivo.created_at);
      return dataCompletado >= dataLimite;
    });
  };

  const objetivosConcluidos = filtrarObjetivosConcluidos();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Carregando objetivos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-96">
          <CardHeader>
            <CardTitle className="text-red-600">Erro</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{error}</p>
            <Button className="mt-4" onClick={() => window.location.reload()}>
              Tentar novamente
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Objetivos Financeiros</h1>
          <Link to="/dashboard">
            <Button variant="outline">Voltar ao Dashboard</Button>
          </Link>
        </div>

        {/* Resumo dos Objetivos */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Objetivos Ativos</CardDescription>
              <CardTitle className="text-2xl text-primary">
                  {objectivesActive.length.toLocaleString('pt-BR')}
              </CardTitle>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Objetivos Concluídos</CardDescription>
              <CardTitle className="text-2xl text-green-600">
                  {objectivesCompleted.length.toLocaleString('pt-BR')}
              </CardTitle>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Investido</CardDescription>
              <CardTitle className="text-2xl text-blue-600">
                R$ {(isNaN(totalInvested) ? 0 : totalInvested).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </CardTitle>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total das Metas</CardDescription>
              <CardTitle className="text-2xl text-orange-600">
                R$ {(isNaN(totalTargets) ? 0 : totalTargets).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Header com Botões para Modais */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold">Seus Objetivos</h2>
          <div className="flex gap-3">
            <Dialog open={isNewObjectiveModalOpen} onOpenChange={setIsNewObjectiveModalOpen}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Novo Objetivo
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Novo Objetivo</DialogTitle>
                  <DialogDescription>
                    Crie um novo objetivo financeiro para alcançar suas metas.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmitObjetivo} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="titulo">Título do Objetivo *</Label>
                    <Input
                      id="titulo"
                      value={novoObjetivo.title}
                      onChange={(e) => setNovoObjetivo({...novoObjetivo, title: e.target.value})}
                      placeholder="Ex: Viagem, Carro, Casa..."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="valorMeta">Valor da Meta *</Label>
                    <Input
                      id="valorMeta"
                      type="number"
                      step="0.01"
                      value={novoObjetivo.target_value || ""}
                      onChange={(e) => setNovoObjetivo({...novoObjetivo, target_value: parseFloat(e.target.value) || 0})}
                      placeholder="0,00"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="valorAtual">Valor Inicial</Label>
                    <Input
                      id="valorAtual"
                      type="number"
                      step="0.01"
                      value={novoObjetivo.current_value || ""}
                      onChange={(e) => setNovoObjetivo({...novoObjetivo, current_value: parseFloat(e.target.value) || 0})}
                      placeholder="0,00"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="categoria">Categoria *</Label>
                    <Select value={novoObjetivo.category} onValueChange={(value) => setNovoObjetivo({...novoObjetivo, category: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma categoria" />
                      </SelectTrigger>
                      <SelectContent>
                        {categorias.map((cat) => (
                          <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="prazo">Prazo</Label>
                    <Input
                      id="prazo"
                      type="date"
                      value={novoObjetivo.deadline || ""}
                      onChange={(e) => setNovoObjetivo({...novoObjetivo, deadline: e.target.value || null})}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="descricao">Descrição</Label>
                    <Input
                      id="descricao"
                      value={novoObjetivo.description}
                      onChange={(e) => setNovoObjetivo({...novoObjetivo, description: e.target.value})}
                      placeholder="Opcional"
                    />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button 
                      type="button" 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => setIsNewObjectiveModalOpen(false)}
                    >
                      Cancelar
                    </Button>
                    <Button type="submit" className="flex-1">
                      Criar Objetivo
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>

            <Dialog open={isDepositModalOpen} onOpenChange={setIsDepositModalOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2" disabled={objectivesActive.length === 0}>
                  <PiggyBank className="h-4 w-4" />
                  Adicionar Valor
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Adicionar Valor</DialogTitle>
                  <DialogDescription>
                    Faça um depósito em algum dos seus objetivos ativos.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleDeposito} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="objetivoSelect">Selecionar Objetivo</Label>
                    <Select value={deposito.objetivoSlug} onValueChange={(value) => setDeposito({...deposito, objetivoSlug: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Escolha um objetivo" />
                      </SelectTrigger>
                      <SelectContent>
                        {objectivesActive.map((obj) => (
                          <SelectItem key={obj.slug} value={obj.slug}>
                            {obj.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="valorDeposito">Valor do Depósito</Label>
                    <Input
                      id="valorDeposito"
                      type="number"
                      step="0.01"
                      min="0.01"
                      max={deposito.objetivoSlug ? objectivesActive.find(obj => obj.slug === deposito.objetivoSlug)?.remaining_amount || undefined : undefined}
                      value={deposito.amount || ""}
                      onChange={(e) => setDeposito({...deposito, amount: parseFloat(e.target.value) || 0})}
                      placeholder="0,00"
                    />
                    {deposito.objetivoSlug && (
                      <p className="text-sm text-muted-foreground">
                        Valor máximo: R$ {objectivesActive.find(obj => obj.slug === deposito.objetivoSlug)?.remaining_amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '0,00'} (restante para a meta)
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="descricaoDeposito">Descrição</Label>
                    <Input
                      id="descricaoDeposito"
                      value={deposito.description}
                      onChange={(e) => setDeposito({...deposito, description: e.target.value})}
                      placeholder="Opcional"
                    />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button 
                      type="button" 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => setIsDepositModalOpen(false)}
                    >
                      Cancelar
                    </Button>
                    <Button type="submit" className="flex-1">
                      Adicionar Valor
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>

            <Dialog open={isWithdrawModalOpen} onOpenChange={setIsWithdrawModalOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2" disabled={objectivesActive.length === 0}>
                  <Minus className="h-4 w-4" />
                  Sacar Valor
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Sacar Valor</DialogTitle>
                  <DialogDescription>
                    Retire parte ou todo o valor de algum dos seus objetivos.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSaque} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="objetivoSelectSaque">Selecionar Objetivo</Label>
                    <Select value={saque.objetivoSlug} onValueChange={(value) => setSaque({...saque, objetivoSlug: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Escolha um objetivo" />
                      </SelectTrigger>
                      <SelectContent>
                        {objectivesActive.filter(obj => obj.current_value > 0).map((obj) => (
                          <SelectItem key={obj.slug} value={obj.slug}>
                            {obj.title} (R$ {obj.current_value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="valorSaque">Valor do Saque</Label>
                    <Input
                      id="valorSaque"
                      type="number"
                      step="0.01"
                      value={saque.amount || ""}
                      onChange={(e) => setSaque({...saque, amount: parseFloat(e.target.value) || 0})}
                      placeholder="0,00"
                    />
                    {saque.objetivoSlug && (
                      <p className="text-sm text-muted-foreground">
                        Valor disponível: R$ {objectivesActive.find(obj => obj.slug === saque.objetivoSlug)?.current_value.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '0,00'}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="descricaoSaque">Descrição</Label>
                    <Input
                      id="descricaoSaque"
                      value={saque.description}
                      onChange={(e) => setSaque({...saque, description: e.target.value})}
                      placeholder="Opcional"
                    />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button 
                      type="button" 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => setIsWithdrawModalOpen(false)}
                    >
                      Cancelar
                    </Button>
                    <Button type="submit" className="flex-1" variant="destructive">
                      Sacar Valor
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {objectivesActive.length === 0 && objectivesCompleted.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <div className="text-muted-foreground">
                <PiggyBank className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-semibold mb-2">Nenhum objetivo ainda</h3>
                <p className="mb-4">Crie seu primeiro objetivo financeiro para começar a economizar!</p>
                <Button onClick={() => setIsNewObjectiveModalOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Criar Primeiro Objetivo
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Lista de Objetivos Ativos */}
        {objectivesActive.length > 0 && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Objetivos Ativos</CardTitle>
              <CardDescription>Acompanhe o progresso dos seus objetivos</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {objectivesActive.map((objetivo) => {
                  const progresso = objetivo.progress_percentage;
                  const diasRestantes = objetivo.days_remaining;
                  const valorRestante = objetivo.remaining_amount;

                  return (
                    <div key={objetivo.slug} className="border rounded-lg p-4 hover:bg-muted/30 transition-colors">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-medium text-lg">{objetivo.title}</h3>
                            <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                              {objetivo.category_display}
                            </span>
                          </div>
                          {objetivo.description && (
                            <p className="text-sm text-muted-foreground mb-2">{objetivo.description}</p>
                          )}
                        </div>
                        <div className="text-right ml-4">
                          <p className="text-sm text-muted-foreground">Meta</p>
                          <p className="font-semibold text-lg">
                            R$ {objetivo.target_value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                          <span className="font-medium">Progresso: {progresso.toFixed(1)}%</span>
                          <span>
                            R$ {objetivo.current_value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} / 
                            R$ {objetivo.target_value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                        <Progress value={progresso} className="h-3" />
                        
                        <div className="flex justify-between text-sm text-muted-foreground">
                          <span>Faltam: R$ {valorRestante.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                          <span className={diasRestantes !== null && diasRestantes < 30 ? 'text-red-600 font-medium' : ''}>
                            {calcularDiasRestantes(diasRestantes)}
                          </span>
                        </div>
                        
                        <div className="flex gap-2 pt-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => {
                              setDeposito({...deposito, objetivoSlug: objetivo.slug});
                              setIsDepositModalOpen(true);
                            }}
                          >
                            <PiggyBank className="h-4 w-4 mr-1" />
                            Adicionar Valor
                          </Button>
                          {objetivo.current_value > 0 && (
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => {
                                setSaque({...saque, objetivoSlug: objetivo.slug});
                                setIsWithdrawModalOpen(true);
                              }}
                            >
                              <Minus className="h-4 w-4 mr-1" />
                              Sacar
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Objetivos Concluídos */}
        {objectivesCompleted.length > 0 && (
          <Card className="mt-6">
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Objetivos Concluídos</CardTitle>
                  <CardDescription>Parabéns! Você alcançou estes objetivos</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-muted-foreground" />
                  <Select value={completedFilter} onValueChange={setCompletedFilter}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Filtrar por período" />
                    </SelectTrigger>
                    <SelectContent>
                      {filtrosCompletos.map((filtro) => (
                        <SelectItem key={filtro.value} value={filtro.value}>
                          {filtro.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {objetivosConcluidos.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p>Nenhum objetivo concluído no período selecionado.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {objetivosConcluidos.map((objetivo) => (
                    <div key={objetivo.slug} className="border rounded-lg p-4 bg-green-50 dark:bg-green-950/20 hover:bg-green-100 dark:hover:bg-green-950/30 transition-colors">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="font-medium text-green-800 dark:text-green-200">{objetivo.title}</h3>
                          <p className="text-sm text-green-600 dark:text-green-400">{objetivo.category_display}</p>
                        </div>
                        <span className="text-green-600 dark:text-green-400 text-xl">✅</span>
                      </div>
                      <p className="text-lg font-semibold text-green-700 dark:text-green-300 mb-2">
                        R$ {objetivo.target_value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </p>
                      <div className="flex items-center justify-between text-xs text-green-600 dark:text-green-400">
                        <span>Meta atingida!</span>
                        <span>{objetivo.progress_percentage.toFixed(0)}%</span>
                      </div>
                      <div className="text-xs text-green-600 dark:text-green-400 mt-1">
                        Concluído em: {objetivo.completed_at 
                          ? new Date(objetivo.completed_at).toLocaleDateString('pt-BR')
                          : new Date(objetivo.created_at).toLocaleDateString('pt-BR')
                        }
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Objetivos;
