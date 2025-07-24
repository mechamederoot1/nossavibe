import mysql from 'mysql2/promise';

async function nukeCooldown() {
    console.log('💥 SCRIPT NUCLEAR - DESTRUINDO COOLDOWN DEFINITIVAMENTE');
    console.log('='.repeat(70));
    
    const connection = await mysql.createConnection({
        host: '127.0.0.1',
        port: 3306,
        user: 'root',
        password: 'Dashwoodi@1995',
        database: 'vibe'
    });
    
    try {
        // 1. Mostrar registros atuais
        console.log('📊 REGISTROS ATUAIS:');
        const [current] = await connection.execute(`
            SELECT user_id, email, created_at, 
                   TIMESTAMPDIFF(SECOND, created_at, NOW()) as seconds_ago
            FROM email_verifications 
            ORDER BY created_at DESC
        `);
        
        current.forEach(r => {
            console.log(`   👤 User ${r.user_id}: ${r.email} - ${r.seconds_ago}s atrás`);
        });
        
        // 2. NUCLEAR OPTION: DROPAR E RECRIAR TABELA
        console.log('\n💥 DROPANDO TABELA COMPLETAMENTE...');
        await connection.execute('DROP TABLE IF EXISTS email_verifications');
        
        console.log('🔧 RECRIANDO TABELA LIMPA...');
        await connection.execute(`
            CREATE TABLE email_verifications (
                id INT PRIMARY KEY AUTO_INCREMENT,
                user_id INT NOT NULL,
                email VARCHAR(255) NOT NULL,
                verification_code VARCHAR(6) NOT NULL,
                verification_token VARCHAR(255) NOT NULL,
                expires_at DATETIME NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                attempts INT DEFAULT 1,
                verified BOOLEAN DEFAULT FALSE,
                verified_at DATETIME NULL,
                INDEX idx_user_id (user_id),
                INDEX idx_email (email),
                INDEX idx_token (verification_token)
            )
        `);
        
        // 3. Verificar se tabela está limpa
        const [newCount] = await connection.execute('SELECT COUNT(*) as total FROM email_verifications');
        console.log(`✅ Nova tabela criada com ${newCount[0].total} registros`);
        
        console.log('\n🎉 MISSION ACCOMPLISHED!');
        console.log('✅ Tabela email_verifications completamente resetada');
        console.log('✅ Todos os cooldowns foram DESTRUÍDOS');
        console.log('✅ Próxima tentativa será tratada como primeira vez');
        
        console.log('\n🚀 AGORA FAÇA:');
        console.log('1. Reinicie o email service');
        console.log('2. Crie nova conta');
        console.log('3. Código será enviado IMEDIATAMENTE');
        
    } catch (error) {
        console.error('❌ Erro nuclear:', error.message);
    } finally {
        await connection.end();
    }
}

nukeCooldown().catch(console.error);
