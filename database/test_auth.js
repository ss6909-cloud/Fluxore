const http = require('http');

function testLogin(username, password) {
    return new Promise((resolve, reject) => {
        const postData = JSON.stringify({ username, password });

        const options = {
            hostname: 'localhost',
            port: 3000,
            path: '/api/auth/login',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(postData)
            }
        };

        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => { data += chunk; });
            res.on('end', () => {
                resolve({
                    status: res.statusCode,
                    data: JSON.parse(data)
                });
            });
        });

        req.on('error', reject);
        req.write(postData);
        req.end();
    });
}

async function test() {
    console.log('\n🧪 Testing Authentication...\n');
    
    console.log('Testing admin login...');
    const admin = await testLogin('admin', 'password123');
    console.log('Status:', admin.status);
    console.log('Message:', admin.data.message || admin.data.error);
    if (admin.data.user) console.log('User:', admin.data.user.username, '(' + admin.data.user.role + ')');
    
    console.log('\n---\n');
    
    console.log('Testing user login...');
    const user = await testLogin('john_doe', 'password123');
    console.log('Status:', user.status);
    console.log('Message:', user.data.message || user.data.error);
    if (user.data.user) console.log('User:', user.data.user.username, '(' + user.data.user.role + ')');
}

test().catch(console.error);
