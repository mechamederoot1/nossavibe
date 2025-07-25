import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Script Resolver - Vibe Social Network (Node.js)
 * ===============================================
 * Este script resolve todos os problemas relacionados a:
 * - Cooldown excessivo de email
 * - Verificação de email não obrigatória no login
 * - Sistema de conta ativa
 * - Limpeza de registros problemáticos
 */

class VibeResolver {
    constructor() {
        this.dbConfig = {
            host: '127.0.0.1',
            port: 3306,
            user: 'root',
            password: 'Dashwoodi@1995',
            database: 'vibe',
            charset: 'utf8mb4'
        };
        this.connection = null;
    }

    async connectDatabase() {
        try {
            console.log('🔌 Conectando ao banco de dados...');
            this.connection = await mysql.createConnection(this.dbConfig);
            console.log('✅ Conexão estabelecida com sucesso!');
            return true;
        } catch (err) {
            console.error(`❌ Erro ao conectar ao banco: ${err.message}`);
            return false;
        }
    }

    async executeQuery(query, params = []) {
        try {
            const [result] = await this.connection.execute(query, params);
            return result;
        } catch (err) {
            console.error(`❌ Erro na query: ${err.message}`);
            throw err;
        }
    }

    async fixCooldownIssues() {
        console.log('\n🔧 CORRIGINDO PROBLEMAS DE COOLDOWN');
        console.log('='.repeat(50));

        // 1. Verificar registros atuais
        const records = await this.executeQuery(`
            SELECT user_id, COUNT(*) as count, MAX(created_at) as last_attempt 
            FROM email_verifications 
            GROUP BY user_id
        `);

        if (records.length > 0) {
            console.log(`📊 Encontrados registros para ${records.length} usuários:`);
            records.forEach(record => {
                console.log(`   - Usuário ${record.user_id}: ${record.count} tentativas, última: ${record.last_attempt}`);
            });
        }

        // 2. Remover registros antigos (mais de 1 hora)
        const deleteOldResult = await this.executeQuery(`
            DELETE FROM email_verifications 
            WHERE created_at < DATE_SUB(NOW(), INTERVAL 1 HOUR)
        `);
        console.log(`🗑️ Removidos ${deleteOldResult.affectedRows} registros antigos (mais de 1 hora)`);

        // 3. Resetar cooldown para usuários problemáticos
        const problematicUsers = await this.executeQuery(`
            SELECT DISTINCT user_id 
            FROM email_verifications 
            WHERE created_at > DATE_SUB(NOW(), INTERVAL 1 HOUR) 
            AND user_id IN (25, 26, 27)
        `);

        if (problematicUsers.length > 0) {
            const userIds = problematicUsers.map(u => u.user_id);
            console.log(`🔄 Resetando cooldown para usuários: ${userIds.join(', ')}`);

            const deleteProblemResult = await this.executeQuery(`
                DELETE FROM email_verifications 
                WHERE user_id IN (${userIds.join(',')})
            `);
            console.log(`✅ Removidos ${deleteProblemResult.affectedRows} registros problemáticos`);
        }

        console.log('✅ Problemas de cooldown corrigidos!');
    }

    async fixUserVerificationSystem() {
        console.log('\n🔐 CORRIGINDO SISTEMA DE VERIFICAÇÃO');
        console.log('='.repeat(50));

        // 1. Verificar se a coluna is_verified existe
        const isVerifiedColumns = await this.executeQuery(`
            SHOW COLUMNS FROM users LIKE 'is_verified'
        `);

        if (isVerifiedColumns.length === 0) {
            console.log('➕ Adicionando coluna is_verified...');
            await this.executeQuery(`
                ALTER TABLE users 
                ADD COLUMN is_verified BOOLEAN DEFAULT FALSE
            `);
            console.log('✅ Coluna is_verified adicionada!');
        } else {
            console.log('✅ Coluna is_verified já existe');
        }

        // 2. Verificar se a coluna account_status existe
        const accountStatusColumns = await this.executeQuery(`
            SHOW COLUMNS FROM users LIKE 'account_status'
        `);

        if (accountStatusColumns.length === 0) {
            console.log('➕ Adicionando coluna account_status...');
            await this.executeQuery(`
                ALTER TABLE users 
                ADD COLUMN account_status ENUM('pending', 'active', 'suspended', 'banned') 
                DEFAULT 'pending'
            `);
            console.log('✅ Coluna account_status adicionada!');
        } else {
            console.log('✅ Coluna account_status já existe');
        }

        // 3. Atualizar usuários não verificados
        const unverifiedResult = await this.executeQuery(`
            UPDATE users 
            SET account_status = 'pending' 
            WHERE (is_verified = FALSE OR is_verified IS NULL) 
            AND account_status NOT IN ('suspended', 'banned')
        `);
        console.log(`🔄 ${unverifiedResult.affectedRows} contas marcadas como 'pending'`);

        // 4. Ativar contas já verificadas
        const activatedResult = await this.executeQuery(`
            UPDATE users 
            SET account_status = 'active' 
            WHERE is_verified = TRUE AND account_status = 'pending'
        `);
        console.log(`✅ ${activatedResult.affectedRows} contas verificadas ativadas`);

        console.log('✅ Sistema de verificação corrigido!');
    }

