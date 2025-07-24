const axios = require('axios');

const BASE_URL = 'http://localhost:3001';

async function testEmailService() {
  console.log('🧪 Testando Microserviço de E-mail...');
  console.log('=====================================');

  try {
    // 1. Testar health check
    console.log('1️⃣ Testando health check...');
    const healthResponse = await axios.get(`${BASE_URL}/health`);
    console.log('✅ Health check:', healthResponse.data);

    // 2. Testar envio de e-mail de teste
    console.log('\n2️⃣ Testando envio de e-mail...');
    const testEmailResponse = await axios.post(`${BASE_URL}/test-email`);
    console.log('✅ Teste de e-mail:', testEmailResponse.data);

    // 3. Testar envio de verificação (simulado)
    console.log('\n3️⃣ Testando envio de verificação...');
    const verificationData = {
      email: 'teste@exemplo.com',
      firstName: 'Teste',
      userId: 999
    };

    try {
      const verificationResponse = await axios.post(`${BASE_URL}/send-verification`, verificationData);
      console.log('✅ Verificação enviada:', verificationResponse.data);
    } catch (verificationError) {
      if (verificationError.response?.status === 429) {
        console.log('⚠️  Rate limit atingido (normal em testes)');
      } else {
        console.log('❌ Erro na verificação:', verificationError.response?.data || verificationError.message);
      }
    }

    console.log('\n🎉 Todos os testes concluídos!');

  } catch (error) {
    console.error('❌ Erro nos testes:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('💡 Certifique-se de que o serviço está rodando na porta 3001');
      console.log('🚀 Execute: npm start');
    }
  }
}

// Executar testes
testEmailService();