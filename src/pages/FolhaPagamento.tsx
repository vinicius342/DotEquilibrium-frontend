import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const FolhaPagamento = () => {
  const [funcionarios, setFuncionarios] = useState([
    { 
      id: 1, 
      nome: "João Silva", 
      cargo: "Desenvolvedor", 
      salarioBruto: 5000, 
      descontos: 1200,
      status: "ativo"
    },
    { 
      id: 2, 
      nome: "Maria Santos", 
      cargo: "Designer", 
      salarioBruto: 4000, 
      descontos: 950,
      status: "ativo"
    },
    { 
      id: 3, 
      nome: "Pedro Costa", 
      cargo: "Gerente", 
      salarioBruto: 7000, 
      descontos: 1750,
      status: "ativo"
    }
  ]);

  const [novoFuncionario, setNovoFuncionario] = useState({
    nome: "",
    cargo: "",
    salarioBruto: "",
    descontos: ""
  });

  const [folhaAtual, setFolhaAtual] = useState({
    mes: "Janeiro",
    ano: "2024",
    status: "Em processamento"
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!novoFuncionario.nome || !novoFuncionario.cargo || !novoFuncionario.salarioBruto) {
      alert("Preencha todos os campos obrigatórios");
      return;
    }

    const funcionario = {
      id: Date.now(),
      nome: novoFuncionario.nome,
      cargo: novoFuncionario.cargo,
      salarioBruto: parseFloat(novoFuncionario.salarioBruto),
      descontos: parseFloat(novoFuncionario.descontos) || 0,
      status: "ativo"
    };

    setFuncionarios([...funcionarios, funcionario]);
    setNovoFuncionario({
      nome: "",
      cargo: "",
      salarioBruto: "",
      descontos: ""
    });
  };

  const totalSalariosBrutos = funcionarios.reduce((sum, func) => sum + func.salarioBruto, 0);
  const totalDescontos = funcionarios.reduce((sum, func) => sum + func.descontos, 0);
  const totalLiquido = totalSalariosBrutos - totalDescontos;

  const meses = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Folha de Pagamento</h1>
          <Link to="/dashboard">
            <Button variant="outline">Voltar ao Dashboard</Button>
          </Link>
        </div>

        {/* Resumo da Folha */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Funcionários</CardDescription>
              <CardTitle className="text-2xl text-primary">
                {funcionarios.length}
              </CardTitle>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Salários Brutos</CardDescription>
              <CardTitle className="text-2xl text-blue-600">
                R$ {totalSalariosBrutos.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </CardTitle>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Descontos</CardDescription>
              <CardTitle className="text-2xl text-red-600">
                R$ {totalDescontos.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </CardTitle>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Líquido</CardDescription>
              <CardTitle className="text-2xl text-green-600">
                R$ {totalLiquido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </CardTitle>
            </CardHeader>
          </Card>
        </div>

        <Tabs defaultValue="funcionarios">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="funcionarios">Funcionários</TabsTrigger>
            <TabsTrigger value="folha-atual">Folha Atual</TabsTrigger>
            <TabsTrigger value="adicionar">Adicionar Funcionário</TabsTrigger>
          </TabsList>

          {/* Lista de Funcionários */}
          <TabsContent value="funcionarios">
            <Card>
              <CardHeader>
                <CardTitle>Lista de Funcionários</CardTitle>
                <CardDescription>Gerenciar funcionários ativos</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {funcionarios.map((funcionario) => (
                    <div key={funcionario.id} className="flex justify-between items-center p-4 border rounded-lg">
                      <div className="flex-1">
                        <h3 className="font-medium">{funcionario.nome}</h3>
                        <p className="text-sm text-muted-foreground">{funcionario.cargo}</p>
                        <span className={`inline-block px-2 py-1 text-xs rounded-full mt-1 ${
                          funcionario.status === 'ativo' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {funcionario.status}
                        </span>
                      </div>
                      <div className="text-right space-y-1">
                        <p className="text-sm text-muted-foreground">Salário Bruto</p>
                        <p className="font-semibold">
                          R$ {funcionario.salarioBruto.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </p>
                        <p className="text-sm text-red-600">
                          Descontos: R$ {funcionario.descontos.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </p>
                        <p className="text-sm font-medium text-green-600">
                          Líquido: R$ {(funcionario.salarioBruto - funcionario.descontos).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Folha Atual */}
          <TabsContent value="folha-atual">
            <Card>
              <CardHeader>
                <CardTitle>Folha de Pagamento - {folhaAtual.mes} {folhaAtual.ano}</CardTitle>
                <CardDescription>Status: {folhaAtual.status}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <Label>Mês</Label>
                      <Select value={folhaAtual.mes} onValueChange={(value) => setFolhaAtual({...folhaAtual, mes: value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {meses.map((mes) => (
                            <SelectItem key={mes} value={mes}>{mes}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex-1">
                      <Label>Ano</Label>
                      <Select value={folhaAtual.ano} onValueChange={(value) => setFolhaAtual({...folhaAtual, ano: value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="2024">2024</SelectItem>
                          <SelectItem value="2023">2023</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="border rounded-lg p-4">
                    <h4 className="font-medium mb-4">Resumo da Folha</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Total de Funcionários:</span>
                        <span className="font-medium">{funcionarios.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Total Salários Brutos:</span>
                        <span className="font-medium">R$ {totalSalariosBrutos.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Total Descontos:</span>
                        <span className="font-medium text-red-600">R$ {totalDescontos.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                      </div>
                      <div className="border-t pt-2">
                        <div className="flex justify-between">
                          <span className="font-medium">Total a Pagar:</span>
                          <span className="font-bold text-primary">R$ {totalLiquido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button onClick={() => setFolhaAtual({...folhaAtual, status: "Processada"})}>
                      Processar Folha
                    </Button>
                    <Button variant="outline">
                      Exportar Relatório
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Adicionar Funcionário */}
          <TabsContent value="adicionar">
            <Card>
              <CardHeader>
                <CardTitle>Adicionar Funcionário</CardTitle>
                <CardDescription>Cadastre um novo funcionário na folha de pagamento</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="nome">Nome Completo *</Label>
                    <Input
                      id="nome"
                      value={novoFuncionario.nome}
                      onChange={(e) => setNovoFuncionario({...novoFuncionario, nome: e.target.value})}
                      placeholder="Nome do funcionário"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cargo">Cargo *</Label>
                    <Input
                      id="cargo"
                      value={novoFuncionario.cargo}
                      onChange={(e) => setNovoFuncionario({...novoFuncionario, cargo: e.target.value})}
                      placeholder="Ex: Desenvolvedor, Designer, Gerente..."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="salarioBruto">Salário Bruto *</Label>
                    <Input
                      id="salarioBruto"
                      type="number"
                      step="0.01"
                      value={novoFuncionario.salarioBruto}
                      onChange={(e) => setNovoFuncionario({...novoFuncionario, salarioBruto: e.target.value})}
                      placeholder="0,00"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="descontos">Descontos</Label>
                    <Input
                      id="descontos"
                      type="number"
                      step="0.01"
                      value={novoFuncionario.descontos}
                      onChange={(e) => setNovoFuncionario({...novoFuncionario, descontos: e.target.value})}
                      placeholder="0,00"
                    />
                  </div>

                  <Button type="submit" className="w-full">
                    Adicionar Funcionário
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