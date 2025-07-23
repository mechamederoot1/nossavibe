const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const crypto = require('crypto');
const mysql = require('mysql2/promise');
const path = require('path');
const fs = require('fs');

// Configurar dotenv para carregar o arquivo .env
const dotenv = require('dotenv');
const envPath = path.join(__dirname, '.env');

console.log('📁 Tentando carregar .env de:', envPath);

// Verificar se o arquivo .env existe
if (fs.existsSync(envPath)) {
  console.log('✅ Arquivo .env encontrado');
  const result = dotenv.config({ path: envPath });
  
  if (result.error) {
    console.error('❌ Erro ao carregar .env:', result.error);
  } else {
    console.log('✅ Arquivo .env carregado com sucesso');
  }
} else {
  console.log('❌ Arquivo .env não encontrado em:', envPath);
  console.log('🚨 ERRO: Arquivo .env é obrigatório para o funcionamento do serviço!');
  console.log('📝 Crie o arquivo .env com as configurações necessárias.');
  console.log('💡 Consulte o arquivo .env.example ou a documentação.');
  process.exit(1);
}

// Debug do arquivo .env
console.log('📋 Variáveis SMTP carregadas:');
console.log('  - SMTP_HOST:', process.env.SMTP_HOST || 'undefined');
console.log('  - SMTP_PORT:', process.env.SMTP_PORT || 'undefined');
console.log('  - SMTP_USER:', process.env.SMTP_USER || 'undefined');
console.log('  - SMTP_FROM:', process.env.SMTP_FROM || 'undefined');

const app = express();
const PORT = process.env.PORT || 3001;

// Debug das variáveis de ambiente após carregamento
console.log('🔍 Debug das variáveis de ambiente:');
console.log('  - NODE_ENV:', process.env.NODE_ENV);
console.log('  - PORT:', process.env.PORT);
console.log('  - SMTP_HOST:', process.env.SMTP_HOST ? '✅ Definido' : '❌ Não definido');
console.log('  - SMTP_PORT:', process.env.SMTP_PORT ? '✅ Definido' : '❌ Não definido');
console.log('  - SMTP_USER:', process.env.SMTP_USER ? '✅ Definido' : '❌ Não definido');
console.log('  - SMTP_PASS:', process.env.SMTP_PASS ? '✅ Definido' : '❌ Não definido');
console.log('  - SMTP_FROM:', process.env.SMTP_FROM ? '✅ Definido' : '❌ Não definido');

// Validar variáveis de ambiente necessárias
const requiredEnvVars = ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS', 'SMTP_FROM'];
const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.error('❌ Variáveis de ambiente faltando:', missingVars);
  console.log('💡 Execute o comando: node setup.js');
  console.log('📝 Ou configure manualmente o arquivo .env');
  
  console.log('❌ Configure o arquivo .env com suas credenciais antes de continuar.');
  console.log('📋 Variáveis faltando:', missingVars.join(', '));
  process.exit(1);
} else {
  console.log('✅ Todas as variáveis de ambiente carregadas com sucesso');
}

// Middleware
app.use(cors());
app.use(express.json());

// Configuração do transportador de e-mail
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false, // true para 465, false para outros ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  tls: {
    rejectUnauthorized: false
  }
});

// Configuração do banco de dados
const dbConfig = {
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  acquireTimeout: 60000,
  timeout: 60000,
  reconnect: true
};

// Pool de conexões do banco
const pool = mysql.createPool(dbConfig);

// Função para gerar código de verificação
function generateVerificationCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Função para gerar token de verificação
function generateVerificationToken() {
  return crypto.randomBytes(32).toString('hex');
}

