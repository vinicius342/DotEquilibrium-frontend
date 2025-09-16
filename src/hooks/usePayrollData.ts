import { useState, useEffect } from 'react';
import { payrollApi, Employee, PayrollPeriod, PayrollPeriodItem } from '../services/payrollApi';

export const usePayrollData = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
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

  // Carregar dados iniciais
  useEffect(() => {
    fetchAllData();
  }, []);

  // Fetch employees first, then periods
  useEffect(() => {
    if (employees.length > 0) {
      // Após carregar funcionários, não precisa fazer nada adicional
      // Os dados dos períodos já são carregados no fetchAllData
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
