// Serviço de cadastro para integração com dj-rest-auth registration
const API_URL = import.meta.env.VITE_API_URL;

export interface RegisterCredentials {
  email: string;
  password1: string;
  password2: string;
  first_name?: string;
  last_name?: string;
}

export interface RegisterResponse {
  key: string; // Token de autenticação
}

export async function registerUser(data: RegisterCredentials): Promise<RegisterResponse> {
  const response = await fetch(`${API_URL}/api/auth/registration/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || errorData.message || 'Erro ao cadastrar');
  }

  return response.json();
}
