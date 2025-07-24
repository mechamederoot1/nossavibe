const testConnection = require('./test-database-connection');
const createTables = require('./create-email-tables');

async function setupComplete() {
  console.log('🚀 Configuração Completa do Serviço de E-mail');
  console.log('===========================================');
  console.log('');
  
  try {
    // 1. Testar conexão com banco
    console.log('ETAPA 1: Testando conexão com banco de dados...');
    const connectionSuccess = await testConnection();
    
    if (!connectionSuccess) {
      console.log('❌ Falha na conexão com banco de dados!');
      console.log('');
      console.log('🔧 Soluções recomendadas:');
      console.log('1. Verifique se o MySQL está rodando');
      console.log('2. Verifique as credenciais no arquivo .env');
      console.log('3. Execute o script SQL: fix-mysql-permissions.sql');
      console.log('4. Tente alterar a senha do MySQL:');
      console.log('   mysqladmin -u root password "Evo@000#!"');
      return false;
    }
    
    console.log('');
    console.log('ETAPA 2: Criando tabelas necessárias...');
    const tablesSuccess = await createTables();
    
    if (!tablesSuccess) {
      console.log('❌ Falha na criação das tabelas!');
      return false;
    }
    
    console.log('');
    console.log('🎉 CONFIGURAÇÃO CONCLUÍDA COM SUCESSO!');
    console.log('=====================================');
    console.log('');
    console.log('✅ Banco de dados conectado');
    console.log('✅ Tabelas criadas/verificadas');
    console.log('✅ Serviço pronto para uso');
    console.log('');
    console.log('🚀 Para iniciar o serviço: npm start');
    console.log('🧪 Para testar: npm test');
    console.log('');
    
    return true;
    
  } catch (error) {
    console.error('❌ Erro durante a configuração:', error.message);
    return false;
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  setupComplete()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('❌ Erro inesperado:', error);
      process.exit(1);
    });
}

module.exports = setupComplete;