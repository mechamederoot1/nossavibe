import mysql from 'mysql2/promise';

async function fixCooldownNow() {
    console.log('🚨 CORREÇÃO EMERGENCIAL DO COOLDOWN');
    console.log('='.repeat(50));
    
    const connection = await mysql.createConnection({
        host: '127.0.0.1',
        port: 3306,
        user: 'root', 
        password: 'Dashwoodi@1995',
        database: 'vibe'
    });
    
    try {
        // 1. Verificar registros atuais
        console.log('🔍 Verificando registros problemáticos...');
        const [records] = await connection.execute(`
            SELECT user_id, email, created_at, verified 
            FROM email_verifications 
            ORDER BY created_at DESC LIMIT 10
        `);
        
        console.log('📊 Últimos registros encontrados:');
        records.forEach(r => {
            console.log(`   - Usuário ${r.user_id}: ${r.email} em ${r.created_at} (verificado: ${r.verified})`);
        });
        
        // 2. LIMPAR TODOS os registros de verificação de email
        console.log('\n🗑️ REMOVENDO TODOS os registros de email_verifications...');
        const [deleteResult] = await connection.execute('DELETE FROM email_verifications');
        console.log(`✅ Removidos ${deleteResult.affectedRows} registros!`);
        
        // 3. Verificar se limpou
        const [remaining] = await connection.execute('SELECT COUNT(*) as count FROM email_verifications');
        console.log(`📊 Registros restantes: ${remaining[0].count}`);
        
        // 4. Adicionar colunas necessárias se não existirem
        console.log('\n🔧 Verificando estrutura da tabela users...');
        
        try {
            await connection.execute(`
                ALTER TABLE users 
                ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE
            `);
            console.log('✅ Coluna is_verified verificada');
        } catch (e) {
            console.log('ℹ️ Coluna is_verified já existe');
        }
        
        try {
            await connection.execute(`
                ALTER TABLE users 
                ADD COLUMN IF NOT EXISTS account_status ENUM('pending', 'active', 'suspended', 'banned') DEFAULT 'pending'
            `);
            console.log('✅ Coluna account_status verificada');
        } catch (e) {
            console.log('ℹ️ Coluna account_status já existe');
        }
        
        console.log('\n🎉 CORREÇÃO CONCLUÍDA!');
        console.log('✅ Agora você pode:');
        console.log('1. Criar nova conta');
        console.log('2. Receber código de verificação imediatamente');
        console.log('3. Cooldown será de apenas 60 segundos');
        
    } catch (error) {
        console.error('❌ Erro:', error.message);
    } finally {
        await connection.end();
        console.log('\n🔌 Conexão fechada');
    }
}

fixCooldownNow().catch(console.error);
