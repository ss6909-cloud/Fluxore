# SQLite Migration Guide

## Overview

This document guides you through the conversion of the Fluxore EV Charging System from MySQL to SQLite. SQLite offers several advantages for development and testing:

- **Zero Configuration**: No server setup required
- **Portability**: Single file database
- **Lightweight**: Perfect for development
- **Embedded**: Works great with Node.js

## What Changed

### 1. Database Driver
- **Before**: MySQL2/MariaDB with connection pooling
- **After**: SQLite3 with file-based database

### 2. Database Configuration
- **Before**: `backend/config/database.js` - MySQL connection pool
- **After**: `backend/config/database.js` - SQLite with promise wrappers

### 3. SQL Syntax Adjustments

| MySQL | SQLite |
|-------|--------|
| `AUTO_INCREMENT` | `AUTOINCREMENT` |
| `TRUE/FALSE` | `1/0` |
| `NOW()` | `datetime('now')` |
| `CURDATE()` | `date('now')` |
| `DATE_ADD(CURDATE(), INTERVAL 1 DAY)` | `date('now', '+1 day')` |
| `TIMESTAMP DEFAULT CURRENT_TIMESTAMP` | `TIMESTAMP DEFAULT CURRENT_TIMESTAMP` |
| `TEXT` for enums | `TEXT with CHECK constraints` |
| Index syntax | Simplified (no FULLTEXT) |

### 4. Schema Files
- **schema.sql** - Original MySQL schema (kept for reference)
- **schema.sqlite** - SQLite-compatible schema
- **sample_data.sqlite** - SQLite-compatible sample data

### 5. Setup Process
- New setup script: `database/setup.js`
- Automatically creates tables, indexes, and loads sample data

## Installation & Setup

### Step 1: Install Dependencies
```bash
cd backend
npm install
```

### Step 2: Configure Environment
```bash
# Copy the example environment file
cp .env.example .env

# Edit .env with your settings (optional, defaults work fine)
```

### Step 3: Initialize Database
```bash
# Run from the backend directory
npm run setup-db
```

This command will:
- Create a new SQLite database at `database/fluxore.db`
- Execute all schema creation statements
- Load sample data
- Verify the database setup

### Step 4: Start the Server
```bash
# For development with auto-reload
npm run dev

# For production
npm start
```

## Database Files

### Location
```
Fluxore-EV-Charging-System/
├── database/
│   ├── fluxore.db              (Generated after setup - actual database file)
│   ├── schema.sqlite           (SQLite schema - SQL statements)
│   ├── sample_data.sqlite      (Sample data - SQL statements)
│   ├── setup.js                (Setup script)
│   ├── schema.sql              (Original MySQL schema for reference)
│   └── sample_data.sql         (Original MySQL data for reference)
```

### File Sizes
- `fluxore.db`: ~50-100 KB (after setup with sample data)
- Easy to backup, share, or version control

## Architecture Changes

### Old MySQL Pattern
```javascript
const { promisePool } = require('../config/database');

// Query
const [results] = await promisePool.query('SELECT * FROM users', []);
```

### New SQLite Pattern
```javascript
const { dbGet, dbAll, dbRun } = require('../config/database');

// Get single row
const user = await dbGet('SELECT * FROM users WHERE user_id = ?', [1]);

// Get multiple rows
const users = await dbAll('SELECT * FROM users', []);

// Insert/Update/Delete
const result = await dbRun('INSERT INTO users (...) VALUES (...)', params);
// result.lastID contains the inserted row ID
// result.changes contains number of affected rows
```

### Database Functions

#### `dbRun(sql, params)`
- Execute INSERT, UPDATE, DELETE, or CREATE statements
- Returns: `{ lastID, changes }`
- Use when you don't need row data back

#### `dbGet(sql, params)`
- Execute SELECT query, return first row
- Returns: Single row object or undefined
- Use for queries expecting one result

#### `dbAll(sql, params)`
- Execute SELECT query, return all rows
- Returns: Array of row objects
- Use for queries expecting multiple results

#### `dbBegin() / dbCommit() / dbRollback()`
- Transaction control
- Use for multi-step operations

## Converting MySQL Queries

### Example 1: SELECT Single Row
**Before (MySQL)**:
```javascript
const [users] = await promisePool.query(
    'SELECT * FROM users WHERE user_id = ?',
    [1]
);
const user = users[0];
```

**After (SQLite)**:
```javascript
const user = await dbGet(
    'SELECT * FROM users WHERE user_id = ?',
    [1]
);
```

### Example 2: SELECT Multiple Rows
**Before (MySQL)**:
```javascript
const [results] = await promisePool.query(
    'SELECT * FROM users WHERE role = ?',
    ['USER']
);
results.forEach(user => { /* process */ });
```

**After (SQLite)**:
```javascript
const results = await dbAll(
    'SELECT * FROM users WHERE role = ?',
    ['USER']
);
results.forEach(user => { /* process */ });
```

### Example 3: INSERT
**Before (MySQL)**:
```javascript
const [result] = await promisePool.query(
    'INSERT INTO users (username, email) VALUES (?, ?)',
    [username, email]
);
const newId = result.insertId;
```

**After (SQLite)**:
```javascript
const result = await dbRun(
    'INSERT INTO users (username, email) VALUES (?, ?)',
    [username, email]
);
const newId = result.lastID;
```

### Example 4: UPDATE
**Before (MySQL)**:
```javascript
await promisePool.query(
    'UPDATE users SET last_login = NOW() WHERE user_id = ?',
    [userId]
);
```

**After (SQLite)**:
```javascript
await dbRun(
    'UPDATE users SET last_login = datetime(\'now\') WHERE user_id = ?',
    [userId]
);
```

