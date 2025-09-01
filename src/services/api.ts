// Configuração da API
const API_BASE_URL = import.meta.env.VITE_API_URL || (
  import.meta.env.DEV ? '' : 'http://localhost:8000'
);

// Helper para fazer requisições autenticadas
const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  const token = localStorage.getItem('access_token');
  
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Token ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
  
  if (!response.ok) {
    throw new Error(`API Error: ${response.status} ${response.statusText}`);
  }
  
  return response.json();
};

// Tipos TypeScript
export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
}

export interface Income {
  id: number;
  title: string;
  value: number;
  description: string;
  category: number;
  date: string;
  user: number;
}

export interface Expense {
  id: number;
  title: string;
  value: number;
  description: string;
  category: number;
  date: string;
  user: number;
}

export interface CreateIncomeData {
  title: string;
  value: number;
  description: string;
  category: number;
  date: string;
}

export interface CreateExpenseData {
  title: string;
  value: number;
  description: string;
  category: number;
  date: string;
}

export interface CreateCategoryData {
  name: string;
  description?: string;
}

export interface RecurringBill {
  id: number;
  name: string;
  description?: string;
  value: number;
  due_day: number;
  frequency: 'monthly' | 'weekly' | 'yearly';
  category: number | null;
  is_active: boolean;
  status: 'pending' | 'paid' | 'overdue';
  created_at: string;
}

export interface CreateRecurringBillData {
  name: string;
  description?: string;
  value: number;
  due_day: number;
  frequency?: 'monthly' | 'weekly' | 'yearly';
  category?: number | null;
  is_active?: boolean;
  status?: 'pending' | 'paid' | 'overdue';
}

// API Functions
export const financeAPI = {
  // Métodos genéricos para requests personalizados
  get: (endpoint: string): Promise<any> => 
    apiRequest(endpoint),
  
  post: (endpoint: string, data?: any): Promise<any> =>
    apiRequest(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    }),

  // Categorias
  getCategories: (): Promise<Category[]> => 
    apiRequest('/api/finance/categories/'),
  
  createCategory: (data: CreateCategoryData): Promise<Category> =>
    apiRequest('/api/finance/categories/', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
  updateCategory: (id: number, data: Partial<CreateCategoryData>): Promise<Category> =>
    apiRequest(`/api/finance/categories/${id}/`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  
  deleteCategory: (id: number): Promise<void> =>
    apiRequest(`/api/finance/categories/${id}/`, {
      method: 'DELETE',
    }),
  
  // Receitas
  getIncomes: (): Promise<Income[]> => 
    apiRequest('/api/finance/incomes/'),
  
  createIncome: (data: CreateIncomeData): Promise<Income> =>
    apiRequest('/api/finance/incomes/', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
  updateIncome: (id: number, data: Partial<CreateIncomeData>): Promise<Income> =>
    apiRequest(`/api/finance/incomes/${id}/`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  
  deleteIncome: (id: number): Promise<void> =>
    apiRequest(`/api/finance/incomes/${id}/`, {
      method: 'DELETE',
    }),
  
  // Despesas
  getExpenses: (): Promise<Expense[]> => 
    apiRequest('/api/finance/expenses/'),
  
  createExpense: (data: CreateExpenseData): Promise<Expense> =>
    apiRequest('/api/finance/expenses/', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
  updateExpense: (id: number, data: Partial<CreateExpenseData>): Promise<Expense> =>
    apiRequest(`/api/finance/expenses/${id}/`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  
  deleteExpense: (id: number): Promise<void> =>
    apiRequest(`/api/finance/expenses/${id}/`, {
      method: 'DELETE',
    }),

  // Contas Recorrentes
  getRecurringBills: (): Promise<RecurringBill[]> =>
    apiRequest('/api/finance/recurring-bills/'),

  createRecurringBill: (data: CreateRecurringBillData): Promise<RecurringBill> =>
    apiRequest('/api/finance/recurring-bills/', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateRecurringBill: (id: number, data: Partial<CreateRecurringBillData>): Promise<RecurringBill> =>
    apiRequest(`/api/finance/recurring-bills/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  deleteRecurringBill: (id: number): Promise<void> =>
    apiRequest(`/api/finance/recurring-bills/${id}/`, {
      method: 'DELETE',
    }),
};
