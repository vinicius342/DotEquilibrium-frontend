import { useState, useEffect } from 'react';
import { payrollApi, Employee, Payroll, AdvancePayment, PayrollPeriod, PayrollPeriodItem } from '../services/payrollApi';

export const usePayrollData = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [payrolls, setPayrolls] = useState<Payroll[]>([]);
  const [advancePayments, setAdvancePayments] = useState<AdvancePayment[]>([]);
  const [payrollPeriods, setPayrollPeriods] = useState<PayrollPeriod[]>([]);
  const [activePeriod, setActivePeriod] = useState<PayrollPeriod | null>(null);
  const [periodItems, setPeriodItems] = useState<PayrollPeriodItem[]>([]);
  const [allPeriodItems, setAllPeriodItems] = useState<{ [periodId: number]: PayrollPeriodItem[] }>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEmployees = async () => {
    try {
      const data = await payrollApi.getEmployees();
      setEmployees(data);
    } catch (err) {
      setError('Erro ao carregar funcionários');
      console.error('Erro ao carregar funcionários:', err);
    }
  };

  const fetchPayrolls = async () => {
    try {
      const data = await payrollApi.getPayrolls();
      // Adicionar o nome do funcionário nos payrolls
      const payrollsWithEmployeeNames = data.map(payroll => {
        const employee = employees.find(emp => emp.id === payroll.employee);
        return {
          ...payroll,
          employee_name: employee?.name || 'Funcionário não encontrado'
        };
      });
      setPayrolls(payrollsWithEmployeeNames);
    } catch (err) {
      console.error('Erro ao carregar folhas de pagamento:', err);
      // Não definir erro aqui pois pode não ter folhas ainda
    }
  };

  const fetchAdvancePayments = async () => {
    try {
      const data = await payrollApi.getAdvancePayments();
      // Adicionar o nome do funcionário nos adiantamentos
      const advancePaymentsWithEmployeeNames = data.map(advance => {
        const employee = employees.find(emp => emp.id === advance.employee);
        return {
          ...advance,
          employee_name: employee?.name || 'Funcionário não encontrado'
        };
      });
      setAdvancePayments(advancePaymentsWithEmployeeNames);
    } catch (err) {
      console.error('Erro ao carregar adiantamentos:', err);
      // Não definir erro aqui pois pode não ter adiantamentos ainda
    }
  };

  const fetchPayrollPeriods = async () => {
    try {
      const data = await payrollApi.getPayrollPeriods();
      setPayrollPeriods(data);
    } catch (err) {
      console.error('Erro ao carregar períodos:', err);
    }
  };

  const fetchActivePeriod = async () => {
    try {
      const data = await payrollApi.getActivePeriod();
      setActivePeriod(data);
      if (data.id) {
        // Para período ativo, buscar itens específicos do período
        const items = await payrollApi.getPeriodItems(data.id);
        setPeriodItems(items);
      }
    } catch (err) {
      console.error('Nenhum período ativo encontrado:', err);
      setActivePeriod(null);
    }
  };

  const fetchPeriodItems = async (periodId?: number) => {
    try {
      const data = await payrollApi.getPeriodItems(periodId);
      // Salvar os dados brutos primeiro
      if (periodId) {
        setAllPeriodItems(prev => ({ ...prev, [periodId]: data }));
      } else {
        setPeriodItems(data);
      }
    } catch (err) {
      console.error('Erro ao carregar itens do período:', err);
      if (periodId) {
        setAllPeriodItems(prev => ({ ...prev, [periodId]: [] }));
      } else {
        setPeriodItems([]);
      }
    }
  };

  const fetchAllData = async () => {
    setLoading(true);
    setError(null);
    try {
      await fetchEmployees();
      // Buscar período ativo independentemente dos funcionários
      await fetchActivePeriod();
      await fetchPayrollPeriods();
    } catch (err) {
      setError('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  // Fetch employees first, then payrolls and advance payments
  useEffect(() => {
    fetchAllData();
  }, []);

  // Fetch payrolls and advance payments after employees are loaded
  useEffect(() => {
    if (employees.length > 0) {
      fetchPayrolls();
      fetchAdvancePayments();
    }
  }, [employees]);

  // Atualizar nomes dos funcionários nos itens do período quando funcionários são carregados
  useEffect(() => {
    if (employees.length > 0 && periodItems.length > 0) {
      const itemsWithEmployeeNames = periodItems.map(item => {
        const employee = employees.find(emp => emp.id === item.employee);
        return {
          ...item,
          employee_name: employee?.name || 'Funcionário não encontrado'
        };
      });
      setPeriodItems(itemsWithEmployeeNames);
    }
  }, [employees]);

  const createEmployee = async (employeeData: Omit<Employee, 'id'>) => {
    try {
      const newEmployee = await payrollApi.createEmployee(employeeData);
      setEmployees(prev => [...prev, newEmployee]);
      return newEmployee;
    } catch (err) {
      setError('Erro ao criar funcionário');
      throw err;
    }
  };

  const updateEmployee = async (id: number, employeeData: Partial<Employee>) => {
    try {
      const updatedEmployee = await payrollApi.updateEmployee(id, employeeData);
      setEmployees(prev => 
        prev.map(emp => emp.id === id ? updatedEmployee : emp)
      );
      return updatedEmployee;
    } catch (err) {
      setError('Erro ao atualizar funcionário');
      throw err;
    }
  };

  const deleteEmployee = async (id: number) => {
    try {
      await payrollApi.deleteEmployee(id);
      setEmployees(prev => prev.filter(emp => emp.id !== id));
    } catch (err) {
      setError('Erro ao excluir funcionário');
      throw err;
    }
  };

  const createPayroll = async (payrollData: Omit<Payroll, 'id'>) => {
    try {
      const newPayroll = await payrollApi.createPayroll(payrollData);
      const employee = employees.find(emp => emp.id === newPayroll.employee);
      const payrollWithEmployeeName = {
        ...newPayroll,
        employee_name: employee?.name || 'Funcionário não encontrado'
      };
      setPayrolls(prev => [...prev, payrollWithEmployeeName]);
      return newPayroll;
    } catch (err) {
      setError('Erro ao criar folha de pagamento');
      throw err;
    }
  };

  const updatePayroll = async (id: number, payrollData: Partial<Payroll>) => {
    try {
      const updatedPayroll = await payrollApi.updatePayroll(id, payrollData);
      const employee = employees.find(emp => emp.id === updatedPayroll.employee);
      const payrollWithEmployeeName = {
        ...updatedPayroll,
        employee_name: employee?.name || 'Funcionário não encontrado'
      };
      setPayrolls(prev => 
        prev.map(payroll => payroll.id === id ? payrollWithEmployeeName : payroll)
      );
      return updatedPayroll;
    } catch (err) {
      setError('Erro ao atualizar folha de pagamento');
      throw err;
    }
  };

  const deletePayroll = async (id: number) => {
    try {
      await payrollApi.deletePayroll(id);
      setPayrolls(prev => prev.filter(payroll => payroll.id !== id));
    } catch (err) {
      setError('Erro ao excluir folha de pagamento');
      throw err;
    }
  };

  const createAdvancePayment = async (advanceData: Omit<AdvancePayment, 'id'>) => {
    try {
      const newAdvance = await payrollApi.createAdvancePayment(advanceData);
      const employee = employees.find(emp => emp.id === newAdvance.employee);
      const advanceWithEmployeeName = {
        ...newAdvance,
        employee_name: employee?.name || 'Funcionário não encontrado'
      };
      setAdvancePayments(prev => [...prev, advanceWithEmployeeName]);
      return newAdvance;
    } catch (err) {
      setError('Erro ao criar adiantamento');
      throw err;
    }
  };

  const updateAdvancePayment = async (id: number, advanceData: Partial<AdvancePayment>) => {
    try {
      const updatedAdvance = await payrollApi.updateAdvancePayment(id, advanceData);
      const employee = employees.find(emp => emp.id === updatedAdvance.employee);
      const advanceWithEmployeeName = {
        ...updatedAdvance,
        employee_name: employee?.name || 'Funcionário não encontrado'
      };
      setAdvancePayments(prev => 
        prev.map(advance => advance.id === id ? advanceWithEmployeeName : advance)
      );
      return updatedAdvance;
    } catch (err) {
      setError('Erro ao atualizar adiantamento');
      throw err;
    }
  };

  const deleteAdvancePayment = async (id: number) => {
    try {
      await payrollApi.deleteAdvancePayment(id);
      setAdvancePayments(prev => prev.filter(advance => advance.id !== id));
    } catch (err) {
      setError('Erro ao excluir adiantamento');
      throw err;
    }
  };

  // PayrollPeriod functions
  const createPayrollPeriod = async (periodData: Omit<PayrollPeriod, 'id'>) => {
    try {
      const newPeriod = await payrollApi.createPayrollPeriod(periodData);
      setPayrollPeriods(prev => [...prev, newPeriod]);
      if (newPeriod.status === 'active') {
        setActivePeriod(newPeriod);
      }
      return newPeriod;
    } catch (err) {
      setError('Erro ao criar período');
      throw err;
    }
  };

  const updatePayrollPeriod = async (id: number, periodData: Partial<PayrollPeriod>) => {
    try {
      const updatedPeriod = await payrollApi.updatePayrollPeriod(id, periodData);
      setPayrollPeriods(prev => 
        prev.map(period => period.id === id ? updatedPeriod : period)
      );
      if (activePeriod?.id === id) {
        setActivePeriod(updatedPeriod);
      }
      return updatedPeriod;
    } catch (err) {
      setError('Erro ao atualizar período');
      throw err;
    }
  };

  const closePeriod = async (id: number) => {
    try {
      await payrollApi.closePeriod(id);
      setPayrollPeriods(prev => 
        prev.map(period => period.id === id ? { ...period, status: 'closed' as const } : period)
      );
      if (activePeriod?.id === id) {
        setActivePeriod(null);
        setPeriodItems([]);
      }
    } catch (err) {
      setError('Erro ao fechar período');
      throw err;
    }
  };

  const deletePayrollPeriod = async (id: number) => {
    try {
      await payrollApi.deletePayrollPeriod(id);
      setPayrollPeriods(prev => prev.filter(period => period.id !== id));
      if (activePeriod?.id === id) {
        setActivePeriod(null);
        setPeriodItems([]);
      }
    } catch (err) {
      setError('Erro ao excluir período');
      throw err;
    }
  };

  // PayrollPeriodItem functions
  const createPeriodItem = async (itemData: Omit<PayrollPeriodItem, 'id'>) => {
    try {
      const newItem = await payrollApi.createPeriodItem(itemData);
      const employee = employees.find(emp => emp.id === newItem.employee);
      const itemWithEmployeeName = {
        ...newItem,
        employee_name: employee?.name || 'Funcionário não encontrado'
      };
      setPeriodItems(prev => [...prev, itemWithEmployeeName]);
      return newItem;
    } catch (err) {
      setError('Erro ao adicionar item ao período');
      throw err;
    }
  };

  const updatePeriodItem = async (id: number, itemData: Partial<PayrollPeriodItem>) => {
    try {
      const updatedItem = await payrollApi.updatePeriodItem(id, itemData);
      const employee = employees.find(emp => emp.id === updatedItem.employee);
      const itemWithEmployeeName = {
        ...updatedItem,
        employee_name: employee?.name || 'Funcionário não encontrado'
      };
      setPeriodItems(prev => 
        prev.map(item => item.id === id ? itemWithEmployeeName : item)
      );
      return updatedItem;
    } catch (err) {
      setError('Erro ao atualizar item do período');
      throw err;
    }
  };

  const deletePeriodItem = async (id: number) => {
    try {
      await payrollApi.deletePeriodItem(id);
      setPeriodItems(prev => prev.filter(item => item.id !== id));
    } catch (err) {
      setError('Erro ao excluir item do período');
      throw err;
    }
  };

  return {
    employees,
    payrolls,
    advancePayments,
    payrollPeriods,
    activePeriod,
    periodItems,
    allPeriodItems,
    loading,
    error,
    refetch: fetchAllData,
    createEmployee,
    updateEmployee,
    deleteEmployee,
    createPayroll,
    updatePayroll,
    deletePayroll,
    createAdvancePayment,
    updateAdvancePayment,
    deleteAdvancePayment,
    createPayrollPeriod,
    updatePayrollPeriod,
    deletePayrollPeriod,
    closePeriod,
    createPeriodItem,
    updatePeriodItem,
    deletePeriodItem,
    fetchActivePeriod,
    fetchPeriodItems,
  };
};
