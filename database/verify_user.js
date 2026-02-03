const path = require('path');
module.paths.push(path.join(__dirname, '../backend/node_modules'));

const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const dbPath = path.join(__dirname, 'fluxore.db');

const db = new sqlite3.Database(dbPath, async (err) => {
    if (err) {
        console.error('Error opening database:', err);
        process.exit(1);
    }
    
    db.get(`SELECT u.*, r.role_name FROM users u JOIN roles r ON u.role_id = r.role_id WHERE u.username='john_doe'`, async (err, user) => {
        if (err) {
            console.error('Error querying database:', err);
            db.close();
            process.exit(1);
        }
        
        if (!user) {
            console.log('❌ User john_doe not found in database');
            db.close();
            process.exit(1);
        }
        
        console.log('\n✅ User Found:');
        console.log('Username:', user.username);
        console.log('Role:', user.role_name);
        console.log('Active:', user.is_active);
        console.log('Password Hash:', user.password_hash);
        console.log('\nTesting password verification...');
        
        const isValid = await bcrypt.compare('password123', user.password_hash);
        console.log('Password matches:', isValid ? '✅ YES' : '❌ NO');
        
        if (!isValid) {
            console.log('\n⚠️ Password hash mismatch! Updating with correct hash...');
            const newHash = await bcrypt.hash('password123', 10);
            db.run("UPDATE users SET password_hash = ? WHERE username = 'john_doe'", [newHash], (err) => {
                if (err) {
                    console.error('Error updating password:', err);
                } else {
                    console.log('✅ Password updated successfully!');
                    console.log('New Hash:', newHash);
                }
                db.close();
            });
        } else {
            db.close();
        }
    });
});
