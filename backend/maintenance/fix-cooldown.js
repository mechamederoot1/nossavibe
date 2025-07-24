const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '.env') });

async function fixCooldown() {
  try {
    console.log('🔧 Fixing cooldown issue...');
    
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || '127.0.0.1',
      port: parseInt(process.env.DB_PORT) || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME || 'vibe'
    });
    
    console.log('📊 Current verification records for user 25:');
    const [beforeRows] = await connection.execute(
      'SELECT id, created_at, verified FROM email_verifications WHERE user_id = 25'
    );
    console.log(`Found ${beforeRows.length} records`);
    
    // Clear all verification records for user 25 to reset cooldown
    const [deleteResult] = await connection.execute(
      'DELETE FROM email_verifications WHERE user_id = 25'
    );
    
    console.log(`🗑️ Cleared ${deleteResult.affectedRows} verification records for user 25`);
    
    // Verify cleanup
    const [afterRows] = await connection.execute(
      'SELECT COUNT(*) as count FROM email_verifications WHERE user_id = 25'
    );
    console.log(`📊 Remaining records: ${afterRows[0].count}`);
    
    await connection.end();
    console.log('✅ Cooldown fix complete! User can now request verification email.');
    
  } catch (error) {
    console.error('❌ Error fixing cooldown:', error.message);
  }
}

fixCooldown();
