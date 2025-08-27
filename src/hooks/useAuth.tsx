import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { apiService, LoginCredentials, LoginResponse } from '@/lib/api';

interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isAuthenticated = !!user;

  // Verificar se usuário está logado ao carregar a aplicação
  useEffect(() => {
    const isJwtExpired = (token: string) => {
      try {
        const parts = token.split('.');
        if (parts.length !== 3) return false; // not a JWT
        const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
        if (!payload.exp) return false;
        const now = Math.floor(Date.now() / 1000);
        return payload.exp < now;
      } catch (e) {
        console.warn('Error decoding token', e);
        return false;
      }
    };

    const checkAuth = async () => {
      const token = localStorage.getItem('access_token');
      console.log('checkAuth start, token=', token);
      if (!token) {
        console.log('checkAuth: no token found');
        setIsLoading(false);
        return;
      }

      // If JWT, verify expiry before calling backend
      if (token.split('.').length === 3) {
        if (isJwtExpired(token)) {
          console.log('checkAuth: token expired, clearing local tokens');
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          setIsLoading(false);
          return;
        }
      }

      try {
        const userData = await apiService.getCurrentUser();
        console.log('checkAuth success, user=', userData);
        setUser(userData);
      } catch (error) {
        console.warn('Token inválido ou erro ao buscar usuário, removendo do localStorage', error);
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (credentials: LoginCredentials) => {
    setIsLoading(true);
    setError(null);

    try {
      const response: LoginResponse = await apiService.login(credentials);
      
      // Salvar tokens
      if (response.access) {
        localStorage.setItem('access_token', response.access);
      }
      if (response.refresh) {
        localStorage.setItem('refresh_token', response.refresh);
      }
      
      // Alguns backends não retornam o objeto user no login; buscar usuário atual
      try {
        const fetchedUser = await apiService.getCurrentUser();
        setUser(fetchedUser || null);
        console.log('login fetched user=', fetchedUser);
      } catch (fetchErr) {
        console.warn('login: não foi possível buscar usuário após login, limpando tokens', fetchErr);
        // limpar tokens para evitar estado inconsistente
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        setUser(null);
        setError('Erro ao buscar usuário depois do login');
        throw fetchErr;
      }
      
      console.log('login success, user=', response.user);
      // quick token check
      console.log('login stored access_token=', !!localStorage.getItem('access_token'), 'has refresh=', !!localStorage.getItem('refresh_token'));
    } catch (error: any) {
      console.error('login error', error);
      setError(error.message || 'Erro ao fazer login');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    console.log('logout start');
    try {
      await apiService.logout();
      console.log('logout: server notified');
    } catch (error) {
      console.warn('Erro ao fazer logout:', error);
    } finally {
      // Limpar dados locais independentemente do resultado
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      setUser(null);
      setIsLoading(false);
      console.log('logout: local tokens removed, user cleared');
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated,
    login,
    logout,
    error,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
}
