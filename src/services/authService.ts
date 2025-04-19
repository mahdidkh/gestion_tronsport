import api from './api';

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
  confirmPassword?: string;
}

// Test function to check API connection
export const testApiConnection = async () => {
  try {
    const response = await api.get('/health');
    console.log('API connection test successful:', response.data);
    return { success: true, data: response.data };
  } catch (error: any) {
    console.error('API connection test failed:', error.message);
    return { success: false, error: error.message };
  }
};

export const authService = {
  async login(credentials: LoginCredentials) {
    try {
      const response = await api.post('/auth/login', credentials);
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
      }
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async register(data: RegisterData) {
    try {
      console.log('Sending registration data:', data);
      console.log('API URL:', api.defaults.baseURL);
      const response = await api.post('/auth/register', data);
      console.log('Registration successful:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Registration error:', error.message);
      if (error.response) {
        console.error('Status:', error.response.status);
        console.error('Data:', error.response.data);
      }
      throw error;
    }
  },

  logout() {
    localStorage.removeItem('token');
  }
};