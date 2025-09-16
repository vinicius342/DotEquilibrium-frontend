// Helper para fazer requisições autenticadas
const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  const API_BASE_URL = import.meta.env.VITE_API_URL || (
    import.meta.env.DEV ? '' : 'http://localhost:8000'
  );
  
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

export interface Objective {
  id: number;
  slug: string;
  title: string;
  description: string;
  target_value: number;
  current_value: number;
  deadline: string | null;
  category: string;
  category_display: string;
  progress_percentage: number;
  remaining_amount: number;
  days_remaining: number | null;
  status: 'ativo' | 'concluido';
  achieved: boolean;
  created_at: string;
  completed_at: string | null;
  deposits: ObjectiveDeposit[];
}

export interface ObjectiveDeposit {
  id: number;
  amount: number;
  description: string;
  date_added: string;
}

export interface CreateObjectiveData {
  title: string;
  description?: string;
  target_value: number;
  current_value?: number;
  deadline?: string | null;
  category: string;
}

export interface AddDepositData {
  amount: number;
  description?: string;
}

export interface WithdrawData {
  amount: number;
  description?: string;
}

export const objectiveApi = {
  // Listar todos os objetivos
  getAll: async (): Promise<Objective[]> => {
    return await apiRequest('/api/finance/objectives/');
  },

  // Buscar objetivo por slug
  getBySlug: async (slug: string): Promise<Objective> => {
    return await apiRequest(`/api/finance/objectives/${slug}/`);
  },

  // Criar novo objetivo
  create: async (data: CreateObjectiveData): Promise<Objective> => {
    return await apiRequest('/api/finance/objectives/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Atualizar objetivo
  update: async (slug: string, data: Partial<CreateObjectiveData>): Promise<Objective> => {
    return await apiRequest(`/api/finance/objectives/${slug}/`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // Atualização parcial
  partialUpdate: async (slug: string, data: Partial<CreateObjectiveData>): Promise<Objective> => {
    return await apiRequest(`/api/finance/objectives/${slug}/`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  // Deletar objetivo
  delete: async (slug: string): Promise<void> => {
    await apiRequest(`/api/finance/objectives/${slug}/`, {
      method: 'DELETE',
    });
  },

  // Adicionar depósito
  addDeposit: async (slug: string, data: AddDepositData): Promise<{
    objective: Objective;
    deposit: ObjectiveDeposit;
  }> => {
    return await apiRequest(`/api/finance/objectives/${slug}/add_deposit/`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Fazer saque
  withdraw: async (slug: string, data: WithdrawData): Promise<{
    objective: Objective;
    withdrawal: ObjectiveDeposit;
  }> => {
    return await apiRequest(`/api/finance/objectives/${slug}/withdraw/`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};

export default objectiveApi;
