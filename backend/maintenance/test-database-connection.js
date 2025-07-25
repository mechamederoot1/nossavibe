const mysql = require('mysql2/promise');
require('dotenv').config();

async function testDatabaseConnection() {
  console.log('🔍 Testando conexão com banco de dados MySQL...');
  console.log('================================================');
  
  const config = {
    host: process.env.DB_HOST || '127.0.0.1',
    port: parseInt(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'Dashwoodi@1995',
    charset: 'utf8mb4'
  };
  
  console.log('📋 Configurações de conexão:');
  console.log(`   Host: ${config.host}`);
  console.log(`   Port: ${config.port}`);
  console.log(`   User: ${config.user}`);
  console.log(`   Password: ${'*'.repeat(config.password.length)}`);
  console.log('');
  
  try {
    // Primeiro, tentar conectar sem especificar o banco
    console.log('🔄 Tentando conectar ao MySQL...');
    const connection = await mysql.createConnection(config);
    
    console.log('✅ Conexão estabelecida com sucesso!');
    
    // Verificar versão do MySQL
    const [versionRows] = await connection.execute('SELECT VERSION() as version');
    console.log(`🐬 Versão do MySQL: ${versionRows[0].version}`);
    
    // Verificar usuário atual
    const [userRows] = await connection.execute('SELECT USER() as user');
    console.log(`👤 Usuário conectado: ${userRows[0].user}`);
    
    // Listar bancos de dados disponíveis
    const [dbRows] = await connection.execute('SHOW DATABASES');
    const databases = dbRows.map(row => Object.values(row)[0]);
    console.log(`📚 Bancos disponíveis: ${databases.join(', ')}`);
    
    // Verificar se o banco 'vibe' existe
    const dbName = process.env.DB_NAME || 'vibe';
    if (!databases.includes(dbName)) {
      console.log(`🔧 Criando banco de dados '${dbName}'...`);
      await connection.execute(`CREATE DATABASE ${dbName} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
      console.log(`✅ Banco '${dbName}' criado com sucesso!`);
    } else {
      console.log(`✅ Banco '${dbName}' já existe!`);
    }
    
    // Conectar ao banco específico
    await connection.execute(`USE ${dbName}`);
    console.log(`✅ Conectado ao banco '${dbName}'!`);
    
    // Verificar tabelas existentes
    const [tableRows] = await connection.execute('SHOW TABLES');
    const tables = tableRows.map(row => Object.values(row)[0]);
    console.log(`📋 Tabelas existentes: ${tables.length > 0 ? tables.join(', ') : 'Nenhuma'}`);
    
    await connection.end();
    
    console.log('');
    console.log('🎉 Teste de conexão concluído com sucesso!');
    return true;
    
  } catch (error) {
    console.log('');
    console.error('❌ Erro na conexão:', error.message);
    console.log('');
    console.log('🔧 Possíveis soluções:');
    
    if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.log('1. Verifique se a senha do MySQL está correta');
      console.log('2. Execute no MySQL como administrador:');
      console.log('   ALTER USER \'root\'@\'localhost\' IDENTIFIED BY \'Dashwoodi@1995\';');
      console.log('   FLUSH PRIVILEGES;');
      console.log('3. Ou tente resetar a senha do MySQL');
      console.log('4. Verifique se o usuário tem permissões adequadas');
    } else if (error.code === 'ECONNREFUSED') {
      console.log('1. Verifique se o MySQL está rodando');
      console.log('2. Verifique se a porta 3306 está aberta');
      console.log('3. Tente: net start mysql (Windows) ou sudo service mysql start (Linux)');
    } else if (error.code === 'ENOTFOUND') {
      console.log('1. Verifique se o host está correto');
      console.log('2. Tente usar \'localhost\' ao invés de \'127.0.0.1\'');
    }
    
    console.log('');
    console.log('💡 Comandos úteis para MySQL:');
    console.log('   - Verificar status: mysqladmin -u root -p status');
    console.log('   - Conectar: mysql -u root -p');
    console.log('   - Resetar senha: mysqladmin -u root password "Dashwoodi@1995"');
    
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