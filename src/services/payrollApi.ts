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

  // Para DELETE que retorna 204 No Content, não tentar fazer parse JSON
  if (response.status === 204 || response.headers.get('content-length') === '0') {
    return null;
  }

  return response.json();
};

export interface Employee {
  id?: number;
  name: string;
  role: string;
  salary: number;
  hiring_date: string;
  termination_date?: string;
}

export interface Payroll {
  id?: number;
  employee: number;
  employee_name?: string;
  period_start: string;
  period_end: string;
  gross_amount: number;
  deductions: number;
  net_amount: number;
  payment_date: string;
}

export interface AdvancePayment {
  id?: number;
  employee: number;
  employee_name?: string;
  date_given: string;
  amount: number;
  description: string;
  linked_payroll?: number;
}

export interface PayrollPeriod {
  id?: number;
  name: string;
  start_date: string;
  end_date: string;
  status: 'active' | 'closed';
  created_at?: string;
  closed_at?: string;
  items?: PayrollPeriodItem[];
  total_amount?: number;
  employees_count?: number;
}

export interface PayrollPeriodItem {
  id?: number;
  period: number;
  employee: number;
  employee_name?: string;
  payment_type: 'salary' | 'daily' | 'weekly' | 'bonus' | 'extra' | 'other';
  payment_type_display?: string;
  amount: number;
  description: string;
  date_added?: string;
  is_processed: boolean;
  is_advance?: boolean;
  payment_date?: string;
}

export const payrollApi = {
  // Employee endpoints
  getEmployees: (): Promise<Employee[]> => apiRequest('/api/payroll/employees/'),
  getEmployee: (id: number): Promise<Employee> => apiRequest(`/api/payroll/employees/${id}/`),
  createEmployee: (data: Omit<Employee, 'id'>): Promise<Employee> =>
    apiRequest('/api/payroll/employees/', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateEmployee: (id: number, data: Partial<Employee>): Promise<Employee> =>
    apiRequest(`/api/payroll/employees/${id}/`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  deleteEmployee: (id: number): Promise<void> =>
    apiRequest(`/api/payroll/employees/${id}/`, { method: 'DELETE' }),

  // Payroll endpoints
  getPayrolls: (): Promise<Payroll[]> => apiRequest('/api/payroll/payrolls/'),
  getPayroll: (id: number): Promise<Payroll> => apiRequest(`/api/payroll/payrolls/${id}/`),
  createPayroll: (data: Omit<Payroll, 'id'>): Promise<Payroll> =>
    apiRequest('/api/payroll/payrolls/', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updatePayroll: (id: number, data: Partial<Payroll>): Promise<Payroll> =>
    apiRequest(`/api/payroll/payrolls/${id}/`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  deletePayroll: (id: number): Promise<void> =>
    apiRequest(`/api/payroll/payrolls/${id}/`, { method: 'DELETE' }),

  // AdvancePayment endpoints
  getAdvancePayments: (): Promise<AdvancePayment[]> => apiRequest('/api/payroll/advance-payments/'),
  getAdvancePayment: (id: number): Promise<AdvancePayment> => apiRequest(`/api/payroll/advance-payments/${id}/`),
  createAdvancePayment: (data: Omit<AdvancePayment, 'id'>): Promise<AdvancePayment> =>
    apiRequest('/api/payroll/advance-payments/', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateAdvancePayment: (id: number, data: Partial<AdvancePayment>): Promise<AdvancePayment> =>
    apiRequest(`/api/payroll/advance-payments/${id}/`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  deleteAdvancePayment: (id: number): Promise<void> =>
    apiRequest(`/api/payroll/advance-payments/${id}/`, { method: 'DELETE' }),

  // PayrollPeriod endpoints
  getPayrollPeriods: (): Promise<PayrollPeriod[]> => apiRequest('/api/payroll/payroll-periods/'),
  getPayrollPeriod: (id: number): Promise<PayrollPeriod> => apiRequest(`/api/payroll/payroll-periods/${id}/`),
  createPayrollPeriod: (data: Omit<PayrollPeriod, 'id'>): Promise<PayrollPeriod> =>
    apiRequest('/api/payroll/payroll-periods/', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updatePayrollPeriod: (id: number, data: Partial<PayrollPeriod>): Promise<PayrollPeriod> =>
    apiRequest(`/api/payroll/payroll-periods/${id}/`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  deletePayrollPeriod: (id: number): Promise<void> =>
    apiRequest(`/api/payroll/payroll-periods/${id}/`, { method: 'DELETE' }),
  getActivePeriod: (): Promise<PayrollPeriod> =>
    apiRequest('/api/payroll/payroll-periods/active_period/'),
  closePeriod: (id: number): Promise<{ status: string }> =>
    apiRequest(`/api/payroll/payroll-periods/${id}/close_period/`, { method: 'POST' }),

  // PayrollPeriodItem endpoints
  getPeriodItems: (periodId?: number): Promise<PayrollPeriodItem[]> => {
    const url = periodId
      ? `/api/payroll/payroll-period-items/?period=${periodId}`
      : '/api/payroll/payroll-period-items/';
    return apiRequest(url);
  },
  getPeriodItem: (id: number): Promise<PayrollPeriodItem> =>
    apiRequest(`/api/payroll/payroll-period-items/${id}/`),
  createPeriodItem: (data: Omit<PayrollPeriodItem, 'id'>): Promise<PayrollPeriodItem> =>
    apiRequest('/api/payroll/payroll-period-items/', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updatePeriodItem: (id: number, data: Partial<PayrollPeriodItem>): Promise<PayrollPeriodItem> =>
    apiRequest(`/api/payroll/payroll-period-items/${id}/`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  deletePeriodItem: (id: number): Promise<void> =>
    apiRequest(`/api/payroll/payroll-period-items/${id}/`, { method: 'DELETE' }),
};