// Template de e-mail de verificação
function getEmailTemplate(firstName, code, token, baseUrl = 'http://localhost:5173') {
  const verificationUrl = `${baseUrl}/verify-email?token=${token}`;
  
  return `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Confirme seu e-mail - Vibe</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background-color: #f7f7f7;
        }
        .container {
          background: white;
          padding: 40px;
          border-radius: 10px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
        }
        .logo {
          font-size: 32px;
          font-weight: bold;
          color: #6366f1;
          margin-bottom: 10px;
        }
        .title {
          font-size: 24px;
          margin-bottom: 20px;
          color: #1f2937;
        }
        .code-container {
          background: #f8fafc;
          border: 2px dashed #e2e8f0;
          border-radius: 8px;
          padding: 20px;
          text-align: center;
          margin: 20px 0;
        }
        .verification-code {
          font-size: 32px;
          font-weight: bold;
          color: #6366f1;
          letter-spacing: 4px;
          margin: 10px 0;
        }
        .button {
          display: inline-block;
          background: #6366f1;
          color: white;
          padding: 15px 30px;
          text-decoration: none;
          border-radius: 8px;
          font-weight: 500;
          margin: 20px 0;
          text-align: center;
        }
        .button:hover {
          background: #4f46e5;
        }
        .footer {
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid #e2e8f0;
          font-size: 14px;
          color: #6b7280;
          text-align: center;
        }
        .warning {
          background: #fef3c7;
          border: 1px solid #f59e0b;
          border-radius: 6px;
          padding: 15px;
          margin: 20px 0;
          color: #92400e;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">Vibe</div>
          <h1 class="title">Confirme seu e-mail</h1>
        </div>
        
        <p>Olá <strong>${firstName}</strong>,</p>
        
        <p>Bem-vindo ao Vibe! Para concluir seu cadastro, você precisa confirmar seu endereço de e-mail.</p>
        
        <div class="code-container">
          <p><strong>Seu código de verificação:</strong></p>
          <div class="verification-code">${code}</div>
          <p style="font-size: 14px; color: #6b7280;">Este código expira em 5 minutos</p>
        </div>
        
        <p style="text-align: center;">
          <strong>Ou clique no botão abaixo para confirmar automaticamente:</strong>
        </p>
        
        <div style="text-align: center;">
          <a href="${verificationUrl}" class="button">
            ✓ Confirmar E-mail
          </a>
        </div>
        
        <div class="warning">
          <strong>⚠️ Importante:</strong> Se você não solicitou este cadastro, pode ignorar este e-mail com segurança.
        </div>
        
        <div class="footer">
          <p>Este e-mail foi enviado para confirmar seu cadastro no Vibe.</p>
          <p>Se você não conseguir clicar no botão, copie e cole o código acima na página de verificação.</p>
          <p>&copy; 2024 Vibe. Todos os direitos reservados.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

// Template de e-mail de recuperação de senha
function getPasswordRecoveryTemplate(firstName, code, token, baseUrl = 'http://localhost:5173') {
  const resetUrl = `${baseUrl}/reset-password?token=${token}`;

  return `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Recuperação de Senha - Vibe</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background-color: #f7f7f7;
        }
        .container {
          background: white;
          padding: 40px;
          border-radius: 10px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
        }
        .logo {
          font-size: 32px;
          font-weight: bold;
          color: #ef4444;
          margin-bottom: 10px;
        }
        .title {
          font-size: 24px;
          margin-bottom: 20px;
          color: #1f2937;
        }
        .code-container {
          background: #fef2f2;
          border: 2px dashed #fecaca;
          border-radius: 8px;
          padding: 20px;
          text-align: center;
          margin: 20px 0;
        }
        .verification-code {
          font-size: 32px;
          font-weight: bold;
          color: #ef4444;
          letter-spacing: 4px;
          margin: 10px 0;
        }
        .button {
          display: inline-block;
          background: #ef4444;
          color: white;
          padding: 15px 30px;
          text-decoration: none;
          border-radius: 8px;
          font-weight: 500;
          margin: 20px 0;
          text-align: center;
        }
        .button:hover {
          background: #dc2626;
        }
        .footer {
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid #e2e8f0;
          font-size: 14px;
          color: #6b7280;
          text-align: center;
        }
        .warning {
          background: #fef3c7;
          border: 1px solid #f59e0b;
          border-radius: 6px;
          padding: 15px;
          margin: 20px 0;
          color: #92400e;
        }
        .security-notice {
          background: #fee2e2;
          border: 1px solid #fca5a5;
          border-radius: 6px;
          padding: 15px;
          margin: 20px 0;
          color: #991b1b;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">🔒 Vibe</div>
          <h1 class="title">Recuperação de Senha</h1>
        </div>

        <p>Olá <strong>${firstName}</strong>,</p>

        <p>Recebemos uma solicitação para redefinir a senha da sua conta no Vibe.</p>

        <div class="code-container">
          <p><strong>Seu código de recuperação:</strong></p>
          <div class="verification-code">${code}</div>
          <p style="font-size: 14px; color: #6b7280;">Este código expira em 15 minutos</p>
        </div>

        <p style="text-align: center;">
          <strong>Ou clique no botão abaixo para redefinir automaticamente:</strong>
        </p>

        <div style="text-align: center;">
          <a href="${resetUrl}" class="button">
            🔑 Redefinir Senha
          </a>
        </div>

        <div class="security-notice">
          <strong>🛡️ Segurança:</strong> Se você não solicitou esta recuperação de senha, ignore este e-mail. Sua conta permanece segura.
        </div>

        <div class="warning">
          <strong>⚠️ Importante:</strong> Este link é válido por apenas 15 minutos por motivos de segurança.
        </div>

        <div class="footer">
          <p>Este e-mail foi enviado para <strong>recuperacao@meuvibe.com</strong></p>
          <p>Se você não conseguir clicar no botão, copie e cole o código acima na página de recuperação.</p>
          <p>&copy; 2024 Vibe. Todos os direitos reservados.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

// Rota de teste para verificar se o serviço está funcionando
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    service: 'Vibe Email Service',
    timestamp: new Date().toISOString()
  });
});

