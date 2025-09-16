import { useState, useEffect } from 'react';
import { objectiveApi, Objective, CreateObjectiveData, AddDepositData, WithdrawData } from '@/services/objectiveApi';

export const useObjectives = () => {
  const [objectives, setObjectives] = useState<Objective[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Carregar objetivos
  const fetchObjectives = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await objectiveApi.getAll();
      setObjectives(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar objetivos');
    } finally {
      setLoading(false);
    }
  };

  // Criar novo objetivo
  const createObjective = async (data: CreateObjectiveData): Promise<boolean> => {
    try {
      setError(null);
      const newObjective = await objectiveApi.create(data);
      setObjectives(prev => [...prev, newObjective]);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar objetivo');
      return false;
    }
  };

  // Atualizar objetivo
  const updateObjective = async (slug: string, data: Partial<CreateObjectiveData>): Promise<boolean> => {
    try {
      setError(null);
      const updatedObjective = await objectiveApi.update(slug, data);
      setObjectives(prev => 
        prev.map(obj => obj.slug === slug ? updatedObjective : obj)
      );
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar objetivo');
      return false;
    }
  };

  // Deletar objetivo
  const deleteObjective = async (slug: string): Promise<boolean> => {
    try {
      setError(null);
      await objectiveApi.delete(slug);
      setObjectives(prev => prev.filter(obj => obj.slug !== slug));
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao deletar objetivo');
      return false;
    }
  };

  // Adicionar depósito
  const addDeposit = async (slug: string, data: AddDepositData): Promise<boolean> => {
    try {
      setError(null);
      const response = await objectiveApi.addDeposit(slug, data);
      setObjectives(prev => 
        prev.map(obj => obj.slug === slug ? response.objective : obj)
      );
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao adicionar depósito');
      return false;
    }
  };

  // Fazer saque
  const withdraw = async (slug: string, data: WithdrawData): Promise<boolean> => {
    try {
      setError(null);
      const response = await objectiveApi.withdraw(slug, data);
      setObjectives(prev => 
        prev.map(obj => obj.slug === slug ? response.objective : obj)
      );
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao fazer saque');
      return false;
    }
  };

  // Dados computados
  const objectivesActive = objectives.filter(obj => obj.status === 'ativo');
  const objectivesCompleted = objectives.filter(obj => obj.status === 'concluido');
  const totalInvested = objectives.reduce((sum, obj) => sum + Number(obj.current_value || 0), 0);
  const totalTargets = objectivesActive.reduce((sum, obj) => sum + Number(obj.target_value || 0), 0);

  // Carregar dados na inicialização
  useEffect(() => {
    fetchObjectives();
  }, []);

  return {
    // Estado
    objectives,
    objectivesActive,
    objectivesCompleted,
    loading,
    error,
    
    // Estatísticas
    totalInvested,
    totalTargets,
    
    // Ações
    fetchObjectives,
    createObjective,
    updateObjective,
    deleteObjective,
    addDeposit,
    withdraw,
    
    // Utilities
    clearError: () => setError(null),
  };
};

export default useObjectives;
