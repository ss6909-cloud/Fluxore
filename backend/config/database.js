const sqlite3 = require('sqlite3').verbose();
const path = require('path');
require('dotenv').config();

// Database path
const dbPath = process.env.DB_PATH || path.join(__dirname, '../../database/fluxore.db');

// Create database connection
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('✗ SQLite connection error:', err.message);
    } else {
        console.log('✓ SQLite database connected at:', dbPath);
    }
});

// Enable foreign keys
db.run('PRAGMA foreign_keys = ON');

// Promisify database operations
const dbRun = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        db.run(sql, params, function(err) {
            if (err) {
                reject(err);
            } else {
                resolve({
                    lastID: this.lastID,
                    changes: this.changes
                });
            }
        });
    });
};

const dbGet = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        db.get(sql, params, (err, row) => {
            if (err) {
                reject(err);
            } else {
                resolve(row);
            }
        });
    });
};

const dbAll = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        db.all(sql, params, (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows || []);
            }
        });
    });
};

// Test database connection
const testConnection = async () => {
    try {
        await dbGet('SELECT 1');
        console.log('✓ SQLite database connection verified');
        return true;
    } catch (error) {
        console.error('✗ SQLite database connection failed:', error.message);
        return false;
    }
};

// Helper function to run BEGIN/COMMIT/ROLLBACK
const dbBegin = () => dbRun('BEGIN TRANSACTION');
const dbCommit = () => dbRun('COMMIT');
const dbRollback = () => dbRun('ROLLBACK');

module.exports = { 
    db,
    dbRun, 
    dbGet, 
    dbAll, 
    testConnection,
    dbBegin,
    dbCommit,
    dbRollback,
    dbPath
};