// Rota para enviar e-mail de verificação
app.post('/send-verification', async (req, res) => {
  try {
    console.log('📧 Recebida solicitação de verificação:', {
      email: req.body.email,
      firstName: req.body.firstName,
      userId: req.body.userId
    });

    const { email, firstName, userId } = req.body;

    if (!email || !firstName || !userId) {
      console.log('❌ Dados obrigatórios faltando:', { email: !!email, firstName: !!firstName, userId: !!userId });
      return res.status(400).json({
        success: false,
        message: 'E-mail, nome e ID do usuário são obrigatórios'
      });
    }

    // Verificar se o e-mail é válido
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.log('❌ E-mail inválido:', email);
      return res.status(400).json({
        success: false,
        message: 'E-mail inválido'
      });
    }

    console.log('🔍 Verificando limite de tentativas...');
    // Verificar limite de tentativas (anti-spam)
    const [existingAttempts] = await pool.execute(
      `SELECT COUNT(*) as count FROM email_verifications 
       WHERE user_id = ? AND created_at > DATE_SUB(NOW(), INTERVAL 1 HOUR)`,
      [userId]
    );

    if (existingAttempts[0].count >= process.env.MAX_RESEND_ATTEMPTS) {
      console.log('❌ Muitas tentativas para usuário:', userId);
      return res.status(429).json({
        success: false,
        message: 'Muitas tentativas. Tente novamente em 1 hora.',
        retryAfter: 3600000
      });
    }

    console.log('🔍 Verificando cooldown...');
    // Verificar cooldown entre envios
    const [lastAttempt] = await pool.execute(
      `SELECT created_at FROM email_verifications
       WHERE user_id = ? ORDER BY created_at DESC LIMIT 1`,
      [userId]
    );

    if (lastAttempt.length > 0) {
      const lastAttemptTime = new Date(lastAttempt[0].created_at).getTime();
      const now = Date.now();
      const timeSinceLastAttempt = now - lastAttemptTime;
      const cooldownMs = parseInt(process.env.RESEND_COOLDOWN) || 60000; // Fallback para 60s

      console.log('⏰ Debug cooldown:');
      console.log(`   - Última tentativa: ${lastAttempt[0].created_at}`);
      console.log(`   - Timestamp última: ${lastAttemptTime}`);
      console.log(`   - Timestamp atual: ${now}`);
      console.log(`   - Diferença: ${timeSinceLastAttempt}ms`);
      console.log(`   - Cooldown config: ${cooldownMs}ms`);

      // Só aplicar cooldown se for um valor positivo e menor que o limite
      if (timeSinceLastAttempt > 0 && timeSinceLastAttempt < cooldownMs) {
        const remainingTime = Math.ceil((cooldownMs - timeSinceLastAttempt) / 1000);
        console.log('❌ Cooldown ativo:', remainingTime, 'segundos restantes');
        return res.status(429).json({
          success: false,
          message: `Aguarde ${remainingTime} segundos antes de solicitar um novo código`,
          retryAfter: remainingTime * 1000
        });
      } else {
        console.log('✅ Cooldown expirado ou timestamp inválido - permitindo envio');
      }
    } else {
      console.log('✅ Primeira tentativa - sem cooldown');
    }

    // Gerar código e token de verificação
    const verificationCode = generateVerificationCode();
    const verificationToken = generateVerificationToken();
    const expiresAt = new Date(Date.now() + parseInt(process.env.VERIFICATION_CODE_EXPIRY));

    console.log('📝 Gerando código:', verificationCode);
    console.log('🔗 Gerando token:', verificationToken.substring(0, 10) + '...');

    console.log('💾 Salvando no banco de dados...');
    // Primeiro, deletar qualquer registro anterior para este usuário
    await pool.execute(
      'DELETE FROM email_verifications WHERE user_id = ?',
      [userId]
    );

    // Agora inserir um novo registro limpo
    await pool.execute(
      `INSERT INTO email_verifications (user_id, email, verification_code, verification_token, expires_at, created_at, attempts, verified)
       VALUES (?, ?, ?, ?, ?, NOW(), 1, FALSE)`,
      [userId, email, verificationCode, verificationToken, expiresAt]
    );

    console.log('✅ Dados salvos no banco!');
    console.log('📧 Preparando e-mail...');

    // Enviar e-mail
    const mailOptions = {
      from: {
        name: 'Vibe',
        address: process.env.SMTP_FROM
      },
      to: email,
      subject: 'Confirme seu e-mail - Vibe',
      html: getEmailTemplate(firstName, verificationCode, verificationToken)
    };

    console.log('📤 Enviando e-mail via SMTP...');
    await transporter.sendMail(mailOptions);

    console.log(`��� E-mail de verificação enviado com sucesso para: ${email}`);
    console.log(`📋 Código: ${verificationCode}`);
    console.log(`⏰ Expira em: ${expiresAt}`);

    res.json({
      success: true,
      message: 'E-mail de verificação enviado com sucesso',
      expiresIn: parseInt(process.env.VERIFICATION_CODE_EXPIRY),
      cooldownMs: parseInt(process.env.RESEND_COOLDOWN)
    });

  } catch (error) {
    console.error('❌ Erro detalhado ao enviar e-mail:');
    console.error('   Tipo:', error.constructor.name);
    console.error('   Mensagem:', error.message);
    console.error('   Código:', error.code);
    console.error('   Stack completo:', error.stack);
    
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor ao enviar e-mail',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Rota para verificar código
app.post('/verify-code', async (req, res) => {
  try {
    const { userId, code } = req.body;

    if (!userId || !code) {
      return res.status(400).json({
        success: false,
        message: 'ID do usuário e código são obrigatórios'
      });
    }

    // Buscar registro de verificação
    const [results] = await pool.execute(
      `SELECT * FROM email_verifications 
       WHERE user_id = ? AND verification_code = ? AND verified = FALSE AND expires_at > NOW()
       ORDER BY created_at DESC LIMIT 1`,
      [userId, code]
    );

    if (results.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Código inválido ou expirado'
      });
    }

    // Marcar como verificado
    await pool.execute(
      'UPDATE email_verifications SET verified = TRUE, verified_at = NOW() WHERE id = ?',
      [results[0].id]
    );

    // Atualizar usuário como verificado
    await pool.execute(
      'UPDATE users SET is_verified = TRUE WHERE id = ?',
      [userId]
    );

    console.log(`✅ E-mail verificado para usuário ID: ${userId}`);

    res.json({
      success: true,
      message: 'E-mail verificado com sucesso!'
    });

  } catch (error) {
    console.error('❌ Erro ao verificar código:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// Rota para verificar token (link do e-mail)
app.post('/verify-token', async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Token é obrigatório'
      });
    }

    // Buscar registro de verificação
    const [results] = await pool.execute(
      `SELECT * FROM email_verifications 
       WHERE verification_token = ? AND verified = FALSE AND expires_at > NOW()
       ORDER BY created_at DESC LIMIT 1`,
      [token]
    );

    if (results.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Token inválido ou expirado'
      });
    }

    // Marcar como verificado
    await pool.execute(
      'UPDATE email_verifications SET verified = TRUE, verified_at = NOW() WHERE id = ?',
      [results[0].id]
    );

    // Atualizar usuário como verificado
    await pool.execute(
      'UPDATE users SET is_verified = TRUE WHERE id = ?',
      [results[0].user_id]
    );

    console.log(`✅ E-mail verificado via token para usuário ID: ${results[0].user_id}`);

    res.json({
      success: true,
      message: 'E-mail verificado com sucesso!',
      userId: results[0].user_id
    });

  } catch (error) {
    console.error('❌ Erro ao verificar token:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// Rota para verificar status de verificação
app.get('/verification-status/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const [results] = await pool.execute(
      'SELECT is_verified FROM users WHERE id = ?',
      [userId]
    );

    if (results.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }

    res.json({
      success: true,
      verified: !!results[0].is_verified
    });

  } catch (error) {
    console.error('❌ Erro ao verificar status:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// Rota para solicitar recuperação de senha
app.post('/send-password-recovery', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'E-mail é obrigatório'
      });
    }

    // Verificar se o e-mail é válido
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'E-mail inválido'
      });
    }

    // Verificar se o usuário existe
    const [userResults] = await pool.execute(
      'SELECT id, first_name, last_name FROM users WHERE email = ?',
      [email]
    );

    if (userResults.length === 0) {
      // Por segurança, não revelamos se o e-mail existe ou não
      return res.json({
        success: true,
        message: 'Se este e-mail existir em nossa base, você receberá as instruções de recuperação.'
      });
    }

    const user = userResults[0];
    const userId = user.id;
    const firstName = user.first_name;

    // Verificar limite de tentativas (anti-spam)
    const [existingAttempts] = await pool.execute(
      `SELECT COUNT(*) as count FROM password_recovery
       WHERE user_id = ? AND created_at > DATE_SUB(NOW(), INTERVAL 1 HOUR)`,
      [userId]
    );

    if (existingAttempts[0].count >= 3) {
      return res.status(429).json({
        success: false,
        message: 'Muitas tentativas de recuperação. Tente novamente em 1 hora.',
        retryAfter: 3600000
      });
    }

    // Verificar cooldown entre envios (5 minutos)
    const [lastAttempt] = await pool.execute(
      `SELECT created_at FROM password_recovery
       WHERE user_id = ? ORDER BY created_at DESC LIMIT 1`,
      [userId]
    );

    if (lastAttempt.length > 0) {
      const timeSinceLastAttempt = Date.now() - new Date(lastAttempt[0].created_at).getTime();
      const cooldownMs = 300000; // 5 minutos

      if (timeSinceLastAttempt < cooldownMs) {
        const remainingTime = Math.ceil((cooldownMs - timeSinceLastAttempt) / 1000);
        return res.status(429).json({
          success: false,
          message: `Aguarde ${Math.ceil(remainingTime / 60)} minutos antes de solicitar nova recuperação`,
          retryAfter: remainingTime * 1000
        });
      }
    }

    // Gerar código e token de recuperação
    const recoveryCode = generateVerificationCode();
    const recoveryToken = generateVerificationToken();
    const expiresAt = new Date(Date.now() + 900000); // 15 minutos

    // Salvar no banco de dados
    await pool.execute(
      `INSERT INTO password_recovery (user_id, email, recovery_code, recovery_token, expires_at)
       VALUES (?, ?, ?, ?, ?)`,
      [userId, email, recoveryCode, recoveryToken, expiresAt]
    );

    // Log da solicitação
    await pool.execute(
      `INSERT INTO password_recovery_logs (user_id, email, action_type, success)
       VALUES (?, ?, 'request', TRUE)`,
      [userId, email]
    );

    // Enviar e-mail de recuperação
    const mailOptions = {
      from: {
        name: 'Vibe - Recuperação',
        address: 'recuperacao@meuvibe.com'
      },
      to: email,
      subject: '🔒 Recuperação de Senha - Vibe',
      html: getPasswordRecoveryTemplate(firstName, recoveryCode, recoveryToken)
    };

    await transporter.sendMail(mailOptions);

    console.log(`🔑 E-mail de recuperação enviado para: ${email}`);

    res.json({
      success: true,
      message: 'E-mail de recuperação enviado com sucesso',
      expiresIn: 900000, // 15 minutos
      cooldownMs: 300000 // 5 minutos
    });

  } catch (error) {
    console.error('❌ Erro ao enviar e-mail de recuperação:', error);

    // Log do erro
    if (req.body.email) {
      try {
        await pool.execute(
          `INSERT INTO password_recovery_logs (user_id, email, action_type, success, error_message)
           VALUES (0, ?, 'request', FALSE, ?)`,
          [req.body.email, error.message]
        );
      } catch (logError) {
        console.error('❌ Erro ao logar tentativa:', logError);
      }
    }

    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor ao enviar e-mail'
    });
  }
});

