const mysql = require('mysql2/promise');
require('dotenv').config();

async function testDatabaseConnection() {
  console.log('🔍 Testando conexão com banco de dados...');
  
  const config = {
    host: process.env.DB_HOST || '127.0.0.1',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'Dashwoodi@1995',
    charset: 'utf8mb4'
  };
  
  console.log('📋 Configurações:');
  console.log(`   Host: ${config.host}`);
  console.log(`   Port: ${config.port}`);
  console.log(`   User: ${config.user}`);
  console.log(`   Password: ${'*'.repeat(config.password.length)}`);
  
  try {
    // Tentar conectar sem especificar banco
    console.log('\n🔄 Conectando ao MySQL...');
    const connection = await mysql.createConnection(config);
    
    console.log('✅ Conexão estabelecida!');
    
    // Verificar versão
    const [versionRows] = await connection.execute('SELECT VERSION() as version');
    console.log(`🐬 Versão do MySQL: ${versionRows[0].version}`);
    
    // Verificar usuário
    const [userRows] = await connection.execute('SELECT USER() as user');
    console.log(`👤 Usuário conectado: ${userRows[0].user}`);
    
    // Listar bancos
    const [dbRows] = await connection.execute('SHOW DATABASES');
    const databases = dbRows.map(row => Object.values(row)[0]);
    console.log(`📚 Bancos disponíveis: ${databases.join(', ')}`);
    
    // Criar banco 'vibe' se não existir
    if (!databases.includes('vibe')) {
      console.log('🔧 Criando banco de dados "vibe"...');
      await connection.execute('CREATE DATABASE vibe CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci');
      console.log('✅ Banco "vibe" criado!');
    } else {
      console.log('✅ Banco "vibe" já existe!');
    }
    
    // Testar conexão com o banco específico
    await connection.execute('USE vibe');
    console.log('✅ Conectado ao banco "vibe"!');
    
    await connection.end();
    
    console.log('\n🎉 Teste de conexão bem-sucedido!');
    return true;
    
  } catch (error) {
    console.error('\n❌ Erro na conexão:', error.message);
    
    if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.log('\n🔧 Soluções para erro de acesso:');
      console.log('1. Verifique se a senha está correta');
      console.log('2. Execute no MySQL como administrador:');
      console.log('   ALTER USER \'root\'@\'localhost\' IDENTIFIED BY \'Evo@000#!\';');
      console.log('   FLUSH PRIVILEGES;');
      console.log('3. Ou use o arquivo fix_mysql_permissions.sql');
    } else if (error.code === 'ECONNREFUSED') {
      console.log('\n🔧 Soluções para erro de conexão:');
      console.log('1. Verifique se o MySQL está rodando');
      console.log('2. Verifique se a porta 3306 está aberta');
      console.log('3. Tente: net start mysql (Windows) ou sudo service mysql start (Linux)');
    }
    
    return false;
  }
}

// Executar teste se chamado diretamente
if (require.main === module) {
  testDatabaseConnection()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('❌ Erro inesperado:', error);
      process.exit(1);
    });
}

module.exports = testDatabaseConnection;