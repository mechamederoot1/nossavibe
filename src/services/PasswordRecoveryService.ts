import axios from 'axios';

const EMAIL_SERVICE_BASE_URL = 'http://localhost:3001';

export interface SendPasswordRecoveryRequest {
  email: string;
}

export interface VerifyRecoveryCodeRequest {
  email: string;
  code: string;
}

export interface VerifyRecoveryTokenRequest {
  token: string;
}

export interface CompletePasswordRecoveryRequest {
  token: string;
  newPassword: string;
}

export interface PasswordRecoveryResponse {
  success: boolean;
  message: string;
  expiresIn?: number;
  cooldownMs?: number;
  retryAfter?: number;
  token?: string;
  userId?: number;
  email?: string;
}

class PasswordRecoveryService {
  private baseURL: string;

  constructor(baseURL: string = EMAIL_SERVICE_BASE_URL) {
    this.baseURL = baseURL;
  }

  /**
   * Solicitar recuperação de senha por e-mail
   */
  async sendPasswordRecovery(data: SendPasswordRecoveryRequest): Promise<PasswordRecoveryResponse> {
    try {
      const response = await axios.post(`${this.baseURL}/send-password-recovery`, data);
      return response.data;
    } catch (error: any) {
      if (error.response?.data) {
        throw error.response.data;
      }
      throw {
        success: false,
        message: 'Erro de conexão com o serviço de e-mail'
      };
    }
  }

  /**
   * Verificar código de recuperação de 6 dígitos
   */
  async verifyRecoveryCode(data: VerifyRecoveryCodeRequest): Promise<PasswordRecoveryResponse> {
    try {
      const response = await axios.post(`${this.baseURL}/verify-recovery-code`, data);
      return response.data;
    } catch (error: any) {
      if (error.response?.data) {
        throw error.response.data;
      }
      throw {
        success: false,
        message: 'Erro de conexão com o serviço de e-mail'
      };
    }
  }

  /**
   * Verificar token de recuperação do link do e-mail
   */
  async verifyRecoveryToken(data: VerifyRecoveryTokenRequest): Promise<PasswordRecoveryResponse> {
    try {
      const response = await axios.post(`${this.baseURL}/verify-recovery-token`, data);
      return response.data;
    } catch (error: any) {
      if (error.response?.data) {
        throw error.response.data;
      }
      throw {
        success: false,
        message: 'Erro de conexão com o serviço de e-mail'
      };
    }
  }

  /**
   * Completar a recuperação de senha com nova senha
   */
  async completePasswordRecovery(data: CompletePasswordRecoveryRequest): Promise<PasswordRecoveryResponse> {
    try {
      const response = await axios.post(`${this.baseURL}/complete-password-recovery`, data);
      return response.data;
    } catch (error: any) {
      if (error.response?.data) {
        throw error.response.data;
      }
      throw {
        success: false,
        message: 'Erro de conexão com o serviço de e-mail'
      };
    }
  }

  /**
   * Testar conectividade do serviço
   */
  async healthCheck(): Promise<{ status: string; service: string; timestamp: string }> {
    try {
      const response = await axios.get(`${this.baseURL}/health`);
      return response.data;
    } catch (error: any) {
      throw {
        status: 'ERROR',
        service: 'Password Recovery Service',
        timestamp: new Date().toISOString(),
        error: error.message
      };
    }
  }
}

// Instância singleton do serviço
export const passwordRecoveryService = new PasswordRecoveryService();

export default PasswordRecoveryService;
