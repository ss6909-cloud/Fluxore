#!/usr/bin/env node

/**
 * Database Setup Script for SQLite
 * This script initializes the SQLite database with schema and sample data
 */

const fs = require('fs');
const path = require('path');

// Add backend/node_modules to module search path
module.paths.push(path.join(__dirname, '../backend/node_modules'));

const sqlite3 = require('sqlite3').verbose();
require('dotenv').config();

const dbPath = process.env.DB_PATH || path.join(__dirname, '../database/fluxore.db');
const schemaPath = path.join(__dirname, '../database/schema.sqlite');
const sampleDataPath = path.join(__dirname, '../database/sample_data.sqlite');

console.log('🚀 Starting Fluxore SQLite Database Setup...\n');

// Delete existing database if it exists
if (fs.existsSync(dbPath)) {
    fs.unlinkSync(dbPath);
    console.log('✓ Removed existing database\n');
}

// Create new database connection
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('✗ Failed to create database:', err.message);
        process.exit(1);
    }
    console.log('✓ Database file created at:', dbPath);
});

// Enable foreign keys
db.run('PRAGMA foreign_keys = ON', (err) => {
    if (err) {
        console.error('✗ Failed to enable foreign keys:', err.message);
        process.exit(1);
    }
    console.log('✓ Foreign keys enabled\n');
});

// Read and execute schema
console.log('📋 Loading schema...');
if (!fs.existsSync(schemaPath)) {
    console.error('✗ Schema file not found at:', schemaPath);
    process.exit(1);
}

const schema = fs.readFileSync(schemaPath, 'utf8');

// Parse SQL statements, properly removing comments
function parseSQLStatements(sqlText) {
    const statements = [];
    let current = '';
    const lines = sqlText.split('\n');
    
    for (const line of lines) {
        // Remove comment-only lines
        if (line.trim().startsWith('--')) {
            continue;
        }
        
        // Remove inline comments
        const cleanedLine = line.split('--')[0];
        current += cleanedLine + ' ';
        
        // If line ends with semicolon, we have a complete statement
        if (cleanedLine.trim().endsWith(';')) {
            const stmt = current.trim().slice(0, -1); // Remove trailing semicolon
            if (stmt.length > 0) {
                statements.push(stmt);
            }
            current = '';
        }
    }
    
    // Add any remaining statement
    if (current.trim().length > 0) {
        statements.push(current.trim());
    }
    
    return statements;
}

// Split schema into individual statements and execute
const schemaStatements = parseSQLStatements(schema);

let schemaIndex = 0;

const executeSchemaStatements = () => {
    if (schemaIndex >= schemaStatements.length) {
        console.log('✓ Schema created successfully\n');
        loadSampleData();
        return;
    }

    const statement = schemaStatements[schemaIndex];
    schemaIndex++;

    db.run(statement, (err) => {
        if (err) {
            console.error('✗ Schema execution error:', err.message);
            console.error('Statement:', statement.substring(0, 100) + '...');
            process.exit(1);
        }
        executeSchemaStatements();
    });
};

// Load sample data
const loadSampleData = () => {
    console.log('📝 Loading sample data...');
    
    if (!fs.existsSync(sampleDataPath)) {
        console.warn('⚠ Sample data file not found at:', sampleDataPath);
        console.log('ℹ Database initialized with schema only\n');
        verifyDatabase();
        return;
    }

    const sampleData = fs.readFileSync(sampleDataPath, 'utf8');
    const dataStatements = parseSQLStatements(sampleData);

    let dataIndex = 0;
    let insertedRecords = 0;

    const executeDataStatements = () => {
        if (dataIndex >= dataStatements.length) {
            console.log(`✓ Sample data loaded (${insertedRecords} records)\n`);
            verifyDatabase();
            return;
        }

        const statement = dataStatements[dataIndex];
        dataIndex++;

        db.run(statement, function(err) {
            if (err) {
                console.error('⚠ Sample data error (continuing):', err.message);
            } else if (this.changes > 0) {
                insertedRecords += this.changes;
            }
            executeDataStatements();
        });
    };

    executeDataStatements();
};

// Verify database setup
const verifyDatabase = () => {
    console.log('🔍 Verifying database...\n');

    const verificationQueries = [
        { name: 'Tables', query: `SELECT COUNT(*) as count FROM sqlite_master WHERE type='table'` },
        { name: 'Indexes', query: `SELECT COUNT(*) as count FROM sqlite_master WHERE type='index'` },
        { name: 'Roles', query: `SELECT COUNT(*) as count FROM roles` },
        { name: 'Users', query: `SELECT COUNT(*) as count FROM users` },
        { name: 'Stations', query: `SELECT COUNT(*) as count FROM charging_stations` },
        { name: 'Bookings', query: `SELECT COUNT(*) as count FROM bookings` }
    ];

    let verifyIndex = 0;

    const runVerifications = () => {
        if (verifyIndex >= verificationQueries.length) {
            console.log('\n✅ Database setup completed successfully!\n');
            closeDatabase();
            return;
        }

        const verification = verificationQueries[verifyIndex];
        verifyIndex++;

        db.get(verification.query, (err, row) => {
            if (err) {
                console.error(`✗ ${verification.name} verification failed:`, err.message);
            } else {
                console.log(`  ✓ ${verification.name}: ${row.count}`);
            }
            runVerifications();
        });
    };

    runVerifications();
};

// Close database connection
const closeDatabase = () => {
    db.close((err) => {
        if (err) {
            console.error('Error closing database:', err.message);
            process.exit(1);
        }
    });
};

// Start schema execution
executeSchemaStatements();
