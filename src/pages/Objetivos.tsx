import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";

const Objetivos = () => {
  const [objetivos, setObjetivos] = useState([
    {
      id: 1,
      titulo: "Viagem para Europa",
      valorMeta: 15000,
      valorAtual: 8500,
      prazo: "2024-12-31",
      categoria: "Lazer",
      status: "ativo"
    },
    {
      id: 2,
      titulo: "Carro Novo",
      valorMeta: 45000,
      valorAtual: 12000,
      prazo: "2025-06-30",
      categoria: "Transporte",
      status: "ativo"
    },
    {
      id: 3,
      titulo: "Reserva de Emergência",
      valorMeta: 30000,
      valorAtual: 25000,
      prazo: "2024-03-31",
      categoria: "Emergência",
      status: "ativo"
    },
    {
      id: 4,
      titulo: "Curso de Inglês",
      valorMeta: 3000,
      valorAtual: 3000,
      prazo: "2024-01-31",
      categoria: "Educação",
      status: "concluido"
    }
  ]);

  const [novoObjetivo, setNovoObjetivo] = useState({
    titulo: "",
    valorMeta: "",
    valorAtual: "",
    prazo: "",
    categoria: ""
  });

  const [deposito, setDeposito] = useState({
    objetivoId: "",
    valor: ""
  });

  const categorias = ["Lazer", "Transporte", "Casa", "Educação", "Emergência", "Investimento", "Outros"];

  const handleSubmitObjetivo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!novoObjetivo.titulo || !novoObjetivo.valorMeta || !novoObjetivo.prazo || !novoObjetivo.categoria) {
      alert("Preencha todos os campos obrigatórios");
      return;
    }

    const objetivo = {
      id: Date.now(),
      titulo: novoObjetivo.titulo,
      valorMeta: parseFloat(novoObjetivo.valorMeta),
      valorAtual: parseFloat(novoObjetivo.valorAtual) || 0,
      prazo: novoObjetivo.prazo,
      categoria: novoObjetivo.categoria,
      status: "ativo"
    };

    setObjetivos([...objetivos, objetivo]);
    setNovoObjetivo({
      titulo: "",
      valorMeta: "",
      valorAtual: "",
      prazo: "",
      categoria: ""
    });
  };

  const handleDeposito = (e: React.FormEvent) => {
    e.preventDefault();
    if (!deposito.objetivoId || !deposito.valor) {
      alert("Selecione um objetivo e informe o valor");
      return;
    }

    const valorDeposito = parseFloat(deposito.valor);
    setObjetivos(prev => prev.map(obj => {
      if (obj.id === parseInt(deposito.objetivoId)) {
        const novoValor = obj.valorAtual + valorDeposito;
        return {
          ...obj,
          valorAtual: novoValor,
          status: novoValor >= obj.valorMeta ? "concluido" : "ativo"
        };
      }
      return obj;
    }));

    setDeposito({ objetivoId: "", valor: "" });
  };

  const objetivosAtivos = objetivos.filter(obj => obj.status === "ativo");
  const objetivosConcluidos = objetivos.filter(obj => obj.status === "concluido");
  const totalInvestido = objetivos.reduce((sum, obj) => sum + obj.valorAtual, 0);
  const totalMetas = objetivosAtivos.reduce((sum, obj) => sum + obj.valorMeta, 0);

  const calcularProgresso = (valorAtual: number, valorMeta: number) => {
    return Math.min((valorAtual / valorMeta) * 100, 100);
  };

  const calcularDiasRestantes = (prazo: string) => {
    const hoje = new Date();
    const dataPrazo = new Date(prazo);
    const diferenca = dataPrazo.getTime() - hoje.getTime();
    const dias = Math.ceil(diferenca / (1000 * 3600 * 24));
    return dias;
  };

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
                {objetivosAtivos.length}
              </CardTitle>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Objetivos Concluídos</CardDescription>
              <CardTitle className="text-2xl text-green-600">
                {objetivosConcluidos.length}
              </CardTitle>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Investido</CardDescription>
              <CardTitle className="text-2xl text-blue-600">
                R$ {totalInvestido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </CardTitle>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total das Metas</CardDescription>
              <CardTitle className="text-2xl text-orange-600">
                R$ {totalMetas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </CardTitle>
            </CardHeader>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Formulário para Novo Objetivo */}
          <Card>
            <CardHeader>
              <CardTitle>Novo Objetivo</CardTitle>
              <CardDescription>Crie um novo objetivo financeiro</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmitObjetivo} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="titulo">Título do Objetivo *</Label>
                  <Input
                    id="titulo"
                    value={novoObjetivo.titulo}
                    onChange={(e) => setNovoObjetivo({...novoObjetivo, titulo: e.target.value})}
                    placeholder="Ex: Viagem, Carro, Casa..."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="valorMeta">Valor da Meta *</Label>
                  <Input
                    id="valorMeta"
                    type="number"
                    step="0.01"
                    value={novoObjetivo.valorMeta}
                    onChange={(e) => setNovoObjetivo({...novoObjetivo, valorMeta: e.target.value})}
                    placeholder="0,00"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="valorAtual">Valor Inicial</Label>
                  <Input
                    id="valorAtual"
                    type="number"
                    step="0.01"
                    value={novoObjetivo.valorAtual}
                    onChange={(e) => setNovoObjetivo({...novoObjetivo, valorAtual: e.target.value})}
                    placeholder="0,00"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="categoria">Categoria *</Label>
                  <Select value={novoObjetivo.categoria} onValueChange={(value) => setNovoObjetivo({...novoObjetivo, categoria: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      {categorias.map((cat) => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="prazo">Prazo *</Label>
                  <Input
                    id="prazo"
                    type="date"
                    value={novoObjetivo.prazo}
                    onChange={(e) => setNovoObjetivo({...novoObjetivo, prazo: e.target.value})}
                  />
                </div>

                <Button type="submit" className="w-full">
                  Criar Objetivo
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Adicionar Valor ao Objetivo */}
          <Card>
            <CardHeader>
              <CardTitle>Adicionar Valor</CardTitle>
              <CardDescription>Faça um depósito em algum objetivo</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleDeposito} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="objetivoSelect">Selecionar Objetivo</Label>
                  <Select value={deposito.objetivoId} onValueChange={(value) => setDeposito({...deposito, objetivoId: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Escolha um objetivo" />
                    </SelectTrigger>
                    <SelectContent>
                      {objetivosAtivos.map((obj) => (
                        <SelectItem key={obj.id} value={obj.id.toString()}>
                          {obj.titulo}
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
                    value={deposito.valor}
                    onChange={(e) => setDeposito({...deposito, valor: e.target.value})}
                    placeholder="0,00"
                  />
                </div>

                <Button type="submit" className="w-full" disabled={objetivosAtivos.length === 0}>
                  Adicionar Valor
                </Button>
              </form>

              {objetivosAtivos.length === 0 && (
                <p className="text-sm text-muted-foreground mt-4">
                  Crie um objetivo primeiro para poder adicionar valores.
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Lista de Objetivos Ativos */}
        {objetivosAtivos.length > 0 && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Objetivos Ativos</CardTitle>
              <CardDescription>Acompanhe o progresso dos seus objetivos</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {objetivosAtivos.map((objetivo) => {
                  const progresso = calcularProgresso(objetivo.valorAtual, objetivo.valorMeta);
                  const diasRestantes = calcularDiasRestantes(objetivo.prazo);
                  const valorRestante = objetivo.valorMeta - objetivo.valorAtual;

                  return (
                    <div key={objetivo.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="font-medium text-lg">{objetivo.titulo}</h3>
                          <p className="text-sm text-muted-foreground">{objetivo.categoria}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">Meta</p>
                          <p className="font-semibold">
                            R$ {objetivo.valorMeta.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                          <span>Progresso: {progresso.toFixed(1)}%</span>
                          <span>
                            R$ {objetivo.valorAtual.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} / 
                            R$ {objetivo.valorMeta.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                        <Progress value={progresso} className="h-3" />
                        
                        <div className="flex justify-between text-sm text-muted-foreground">
                          <span>Faltam: R$ {valorRestante.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                          <span className={diasRestantes < 30 ? 'text-red-600 font-medium' : ''}>
                            {diasRestantes > 0 ? `${diasRestantes} dias restantes` : 'Prazo vencido'}
                          </span>
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
        {objetivosConcluidos.length > 0 && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Objetivos Concluídos</CardTitle>
              <CardDescription>Parabéns! Você alcançou estes objetivos</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {objetivosConcluidos.map((objetivo) => (
                  <div key={objetivo.id} className="border rounded-lg p-4 bg-green-50">
                    <h3 className="font-medium text-green-800">{objetivo.titulo}</h3>
                    <p className="text-sm text-green-600">{objetivo.categoria}</p>
                    <p className="text-lg font-semibold text-green-700 mt-2">
                      R$ {objetivo.valorMeta.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                    <p className="text-xs text-green-600">✅ Concluído</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Objetivos;