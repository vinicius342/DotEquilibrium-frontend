// Serviço para comunicação com a API Django
const API_URL = import.meta.env.VITE_API_URL;

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  access?: string;
  refresh?: string;
  key?: string;
  user?: {
    id: number;
    email: string;
    first_name: string;
    last_name: string;
  };
}

export interface ApiError {
  message: string;
  status: number;
}

class ApiService {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_URL}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    // Adicionar token se existir
    const token = localStorage.getItem('access_token');
    if (token) {
      // Detect JWT vs simple token
      const authScheme = token.split('.').length === 3 ? 'Bearer' : 'Token';
      config.headers = {
        ...config.headers,
        Authorization: `${authScheme} ${token}`,
      };
    }

    try {
      console.log('API request', (config.method || 'GET').toString(), url);
      const response = await fetch(url, config);
      console.log('API response status', response.status, 'for', url);
      
      if (!response.ok) {
        const text = await response.text().catch(() => '');
        let errorData: any = {};
        try {
          errorData = text ? JSON.parse(text) : {};
        } catch (e) {
          errorData = { detail: text };
        }
        console.warn('API error payload', errorData);
        throw {
          message: errorData.detail || errorData.message || 'Erro na requisição',
          status: response.status,
        } as ApiError;
      }

      return await response.json();
    } catch (error) {
      if (error instanceof Error) {
        throw {
          message: error.message,
          status: 0,
        } as ApiError;
      }
      throw error;
    }
  }

  // Autenticação
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    const resp = await this.request<any>('/api/auth/login/', {
      method: 'POST',
      body: JSON.stringify({
        email: credentials.email,
        password: credentials.password,
      }),
    });

    // Normalize different backend responses:
    // - dj-rest-auth Token returns { key: '...' }
    // - JWT returns { access, refresh }
    if (resp.key && !resp.access) {
      return { access: resp.key, user: resp.user } as LoginResponse;
    }

    return resp as LoginResponse;
  }

  async logout(): Promise<void> {
    try {
      await this.request('/api/auth/logout/', {
        method: 'POST',
      });
    } catch (error) {
      console.warn('Erro ao fazer logout no servidor:', error);
    }
  }

  async refreshToken(): Promise<{ access: string }> {
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) {
      throw new Error('Token de refresh não encontrado');
    }

    return this.request<{ access: string }>('/api/auth/token/refresh/', {
      method: 'POST',
      body: JSON.stringify({ refresh: refreshToken }),
    });
  }

  async getCurrentUser(): Promise<LoginResponse['user']> {
    return this.request<LoginResponse['user']>('/api/auth/user/');
  }
}

export const apiService = new ApiService();