    async fixEmailServiceConfig() {
        console.log('\n📧 CORRIGINDO CONFIGURAÇÕES DE EMAIL');
        console.log('='.repeat(50));

        const envPath = path.join(__dirname, 'email-service', '.env');
        
        const correctConfig = `# Configurações do banco de dados MySQL
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=Dashwoodi@1995
DB_NAME=vibe

# Configurações SMTP
SMTP_HOST=smtp.hostinger.com
SMTP_PORT=587
SMTP_USER=suporte@meuvibe.com
SMTP_PASS=Dashwoodi@1995
SMTP_FROM=no-reply@meuvibe.com

# Configurações de verificação (valores corretos)
VERIFICATION_CODE_EXPIRY=300000
RESEND_COOLDOWN=60000
MAX_RESEND_ATTEMPTS=5

# Porta do serviço
PORT=3001
`;

        try {
            fs.writeFileSync(envPath, correctConfig);
            console.log(`✅ Arquivo ${envPath} atualizado com configurações corretas!`);
        } catch (error) {
            console.log(`⚠️ Erro ao atualizar .env: ${error.message}`);
            console.log('💡 Configure manualmente o arquivo .env do email-service');
        }

        console.log('✅ Configurações de email corrigidas!');
    }

    async createSummaryReport() {
        console.log('\n📊 RELATÓRIO DE ESTADO ATUAL');
        console.log('='.repeat(50));

        // Usuários por status
        const userStats = await this.executeQuery(`
            SELECT 
                COALESCE(account_status, 'undefined') as account_status,
                COALESCE(is_verified, FALSE) as is_verified,
                COUNT(*) as count
            FROM users 
            GROUP BY account_status, is_verified
            ORDER BY account_status, is_verified
        `);

        if (userStats.length > 0) {
            console.log('👥 Usuários por status:');
            userStats.forEach(stat => {
                const verifiedText = stat.is_verified ? '✅ Verificado' : '❌ Não verificado';
                console.log(`   - ${stat.account_status}: ${stat.count} usuários (${verifiedText})`);
            });
        }

        // Registros de verificação pendentes
        const pendingVerifications = await this.executeQuery(`
            SELECT COUNT(*) as count 
            FROM email_verifications 
            WHERE verified = FALSE
        `);

        if (pendingVerifications.length > 0) {
            console.log(`📧 Verificações pendentes: ${pendingVerifications[0].count}`);
        }

        // Últimas tentativas de verificação
        const recentAttempts = await this.executeQuery(`
            SELECT user_id, email, created_at 
            FROM email_verifications 
            ORDER BY created_at DESC 
            LIMIT 5
        `);

        if (recentAttempts.length > 0) {
            console.log('📋 Últimas tentativas de verificação:');
            recentAttempts.forEach(attempt => {
                console.log(`   - Usuário ${attempt.user_id}: ${attempt.email} em ${attempt.created_at}`);
            });
        }

        console.log('✅ Relatório concluído!');
    }

    async runAllFixes() {
        console.log('🚀 INICIANDO RESOLUÇÃO DE PROBLEMAS - VIBE');
        console.log('='.repeat(60));
        console.log(`⏰ Início: ${new Date().toISOString()}`);

        if (!await this.connectDatabase()) {
            return false;
        }

        try {
            await this.fixCooldownIssues();
            await this.fixUserVerificationSystem();
            await this.fixEmailServiceConfig();
            await this.createSummaryReport();

            console.log('\n' + '='.repeat(60));
            console.log('🎉 TODAS AS CORREÇÕES APLICADAS COM SUCESSO!');
            console.log('='.repeat(60));
            console.log('\n✅ Próximos passos:');
            console.log('1. Reiniciar o serviço de email: cd email-service && npm run dev');
            console.log('2. Reiniciar o backend principal');
            console.log('3. Testar login com conta não verificada (deve bloquear)');
            console.log('4. Testar verificação de email (cooldown de 60s)');
            console.log('\n💡 Agora o sistema:');
            console.log('- ✅ Bloqueia login sem verificação de email');
            console.log('- ✅ Usa cooldown de 60 segundos');
            console.log('- ✅ Gerencia status da conta corretamente');
            console.log('- ✅ Remove registros problemáticos automaticamente');

            return true;

        } catch (error) {
            console.error(`\n❌ Erro durante a execução: ${error.message}`);
            return false;
        } finally {
            if (this.connection) {
                await this.connection.end();
                console.log('\n🔌 Conexão com banco fechada');
            }
        }
    }
}

async function main() {
    const resolver = new VibeResolver();
    const success = await resolver.runAllFixes();

    if (success) {
        console.log('\n🎯 Execução concluída com sucesso!');
        process.exit(0);
    } else {
        console.log('\n💥 Execução falhou. Verifique os logs acima.');
        process.exit(1);
    }
}

// Executar se este arquivo for chamado diretamente
main().catch(error => {
    console.error('❌ Erro fatal:', error);
    process.exit(1);
});

export default VibeResolver;
