import { useState, useEffect } from 'react';
import { useObjectives } from './useObjectives';
import { useFinanceData } from './useFinanceData';
import { financeAPI } from '@/services/api';

export interface DashboardData {
  saldoTotal: number;
  receitasMes: number;
  despesasMes: number;
  totalInvestido: number;
  objetivosAtivos: number;
  objetivosConcluidos: number;
  transacoesRecentes: TransacaoRecente[];
  loading: boolean;
  error: string | null;
}

export interface TransacaoRecente {
  id: number;
  descricao: string;
  valor: number;
  tipo: 'receita' | 'despesa';
  data: string;
  categoria?: string;
}

export const useDashboard = () => {
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    saldoTotal: 0,
    receitasMes: 0,
    despesasMes: 0,
    totalInvestido: 0,
    objetivosAtivos: 0,
    objetivosConcluidos: 0,
    transacoesRecentes: [],
    loading: true,
    error: null,
  });

  const { 
    objectivesActive, 
    objectivesCompleted, 
    totalInvested,
    loading: objectivesLoading,
    error: objectivesError 
  } = useObjectives();

  const { 
    incomes, 
    expenses,
    recurringBills,
    balance,
    loading: financeLoading,
    error: financeError 
  } = useFinanceData();

  useEffect(() => {
    const fetchRecurringBillsForCurrentMonth = async () => {
      if (!financeLoading && !objectivesLoading) {
        try {
          const currentDate = new Date();
          const currentYear = currentDate.getFullYear();
          const currentMonth = currentDate.getMonth() + 1;

          // Buscar contas recorrentes para o mês atual com endpoint específico
          const recurringBillsCurrentMonth = await financeAPI.get(
            `/api/finance/recurring-bills/?year=${currentYear}&month=${currentMonth}`
          );

          const primeiroDiaMes = new Date(currentYear, currentDate.getMonth(), 1);
          
          const receitasMes = incomes
            .filter(income => new Date(income.date) >= primeiroDiaMes)
            .reduce((sum, income) => sum + Number(income.amount), 0);

          const despesasMes = expenses
            .filter(expense => new Date(expense.date) >= primeiroDiaMes)
            .reduce((sum, expense) => sum + Number(expense.amount), 0);

          // Calcular saldo total considerando contas recorrentes pagas
          const totalReceitas = incomes.reduce((sum, income) => sum + Number(income.amount), 0);
          const totalDespesas = expenses.reduce((sum, expense) => sum + Number(expense.amount), 0);
          
          // Calcular total das contas recorrentes pagas usando dados do endpoint for_period
          let totalContasRecorrentesPagas = 0;
          
          // Buscar dados de todos os meses até o atual para calcular total de contas pagas
          const currentMonthNumber = currentDate.getMonth() + 1;
          for (let month = 1; month <= currentMonthNumber; month++) {
            try {
              const billsForMonth = await financeAPI.get(
                `/api/finance/recurring-bills/?year=${currentYear}&month=${month}`
              );
              const bills = Array.isArray(billsForMonth) ? billsForMonth : 
                          (billsForMonth.data || billsForMonth.results || []);
              
              totalContasRecorrentesPagas += bills
                .filter((bill: any) => 
                  bill.payment_for_period && 
                  bill.payment_for_period.status === 'paid'
                )
                .reduce((acc: number, bill: any) => 
                  acc + Number(bill.payment_for_period.amount_paid || bill.value), 0
                );
            } catch (error) {
              console.error(`Erro ao buscar contas do mês ${month}:`, error);
            }
          }
          
          const saldoTotal = totalReceitas - totalDespesas - totalContasRecorrentesPagas;

          // Preparar transações recentes (últimas 10)
          const todasTransacoes = [
            ...incomes.map(income => ({
              id: income.id,
              descricao: income.title,
              valor: Number(income.amount),
              tipo: 'receita' as const,
              data: income.date,
              categoria: income.category?.name,
            })),
            ...expenses.map(expense => ({
              id: expense.id + 10000, // offset para evitar conflito de IDs
              descricao: expense.title,
              valor: -Number(expense.amount),
              tipo: 'despesa' as const,
              data: expense.date,
              categoria: expense.category?.name,
            })),
          ];

          // Ordenar por data (mais recentes primeiro) e pegar apenas 10
          const transacoesRecentes = todasTransacoes
            .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())
            .slice(0, 10);

          setDashboardData({
            saldoTotal,
            receitasMes,
            despesasMes,
            totalInvestido: totalInvested || 0,
            objetivosAtivos: objectivesActive.length,
            objetivosConcluidos: objectivesCompleted.length,
            transacoesRecentes,
            loading: false,
            error: objectivesError || financeError,
          });
        } catch (error) {
          console.error('Erro ao buscar dados do dashboard:', error);
          setDashboardData(prev => ({
            ...prev,
            loading: false,
            error: 'Erro ao carregar dados do dashboard',
          }));
        }
      }
    };

    fetchRecurringBillsForCurrentMonth();
  }, [
    objectivesLoading,
    financeLoading,
    objectivesActive,
    objectivesCompleted,
    totalInvested,
    incomes,
    expenses,
    recurringBills,
    objectivesError,
    financeError,
  ]);

  return dashboardData;
};

export default useDashboard;
