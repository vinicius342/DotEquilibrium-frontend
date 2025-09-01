import { useState, useEffect } from 'react';
import { financeAPI, Income, Expense, Category, RecurringBill } from '../services/api';

export interface Transaction {
  id: number;
  title: string;
  amount: number;
  description: string;
  category: Category;
  date: string;
  type: 'income' | 'expense';
}

export const useFinanceData = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [recurringBills, setRecurringBills] = useState<RecurringBill[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Carregar dados iniciais
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [categoriesData, incomesData, expensesData, recurringBillsData] = await Promise.all([
        financeAPI.getCategories(),
        financeAPI.getIncomes(),
        financeAPI.getExpenses(),
        financeAPI.getRecurringBills(),
      ]);

      setCategories(categoriesData);
      setRecurringBills(recurringBillsData);

      // Transformar receitas e despesas em transações
      const incomeTransactions: Transaction[] = incomesData.map(income => ({
        id: income.id,
        title: income.title,
        description: income.description,
        amount: Number(income.value),
        category: categoriesData.find(cat => cat.id === income.category) || { id: income.category, name: 'Categoria não encontrada', slug: '' },
        date: income.date,
        type: 'income' as const,
      }));

      const expenseTransactions: Transaction[] = expensesData.map(expense => ({
        id: expense.id,
        title: expense.title,
        description: expense.description,
        amount: Number(expense.value),
        category: categoriesData.find(cat => cat.id === expense.category) || { id: expense.category, name: 'Categoria não encontrada', slug: '' },
        date: expense.date,
        type: 'expense' as const,
      }));

      const allTransactions = [...incomeTransactions, ...expenseTransactions]
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      setTransactions(allTransactions);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const createTransaction = async (data: {
    title: string;
    description: string;
    amount: number;
    categoryId: number;
    date: string;
    type: 'income' | 'expense';
  }) => {
    try {
      setError(null);
      
      if (data.type === 'income') {
        const newIncome = await financeAPI.createIncome({
          title: data.title,
          description: data.description,
          value: data.amount,
          category: data.categoryId,
          date: data.date,
        });
        
        const category = categories.find(cat => cat.id === data.categoryId);
        const newTransaction: Transaction = {
          id: newIncome.id,
          title: newIncome.title,
          description: newIncome.description,
          amount: newIncome.value,
          category: category || { id: data.categoryId, name: 'Categoria não encontrada', slug: '' },
          date: newIncome.date,
          type: 'income',
        };
        
        setTransactions(prev => [newTransaction, ...prev]);
      } else {
        const newExpense = await financeAPI.createExpense({
          title: data.title,
          description: data.description,
          value: data.amount,
          category: data.categoryId,
          date: data.date,
        });
        
        const category = categories.find(cat => cat.id === data.categoryId);
        const newTransaction: Transaction = {
          id: newExpense.id,
          title: newExpense.title,
          description: newExpense.description,
          amount: newExpense.value,
          category: category || { id: data.categoryId, name: 'Categoria não encontrada', slug: '' },
          date: newExpense.date,
          type: 'expense',
        };
        
        setTransactions(prev => [newTransaction, ...prev]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar transação');
      throw err;
    }
  };

  const deleteTransaction = async (id: number, type: 'income' | 'expense') => {
    try {
      setError(null);
      
      if (type === 'income') {
        await financeAPI.deleteIncome(id);
      } else {
        await financeAPI.deleteExpense(id);
      }
      
      setTransactions(prev => prev.filter(t => t.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao deletar transação');
      throw err;
    }
  };

  // CRUD contas recorrentes
  const createRecurringBill = async (data: Omit<RecurringBill, 'id' | 'created_at'>) => {
    try {
      setError(null);
      const newBill = await financeAPI.createRecurringBill(data);
      setRecurringBills(prev => [newBill, ...prev]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar conta recorrente');
      throw err;
    }
  };

  const deleteRecurringBill = async (id: number) => {
    try {
      setError(null);
      await financeAPI.deleteRecurringBill(id);
      setRecurringBills(prev => prev.filter(bill => bill.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao deletar conta recorrente');
      throw err;
    }
  };

  const totalRecurringBills = recurringBills.filter(bill => bill.is_active).reduce((sum, bill) => sum + Number(bill.value), 0);

  // Calcular totais
  const incomes = transactions.filter(t => t.type === 'income');
  const expenses = transactions.filter(t => t.type === 'expense');
  const totalIncomes = incomes.reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = expenses.reduce((sum, t) => sum + t.amount, 0);
  const balance = totalIncomes - totalExpenses;

  return {
    transactions,
    categories,
    recurringBills,
    incomes,
    expenses,
    totalIncomes,
    totalExpenses,
    totalRecurringBills,
    balance,
    loading,
    error,
    createTransaction,
    deleteTransaction,
    createRecurringBill,
    deleteRecurringBill,
    refreshData: loadData,
  };
};
