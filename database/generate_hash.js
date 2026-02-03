const path = require('path');
module.paths.push(path.join(__dirname, '../backend/node_modules'));

const bcrypt = require('bcrypt');

async function generateHash() {
    const hash = await bcrypt.hash('password123', 10);
    console.log('Bcrypt hash for "password123":');
    console.log(hash);
}

generateHash();
