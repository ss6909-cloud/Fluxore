const express = require('express');
const router = express.Router();
const { dbGet, dbRun } = require('../config/database');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Register new user
router.post('/register', async (req, res) => {
    try {
        const { username, email, password, full_name, phone_number, address } = req.body;

        // Validate required fields
        if (!username || !email || !password || !full_name) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Check if user already exists
        const existingUser = await dbGet(
            'SELECT * FROM users WHERE username = ? OR email = ?',
            [username, email]
        );

        if (existingUser) {
            return res.status(400).json({ error: 'Username or email already exists' });
        }

        // Hash password
        const password_hash = await bcrypt.hash(password, 10);

        // Get USER role_id
        const role = await dbGet(
            "SELECT role_id FROM roles WHERE role_name = 'USER'"
        );

        // Insert new user
        const result = await dbRun(
            'INSERT INTO users (role_id, username, email, password_hash, full_name, phone_number, address) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [role.role_id, username, email, password_hash, full_name, phone_number || null, address || null]
        );

        res.status(201).json({ 
            message: 'User registered successfully',
            user_id: result.lastID
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Registration failed' });
    }
});

// Login
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ error: 'Username and password required' });
        }

        // Get user with role
        const user = await dbGet(
            `SELECT u.*, r.role_name 
             FROM users u 
             JOIN roles r ON u.role_id = r.role_id 
             WHERE u.username = ? AND u.is_active = 1`,
            [username]
        );

        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Verify password
        const isValidPassword = await bcrypt.compare(password, user.password_hash);
        if (!isValidPassword) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Update last login
        await dbRun(
            'UPDATE users SET last_login = datetime(\'now\') WHERE user_id = ?',
            [user.user_id]
        );

        // Create audit log
        await dbRun(
            'INSERT INTO audit_logs (user_id, action_type) VALUES (?, ?)',
            [user.user_id, 'LOGIN']
        );

        // Generate JWT token
        const token = jwt.sign(
            { 
                user_id: user.user_id, 
                username: user.username,
                role: user.role_name 
            },
            process.env.JWT_SECRET || 'default_secret',
            { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
        );

        res.json({
            message: 'Login successful',
            token,
            user: {
                user_id: user.user_id,
                username: user.username,
                email: user.email,
                full_name: user.full_name,
                role: user.role_name
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Login failed' });
    }
});

// Verify token middleware (export for use in other routes)
const verifyToken = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];

    if (!token) {
        return res.status(403).json({ error: 'No token provided' });
    }

    jwt.verify(token, process.env.JWT_SECRET || 'default_secret', (err, decoded) => {
        if (err) {
            return res.status(401).json({ error: 'Invalid token' });
        }
        req.user = decoded;
        next();
    });
};

// Verify admin middleware
const verifyAdmin = (req, res, next) => {
    if (req.user.role !== 'ADMIN') {
        return res.status(403).json({ error: 'Admin access required' });
    }
    next();
};

module.exports = router;
module.exports.verifyToken = verifyToken;
module.exports.verifyAdmin = verifyAdmin;