### Example 5: DELETE
**Before (MySQL)**:
```javascript
await promisePool.query(
    'DELETE FROM bookings WHERE booking_id = ?',
    [bookingId]
);
```

**After (SQLite)**:
```javascript
await dbRun(
    'DELETE FROM bookings WHERE booking_id = ?',
    [bookingId]
);
```

## Transaction Example

### Multi-Step Booking Creation
```javascript
try {
    // Start transaction
    await dbBegin();

    // Insert booking
    const bookingResult = await dbRun(
        'INSERT INTO bookings (...) VALUES (...)',
        params
    );
    const bookingId = bookingResult.lastID;

    // Insert payment record
    await dbRun(
        'INSERT INTO payments (...) VALUES (...)',
        [bookingId, ...]
    );

    // Create audit log
    await dbRun(
        'INSERT INTO audit_logs (...) VALUES (...)',
        [userId, 'BOOKING_CREATED', bookingId, ...]
    );

    // Commit all changes
    await dbCommit();

    res.json({ success: true, booking_id: bookingId });
} catch (error) {
    // Rollback on error
    await dbRollback();
    console.error('Booking creation failed:', error);
    res.status(500).json({ error: 'Booking failed' });
}
```

## Boolean Values

### SQLite Uses 0/1 Instead of TRUE/FALSE

**Inserting**:
```javascript
// Insert with 0/1 instead of TRUE/FALSE
await dbRun(
    'INSERT INTO charging_ports (is_available) VALUES (?)',
    [1]  // 1 for true, 0 for false
);
```

**Querying**:
```javascript
// SQLite returns 1/0, JavaScript treats as truthy/falsy
const port = await dbGet('SELECT * FROM charging_ports WHERE is_available = 1');

// For boolean checks, use === 1 or != 1
if (port.is_available === 1) {
    // Port is available
}
```

**In WHERE Clauses**:
```javascript
// Both work due to SQLite type coercion
WHERE is_operational = 1
WHERE is_operational = TRUE

// But be explicit for clarity
WHERE is_available = 1  // Better
```

## Testing the Setup

After running `npm run setup-db`, verify with these checks:

### 1. Database File Exists
```bash
ls -lh database/fluxore.db
```

### 2. Connect and Query
```bash
sqlite3 database/fluxore.db "SELECT COUNT(*) FROM users;"
```

### 3. Run the Server
```bash
npm run dev
```

### 4. Test an Endpoint
```bash
# Test registration
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "password123",
    "full_name": "Test User",
    "phone_number": "9876543210",
    "address": "Test Address"
  }'
```

## Troubleshooting

### Issue: "PRAGMA foreign_keys = ON" not working
**Solution**: Already enabled in database.js automatically

### Issue: Database file not created
**Solution**: Ensure `database/` directory exists and is writable
```bash
mkdir -p database
chmod 755 database
```

### Issue: "Database is locked" error
**Solution**: SQLite uses file-level locking. Ensure:
- No other instances of the app are running
- Check file permissions
- For concurrent access, consider upgrading to MySQL

### Issue: Transaction rollback not working
**Solution**: Verify foreign keys are enabled
```javascript
// This is done automatically in database.js
db.run('PRAGMA foreign_keys = ON');
```

### Issue: Slow queries
**Solution**: SQLite is single-threaded. For production with high concurrency, migrate back to MySQL:
```bash
# Migrate back to MySQL
# Update .env with MySQL credentials
# Update config/database.js back to mysql2
# Update route files back to promisePool.query()
```

## Performance Notes

### SQLite Performance Characteristics
- ✅ **Excellent** for reads (concurrent reads are allowed)
- ✅ **Good** for writes in single-user scenarios
- ⚠️ **Limited** for concurrent writes (sequential)
- ✅ **Fast** for development and testing
- ⚠️ **Not ideal** for production with high write load

### Optimization Tips
- Use indexes (already created in schema)
- Batch insert operations
- Use transactions for multi-step operations
- Monitor database file size

## Migrating Back to MySQL

If you need to return to MySQL:

### 1. Install MySQL Driver
```bash
cd backend
npm install mysql2
npm uninstall sqlite3
```

### 2. Restore Database Config
Replace `config/database.js` with MySQL version (use `schema.sql` and `sample_data.sql`)

### 3. Update Route Files
Replace all `dbGet/dbAll/dbRun` calls with `promisePool.query`

### 4. Restore Environment Config
```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=fluxore_db
DB_PORT=3306
```

## Key Differences Summary

| Feature | MySQL | SQLite |
|---------|-------|--------|
| Setup | Server required | No setup |
| Connection | Network | File-based |
| Concurrency | High | Limited writes |
| Performance | Production-ready | Dev/testing |
| Scalability | Excellent | Limited |
| Data Types | Full featured | Basic |
| Transactions | Full ACID | Full ACID |
| Foreign Keys | Optional | Need PRAGMA |
| Indexes | Full featured | Full featured |
| Backups | Database dumps | Copy file |
| Portability | Requires server | Single file |

## Next Steps

1. ✅ Install dependencies: `npm install`
2. ✅ Setup database: `npm run setup-db`
3. ✅ Start server: `npm run dev`
4. ✅ Test endpoints
5. ✅ Deploy or continue development

## Support

For issues or questions:
- Check the `QUICKSTART.md` for quick setup
- Refer to `INSTALLATION.md` for detailed instructions
- Review route files for SQLite pattern examples
- Check SQLite documentation: https://www.sqlite.org/

---

**Fluxore EV Charging System** - Now Running on SQLite! 🚗⚡
