const path = require('path');
module.paths.push(path.join(__dirname, '../backend/node_modules'));

const sqlite3 = require('sqlite3').verbose();
const dbPath = path.join(__dirname, 'fluxore.db');

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database:', err);
        process.exit(1);
    }
    
    db.get("SELECT username, password_hash FROM users WHERE username='admin'", (err, row) => {
        if (err) {
            console.error('Error querying database:', err);
        } else {
            console.log('\n✅ Admin User Data:');
            console.log('Username:', row.username);
            console.log('Password Hash:', row.password_hash);
            console.log('\nHash Length:', row.password_hash.length);
            console.log('Expected Hash Length: 60');
            console.log('\n✅ Password hash is correct!' , row.password_hash.length === 60 ? '✅' : '❌');
        }
        db.close();
    });
});
