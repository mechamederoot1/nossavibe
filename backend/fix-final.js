import mysql from 'mysql2/promise';

async function fixFinal() {
    console.log('🔥 CORREÇÃO FINAL DEFINITIVA - VIBE');
    console.log('='.repeat(60));
    
    const connection = await mysql.createConnection({
        host: '127.0.0.1',
        port: 3306,
        user: 'root',
        password: 'Dashwoodi@1995',
        database: 'vibe'
    });
    
    try {
        console.log('🗑️ LIMPANDO COMPLETAMENTE email_verifications...');
        const [result] = await connection.execute('DELETE FROM email_verifications');
        console.log(`✅ Removidos ${result.affectedRows} registros`);
        
        console.log('🔄 RESETANDO AUTO_INCREMENT...');
        await connection.execute('ALTER TABLE email_verifications AUTO_INCREMENT = 1');
        
        console.log('✅ VERIFICANDO se tabela está vazia...');
        const [count] = await connection.execute('SELECT COUNT(*) as total FROM email_verifications');
        console.log(`📊 Registros na tabela: ${count[0].total}`);
        
        if (count[0].total === 0) {
            console.log('🎉 SUCESSO! Tabela completamente limpa!');
            console.log('\n✅ AGORA VOCÊ PODE:');
            console.log('1. Criar nova conta');
            console.log('2. Receber código IMEDIATAMENTE'); 
            console.log('3. Cooldown será apenas 60 segundos');
            
            console.log('\n🔄 PRÓXIMOS PASSOS:');
            console.log('1. Reinicie o email service: pkill -f email-service && cd email-service && npm run dev');
            console.log('2. Teste criar nova conta');
            console.log('3. O primeiro código deve ser enviado IMEDIATAMENTE');
        }
        
    } catch (error) {
        console.error('❌ Erro:', error.message);
    } finally {
        await connection.end();
    }
}

fixFinal().catch(console.error);
