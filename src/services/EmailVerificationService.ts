import axios from 'axios';

const EMAIL_SERVICE_BASE_URL = 'http://localhost:8000/email-verification';

export interface SendVerificationRequest {
  email: string;
  firstName: string;
  userId: number;
}

export interface VerifyCodeRequest {
  userId: number;
  code: string;
}

export interface VerifyTokenRequest {
  token: string;
}

export interface VerificationResponse {
  success: boolean;
  message: string;
  expiresIn?: number;
  cooldownMs?: number;
  retryAfter?: number;
  userId?: number;
}

export interface VerificationStatusResponse {
  success: boolean;
  verified: boolean;
}

class EmailVerificationService {
  private baseURL: string;

  constructor(baseURL: string = EMAIL_SERVICE_BASE_URL) {
    this.baseURL = baseURL;
  }

  /**
   * Enviar e-mail de verificação
   */
  async sendVerificationEmail(data: SendVerificationRequest): Promise<VerificationResponse> {
    try {
      const payload = {
        email: data.email,
        first_name: data.firstName,
        user_id: data.userId
      };
      
      console.log('🔄 Enviando código de verificação:', payload);
      
      const response = await axios.post(`${this.baseURL}/send-verification`, payload, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      console.log('✅ Código enviado com sucesso:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Erro ao enviar código:', error.response?.data || error.message);
      
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
   * Verificar código de 6 dígitos
   */
  async verifyCode(data: VerifyCodeRequest): Promise<VerificationResponse> {
    try {
      const payload = {
        user_id: data.userId,
        code: data.code
      };
      
      console.log('🔄 Verificando código:', payload);
      
      const response = await axios.post(`${this.baseURL}/verify-code`, payload, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      console.log('✅ Código verificado:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Erro ao verificar código:', error.response?.data || error.message);
      console.error('❌ Erro completo:', error);

      if (error.response?.data) {
        throw error.response.data;
      }
      throw {
        success: false,
        message: error.message || 'Erro de conexão com o serviço de e-mail'
      };
    }
  }

  /**
   * Verificar token do link do e-mail
   */
  async verifyToken(data: VerifyTokenRequest): Promise<VerificationResponse> {
    try {
      const payload = {
        token: data.token
      };
      
      console.log('🔄 Verificando token:', payload);
      
      const response = await axios.post(`${this.baseURL}/verify-token`, payload, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      console.log('✅ Token verificado:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Erro ao verificar token:', error.response?.data || error.message);
      
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
   * Verificar status de verificação do usuário
   */
  async getVerificationStatus(userId: number): Promise<VerificationStatusResponse> {
    try {
      const response = await axios.get(`${this.baseURL}/verification-status/${userId}`);
      return response.data;
    } catch (error: any) {
      if (error.response?.data) {
        throw error.response.data;
      }
      throw {
        success: false,
        verified: false
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
        service: 'Email Service',
        timestamp: new Date().toISOString(),
        error: error.message
      };
    }
  }
}

// Instância singleton do serviço
export const emailVerificationService = new EmailVerificationService();

export default EmailVerificationService;
