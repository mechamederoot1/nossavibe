const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '.env') });

async function debugCooldown() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || '127.0.0.1',
      port: parseInt(process.env.DB_PORT) || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME || 'vibe'
    });
    
    console.log('🔍 Checking email_verifications table for user 25...');
    const [rows] = await connection.execute(
      'SELECT * FROM email_verifications WHERE user_id = 25 ORDER BY created_at DESC LIMIT 3'
    );
    
    console.log('📋 Recent verification attempts:');
    rows.forEach((row, index) => {
      console.log(`  ${index + 1}. ID: ${row.id}, Created: ${row.created_at}, Verified: ${row.verified}`);
    });
    
    if (rows.length > 0) {
      const lastAttempt = new Date(rows[0].created_at);
      const now = new Date();
      const timeDiff = now.getTime() - lastAttempt.getTime();
      const cooldownMs = parseInt(process.env.RESEND_COOLDOWN || '10000');
      
      console.log('⏰ Time analysis:');
      console.log(`  - Last attempt: ${lastAttempt.toISOString()}`);
      console.log(`  - Current time: ${now.toISOString()}`);
      console.log(`  - Time difference: ${Math.floor(timeDiff / 1000)} seconds (${timeDiff} ms)`);
      console.log(`  - Cooldown setting: ${cooldownMs} ms (${cooldownMs / 1000} seconds)`);
      console.log(`  - Remaining cooldown: ${Math.max(0, Math.ceil((cooldownMs - timeDiff) / 1000))} seconds`);
      
      if (timeDiff < cooldownMs) {
        console.log('❌ Cooldown is still active');
      } else {
        console.log('✅ Cooldown has expired');
      }
    }
    
    // Clear old records if needed
    const oneHourAgo = new Date(Date.now() - 3600000);
    const [deleteResult] = await connection.execute(
      'DELETE FROM email_verifications WHERE user_id = 25 AND created_at < ?',
      [oneHourAgo]
    );
    
    if (deleteResult.affectedRows > 0) {
      console.log(`🗑️ Cleared ${deleteResult.affectedRows} old verification records`);
    }
    
    await connection.end();
    console.log('✅ Debug complete');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

debugCooldown();