// Rota para verificar código de recuperação
app.post('/verify-recovery-code', async (req, res) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({
        success: false,
        message: 'E-mail e código são obrigatórios'
      });
    }

    // Buscar registro de recuperação
    const [results] = await pool.execute(
      `SELECT pr.*, u.id as user_id FROM password_recovery pr
       JOIN users u ON pr.user_id = u.id
       WHERE pr.email = ? AND pr.recovery_code = ? AND pr.used = FALSE AND pr.expires_at > NOW()
       ORDER BY pr.created_at DESC LIMIT 1`,
      [email, code]
    );

    if (results.length === 0) {
      // Log da tentativa falhada
      await pool.execute(
        `INSERT INTO password_recovery_logs (user_id, email, action_type, success, error_message)
         VALUES (0, ?, 'code_attempt', FALSE, 'Código inválido ou expirado')`,
        [email]
      );

      return res.status(400).json({
        success: false,
        message: 'Código inválido ou expirado'
      });
    }

    const recovery = results[0];

    // Log da tentativa bem-sucedida
    await pool.execute(
      `INSERT INTO password_recovery_logs (user_id, email, action_type, recovery_id, success)
       VALUES (?, ?, 'code_attempt', ?, TRUE)`,
      [recovery.user_id, email, recovery.id]
    );

    res.json({
      success: true,
      message: 'Código válido',
      token: recovery.recovery_token,
      userId: recovery.user_id
    });

  } catch (error) {
    console.error('❌ Erro ao verificar código de recuperação:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// Rota para verificar token de recuperação
app.post('/verify-recovery-token', async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Token é obrigatório'
      });
    }

    // Buscar registro de recuperação
    const [results] = await pool.execute(
      `SELECT pr.*, u.id as user_id, u.email FROM password_recovery pr
       JOIN users u ON pr.user_id = u.id
       WHERE pr.recovery_token = ? AND pr.used = FALSE AND pr.expires_at > NOW()
       ORDER BY pr.created_at DESC LIMIT 1`,
      [token]
    );

    if (results.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Token inválido ou expirado'
      });
    }

    const recovery = results[0];

    // Log da verifica��ão
    await pool.execute(
      `INSERT INTO password_recovery_logs (user_id, email, action_type, recovery_id, success)
       VALUES (?, ?, 'token_attempt', ?, TRUE)`,
      [recovery.user_id, recovery.email, recovery.id]
    );

    res.json({
      success: true,
      message: 'Token válido',
      userId: recovery.user_id,
      email: recovery.email
    });

  } catch (error) {
    console.error('❌ Erro ao verificar token de recuperação:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// Rota para finalizar recuperação de senha
app.post('/complete-password-recovery', async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Token e nova senha são obrigatórios'
      });
    }

    // Validar senha
    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'A senha deve ter pelo menos 6 caracteres'
      });
    }

    // Buscar registro de recuperação
    const [results] = await pool.execute(
      `SELECT pr.*, u.id as user_id FROM password_recovery pr
       JOIN users u ON pr.user_id = u.id
       WHERE pr.recovery_token = ? AND pr.used = FALSE AND pr.expires_at > NOW()
       ORDER BY pr.created_at DESC LIMIT 1`,
      [token]
    );

    if (results.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Token inválido ou expirado'
      });
    }

    const recovery = results[0];

    // Hash da nova senha (nota: em produção, use bcrypt no backend principal)
    // Aqui apenas simulamos o processo

    // Marcar token como usado
    await pool.execute(
      'UPDATE password_recovery SET used = TRUE, used_at = NOW() WHERE id = ?',
      [recovery.id]
    );

    // Log do sucesso
    await pool.execute(
      `INSERT INTO password_recovery_logs (user_id, email, action_type, recovery_id, success)
       VALUES (?, ?, 'success', ?, TRUE)`,
      [recovery.user_id, recovery.email, recovery.id]
    );

    console.log(`🔑 Senha redefinida com sucesso para usuário ID: ${recovery.user_id}`);

    res.json({
      success: true,
      message: 'Senha redefinida com sucesso!',
      userId: recovery.user_id
    });

  } catch (error) {
    console.error('❌ Erro ao completar recuperação:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// Rota para teste de envio de e-mail
app.post('/test-email', async (req, res) => {
  try {
    const testEmail = {
      from: {
        name: 'Vibe',
        address: process.env.SMTP_FROM
      },
      to: process.env.SMTP_USER, // Enviar para o próprio e-mail de suporte
      subject: 'Teste do Microserviço de E-mail - Vibe',
      html: `
        <h2>Teste de E-mail</h2>
        <p>Este é um e-mail de teste do microserviço de e-mail do Vibe.</p>
        <p>Configurações SMTP funcionando corretamente!</p>
        <p>Data/Hora: ${new Date().toLocaleString('pt-BR')}</p>
      `
    };

    await transporter.sendMail(testEmail);
    
    res.json({
      success: true,
      message: 'E-mail de teste enviado com sucesso!'
    });

  } catch (error) {
    console.error('❌ Erro no teste de e-mail:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao enviar e-mail de teste',
      error: error.message
    });
  }
});

// Inicializar servidor
app.listen(PORT, () => {
  console.log(`🚀 Microserviço de E-mail rodando na porta ${PORT}`);
  console.log(`📧 SMTP: ${process.env.SMTP_HOST}:${process.env.SMTP_PORT}`);
  console.log(`📮 From: ${process.env.SMTP_FROM}`);
});

module.exports = app;
