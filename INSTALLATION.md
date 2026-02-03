# Installation Instructions - Fluxore EV Charging System

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v14 or higher) - [Download here](https://nodejs.org/)
- **Git** (optional) - [Download here](https://git-scm.com/)

**No database server required!** This project uses SQLite, which is embedded and file-based.

## Installation Steps

### 1. Verify Node.js Installation
```powershell
# Check Node.js version
node --version

# Check npm version
npm --version
```

### 2. Backend Setup

```powershell
# Navigate to backend directory
cd C:\Users\Sabareesh\Downloads\Fluxore-EV-Charging-System\backend

# Install Node.js dependencies
npm install

# Create environment file (optional - defaults work fine)
copy .env.example .env
```

Default `.env` values work perfectly:
```env
# Database is created automatically at database/fluxore.db
DB_PATH=./database/fluxore.db

PORT=3000
NODE_ENV=development

JWT_SECRET=your_secret_key_change_this_in_production
JWT_EXPIRES_IN=24h

CORS_ORIGIN=http://localhost:3000
```

### 3. Initialize Database

```powershell
# Still in backend directory
npm run setup-db
```

This command will:
- Create the SQLite database file (`database/fluxore.db`)
- Execute all schema statements (create tables, indexes, views)
- Load sample data (test users, stations, vehicles, bookings)
- Verify the setup with status messages

Expected output:
```
🚀 Starting Fluxore SQLite Database Setup...

✓ Database file created at: C:\Users\Sabareesh\Downloads\Fluxore-EV-Charging-System\database\fluxore.db
✓ Foreign keys enabled

📋 Loading schema...
✓ Schema created successfully

📝 Loading sample data...
✓ Sample data loaded (175 records)

🔍 Verifying database...

  ✓ Tables: 13
  ✓ Indexes: 25

---

**Installation complete!** Your Fluxore EV Charging System is ready to use. 🎉

# Development mode (auto-restart on changes)
npm run dev

# OR Production mode
npm start
```

You should see:
```
========================================
🚗 FLUXORE EV CHARGING SYSTEM
========================================
Server running on: http://localhost:3000
Environment: development
========================================
```

### 4. Access the Application

Open your web browser and navigate to:
```
http://localhost:3000
```

## Default Login Credentials

### Admin Account
- **Username:** admin
- **Password:** password123
- **Access:** Full system management

### User Accounts
- **Username:** john_doe | **Password:** password123
- **Username:** jane_smith | **Password:** password123
- **Username:** robert_king | **Password:** password123
- **Access:** Booking and vehicle management

## Verify Installation

### Test Database Connection
```powershell
mysql -u root -p
```

In MySQL:
```sql
USE fluxore_db;
SHOW TABLES;
SELECT COUNT(*) FROM users;
SELECT COUNT(*) FROM charging_stations;
```

You should see:
- 13 tables
- 5 users
- 6 charging stations

### Test API Endpoints

Open browser or use curl:

```powershell
# Health check
curl http://localhost:3000/api/health

# Get stations
curl http://localhost:3000/api/stations

# Get vehicle makes
curl http://localhost:3000/api/vehicles/makes
```

## Troubleshooting

### Issue: Cannot connect to database

**Error:**
```
Error: connect ECONNREFUSED 127.0.0.1:3306
```

**Solutions:**
1. Ensure MySQL is running
2. Check credentials in .env file
3. Verify database exists: `SHOW DATABASES;`
4. Check MySQL port (default: 3306)

### Issue: Port 3000 already in use

**Error:**
```
Error: listen EADDRINUSE: address already in use :::3000
```

**Solution:**
Edit `.env` file:
```env
PORT=3001
```
Or kill process using port:
```powershell
# Find process
netstat -ano | findstr :3000

# Kill process (replace PID)
taskkill /PID <PID> /F
```

### Issue: Module not found

**Error:**
```
Error: Cannot find module 'express'
```

**Solution:**
```powershell
cd backend
npm install
```

### Issue: Permission denied

**Error:**
```
Error: Access denied for user 'root'@'localhost'
```

**Solution:**
1. Reset MySQL root password
2. Update `.env` with correct password
3. Grant privileges:
```sql
GRANT ALL PRIVILEGES ON fluxore_db.* TO 'root'@'localhost';
FLUSH PRIVILEGES;
```

### Issue: Trigger creation failed

**Error:**
```
Error: You do not have the SUPER privilege
```

**Solution:**
```sql
SET GLOBAL log_bin_trust_function_creators = 1;
```

## Development Tools (Optional)

### Install Nodemon (Auto-restart)
```powershell
npm install -g nodemon
```

Then use:
```powershell
npm run dev
```

### Install MySQL Workbench
Visual database management tool:
[Download here](https://dev.mysql.com/downloads/workbench/)

### VS Code Extensions
Recommended extensions:
- MySQL (cweijan.vscode-mysql-client2)
- REST Client (humao.rest-client)
- ESLint (dbaeumer.vscode-eslint)

## Folder Permissions

Ensure proper permissions:
```powershell
# Windows - Run as Administrator if needed
icacls "C:\Users\Sabareesh\Downloads\Fluxore-EV-Charging-System" /grant Users:F /T
```

## Environment Variables Explained

| Variable | Description | Example |
|----------|-------------|---------|
| DB_HOST | MySQL server address | localhost |
| DB_USER | MySQL username | root |
| DB_PASSWORD | MySQL password | your_password |
| DB_NAME | Database name | fluxore_db |
| DB_PORT | MySQL port | 3306 |
| PORT | Server port | 3000 |
| NODE_ENV | Environment mode | development |
| JWT_SECRET | Secret for tokens | random_string |
| JWT_EXPIRES_IN | Token validity | 24h |

## Running Tests

After setup, test the system:

### 1. User Registration
1. Go to http://localhost:3000
2. Click "Register"
3. Create new account
4. Login with new credentials

### 2. Book a Slot
1. Login as user
2. Add a vehicle
3. Go to "Book Slot"
4. Select station and date
5. Check availability
6. Book a time slot

### 3. Admin Panel
1. Logout and login as admin
2. View dashboard statistics
3. Add new charging station
4. Add vehicle make and model
5. Update pricing

## Database Backup

Create backup:
```powershell
mysqldump -u root -p fluxore_db > backup_fluxore.sql
```

Restore from backup:
```powershell
mysql -u root -p fluxore_db < backup_fluxore.sql
```

## Stopping the Server

Press `Ctrl + C` in the terminal where server is running.

Stop MySQL:
```powershell
net stop MySQL
```

## Uninstallation

1. Stop server (Ctrl + C)
2. Drop database:
```sql
DROP DATABASE fluxore_db;
```
3. Delete project folder
4. Uninstall Node.js and MySQL (if needed)

## Next Steps

After successful installation:

1. ✅ Read [README.md](README.md) for project overview
2. ✅ Check [QUICKSTART.md](QUICKSTART.md) for usage guide
3. ✅ Review [docs/VIVA_QUESTIONS.md](docs/VIVA_QUESTIONS.md) for Q&A
4. ✅ Study [docs/DBMS_CONCEPTS.md](docs/DBMS_CONCEPTS.md) for concepts
5. ✅ Explore [docs/ER_DIAGRAM.md](docs/ER_DIAGRAM.md) for database design

## Support

If you encounter any issues:

1. Check the troubleshooting section above
2. Verify all prerequisites are installed
3. Ensure MySQL is running
4. Check console for error messages
5. Review `.env` configuration

## Success Checklist

- [ ] MySQL server running
- [ ] Database `fluxore_db` created
- [ ] Sample data loaded
- [ ] Node.js dependencies installed
- [ ] `.env` file configured
- [ ] Server started successfully
- [ ] Can access http://localhost:3000
- [ ] Can login with default credentials
- [ ] API endpoints responding

---

**Congratulations! 🎉**

Your Fluxore EV Charging Management System is now ready to use!

Explore the features, test the booking system, and review the DBMS concepts demonstrated in the project.
