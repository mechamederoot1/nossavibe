const mysql = require('mysql2/promise');
require('dotenv').config();

async function createEmailTables() {
  console.log('🗄️ Criando tabelas para verificação de e-mail...');
  console.log('===============================================');
  
  const config = {
    host: process.env.DB_HOST || '127.0.0.1',
    port: parseInt(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'Evo@000#!',
    database: process.env.DB_NAME || 'vibe',
    charset: 'utf8mb4'
  };
  
  try {
    const connection = await mysql.createConnection(config);
    console.log('✅ Conectado ao banco de dados!');
    
    // 1. Criar tabela de verificações de e-mail
    console.log('📋 Criando tabela email_verifications...');
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS email_verifications (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        email VARCHAR(255) NOT NULL,
        verification_code VARCHAR(6) NOT NULL,
        verification_token VARCHAR(64) NOT NULL,
        expires_at DATETIME NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        verified BOOLEAN DEFAULT FALSE,
        verified_at DATETIME NULL,
        attempts INT DEFAULT 1,
        INDEX idx_user_id (user_id),
        INDEX idx_token (verification_token),
        INDEX idx_code (verification_code),
        INDEX idx_email (email),
        INDEX idx_expires (expires_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ Tabela email_verifications criada!');
    
    // 2. Criar tabela de recuperação de senha
    console.log('📋 Criando tabela password_recovery...');
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS password_recovery (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        email VARCHAR(255) NOT NULL,
        recovery_code VARCHAR(6) NOT NULL,
        recovery_token VARCHAR(64) NOT NULL,
        expires_at DATETIME NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        used BOOLEAN DEFAULT FALSE,
        used_at DATETIME NULL,
        INDEX idx_user_id (user_id),
        INDEX idx_token (recovery_token),
        INDEX idx_code (recovery_code),
        INDEX idx_email (email),
        INDEX idx_expires (expires_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ Tabela password_recovery criada!');
    
    // 3. Criar tabela de logs de recuperação
    console.log('📋 Criando tabela password_recovery_logs...');
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS password_recovery_logs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT DEFAULT 0,
        email VARCHAR(255) NOT NULL,
        action_type VARCHAR(50) NOT NULL,
        recovery_id INT NULL,
        success BOOLEAN NOT NULL,
        error_message TEXT NULL,
        ip_address VARCHAR(45) NULL,
        user_agent TEXT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_user_id (user_id),
        INDEX idx_email (email),
        INDEX idx_action (action_type),
        INDEX idx_created (created_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ Tabela password_recovery_logs criada!');
    
    // 4. Verificar se a tabela users existe e adicionar coluna is_verified se necessário
    console.log('📋 Verificando tabela users...');
    const [tables] = await connection.execute("SHOW TABLES LIKE 'users'");
    
    if (tables.length > 0) {
      console.log('✅ Tabela users encontrada!');
      
      // Verificar se a coluna is_verified existe
      const [columns] = await connection.execute(`
        SELECT COLUMN_NAME 
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_SCHEMA = '${config.database}' 
        AND TABLE_NAME = 'users' 
        AND COLUMN_NAME = 'is_verified'
      `);
      
      if (columns.length === 0) {
        console.log('➕ Adicionando coluna is_verified à tabela users...');
        await connection.execute(`
          ALTER TABLE users 
          ADD COLUMN is_verified BOOLEAN DEFAULT FALSE
        `);
        console.log('✅ Coluna is_verified adicionada!');
      } else {
        console.log('✅ Coluna is_verified já existe!');
      }
    } else {
      console.log('⚠️ Tabela users não encontrada. Criando tabela básica...');
      await connection.execute(`
        CREATE TABLE IF NOT EXISTS users (
          id INT AUTO_INCREMENT PRIMARY KEY,
          first_name VARCHAR(100) NOT NULL,
          last_name VARCHAR(100) NOT NULL,
          email VARCHAR(255) UNIQUE NOT NULL,
          password_hash VARCHAR(255) NOT NULL,
          username VARCHAR(50) UNIQUE,
          display_id VARCHAR(20) UNIQUE,
          is_verified BOOLEAN DEFAULT FALSE,
          is_active BOOLEAN DEFAULT TRUE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          INDEX idx_email (email),
          INDEX idx_username (username),
          INDEX idx_display_id (display_id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `);
      console.log('✅ Tabela users criada!');
    }
    
    // 5. Verificar estrutura das tabelas criadas
    console.log('📋 Verificando estrutura das tabelas...');
    
    const tablesToCheck = ['email_verifications', 'password_recovery', 'password_recovery_logs', 'users'];
    
    for (const tableName of tablesToCheck) {
      const [tableInfo] = await connection.execute(`DESCRIBE ${tableName}`);
      console.log(`\n📋 Estrutura da tabela ${tableName}:`);
      tableInfo.forEach(column => {
        console.log(`   - ${column.Field}: ${column.Type} ${column.Null === 'NO' ? 'NOT NULL' : 'NULL'} ${column.Key ? `(${column.Key})` : ''}`);
      });
    }
    
    await connection.end();
    
    console.log('\n🎉 Todas as tabelas foram criadas/verificadas com sucesso!');
    console.log('');
    console.log('📊 Resumo:');
    console.log('   ✅ email_verifications - Para códigos de verificação');
    console.log('   ✅ password_recovery - Para recuperação de senha');
    console.log('   ✅ password_recovery_logs - Para logs de segurança');
    console.log('   ✅ users.is_verified - Coluna de verificação');
    console.log('');
    console.log('🚀 O serviço de e-mail agora deve funcionar corretamente!');
    
    return true;
    
  } catch (error) {
    console.error('❌ Erro ao criar tabelas:', error.message);
    console.log('');
    console.log('🔧 Possíveis soluções:');
    console.log('1. Verifique se você tem permissões para criar tabelas');
    console.log('2. Execute o script test-database-connection.js primeiro');
    console.log('3. Verifique se o banco de dados existe');
    console.log('4. Tente executar como administrador do MySQL');
    
    return false;
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  createEmailTables()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('❌ Erro inesperado:', error);
      process.exit(1);
    });
}

module.exports = createEmailTables;