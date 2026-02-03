# 🚀 Quick Start Guide - Fluxore

## Prerequisites Installation

### 1. Install Node.js
Download from: https://nodejs.org/
```powershell
# Verify installation
node --version
npm --version
```

### Note: No Database Server Required!
This project now uses **SQLite** - no MySQL server setup needed! SQLite is embedded and file-based.

## Setup Steps (3 Easy Steps!)

### Step 1: Install Dependencies
```powershell
cd C:\Users\Sabareesh\Downloads\Fluxore-EV-Charging-System\backend
npm install
```

### Step 2: Initialize Database
```powershell
npm run setup-db
```
This will:
- Create SQLite database file at `database/fluxore.db`
- Create all tables and indexes
- Load sample data automatically

### Step 3: Start the Server
```powershell
# For development (with auto-reload)
npm run dev

# For production
npm start
```

Server runs at: `http://localhost:3000`
   DB_PASSWORD=your_mysql_password
   DB_NAME=fluxore_db
   ```

3. **Start Server**
   ```powershell
   npm start
   ```

   Server will run at: http://localhost:3000

### Step 3: Access Application

Open browser and go to:
```
http://localhost:3000
```

## Default Login Credentials

### Admin Account
- Username: `admin`
- Password: `password123`

### User Account
- Username: `john_doe`
- Password: `password123`

## Troubleshooting

### Database File Not Created
```
Error: Cannot read properties of null
```
**Solution**:
```powershell
cd backend
npm run setup-db
```

### Port Already in Use
```
Error: Port 3000 already in use
```
**Solution**:
Edit .env file:
```
PORT=3001
```

### Module Not Found
```
Error: Cannot find module 'sqlite3'
```
**Solution**:
```powershell
cd backend
npm install
```

## Testing the System

### 1. Register New User
1. Go to http://localhost:3000
2. Click "Register"
3. Fill form and submit

### 2. Add Vehicle
1. Login as user
2. Go to "My Vehicles"
3. Click "Add Vehicle"
4. Select make and model

### 3. Book Charging Slot
1. Go to "Book Slot"
2. Select station and date
3. Choose your vehicle
4. Check available slots
5. Click on available time slot

### 4. Admin Features
1. Login as admin
2. Dashboard shows statistics
3. Add new station
4. Add vehicle makes/models
5. View all bookings

## Project Structure

```
Fluxore-EV-Charging-System/
├── database/           # SQLite database & SQL files
│   ├── fluxore.db      # SQLite database (auto-created)
│   ├── schema.sqlite   # Schema file
│   ├── setup.js        # Setup script
│   └── sample_data.sqlite
├── backend/           # Node.js API
│   ├── config/        # Database config
│   ├── routes/        # API endpoints
│   └── server.js      # Main server
└── frontend/          # HTML/CSS/JS
    ├── css/           # Styles
    ├── js/            # JavaScript
    └── *.html         # Pages
```

## Common Tasks

### Restart Server
```powershell
# Ctrl+C to stop
# Then restart:
npm run dev
```

### Reset Database
```powershell
# Remove old database
Remove-Item database/fluxore.db

# Recreate with fresh data
npm run setup-db
```

### View Database
```powershell
# Using sqlite3 command line
sqlite3 database/fluxore.db

# Inside sqlite3 prompt:
# SELECT * FROM users;
# .tables (show all tables)
# .quit (exit)
```

## SQLite vs MySQL

**Why SQLite?**
- ✅ No server setup required
- ✅ Single file database
- ✅ Perfect for development
- ✅ Easy to backup and share

**When to upgrade to MySQL:**
- High concurrent users
- Production environment with lots of writes
- Need advanced replication features

See `SQLite_Migration_Guide.md` for migration instructions.

## Next Steps

1. ✅ Explore user dashboard
2. ✅ Try booking a slot
3. ✅ Test cancellation
4. ✅ Add more vehicles
5. ✅ Login as admin
6. ✅ Add new station

## Support

If you encounter issues:
1. Check troubleshooting section above
2. Verify Node.js is installed
3. Ensure database file was created (check `database/fluxore.db`)
4. Check `SQLite_Migration_Guide.md` for detailed info

---

**You're all set! 🎉**

Start exploring Fluxore and managing EV charging stations!
