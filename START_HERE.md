# 🚗 Fluxore - SQLite Conversion Complete! ✅

> Welcome to Fluxore EV Charging System - Now powered by SQLite for zero-configuration, file-based database operations!

---

## 🎯 What's New

This project has been **successfully converted from MySQL to SQLite**:
- ✅ No database server required
- ✅ Single file database (`fluxore.db`)
- ✅ Simplified setup (3 commands!)
- ✅ Perfect for development & learning
- ✅ Easy to backup and share
- ✅ Can migrate to MySQL anytime

---

## 🚀 Quick Start (3 Steps)

### 1️⃣ Install Dependencies
```powershell
cd backend
npm install
```

### 2️⃣ Initialize Database
```powershell
npm run setup-db
```
This creates `database/fluxore.db` with all tables and sample data.

### 3️⃣ Start Server
```powershell
npm run dev
```
Open http://localhost:3000 in your browser.

**Default Credentials:**
- **Admin**: username `admin`, password `password123`
- **User**: username `john_doe`, password `password123`

---

## 📚 Documentation Guide

### For Quick Setup
→ **Read**: [`QUICKSTART.md`](./QUICKSTART.md) (3 minutes)

### For Installation Help
→ **Read**: [`INSTALLATION.md`](./INSTALLATION.md) (detailed instructions)

### For Project Overview
→ **Read**: [`README.md`](./README.md) (complete documentation)

### For SQLite Technical Details
→ **Read**: [`SQLite_Migration_Guide.md`](./SQLite_Migration_Guide.md)

### For Conversion Changes
→ **Read**: [`CONVERSION_SUMMARY.md`](./CONVERSION_SUMMARY.md) (what changed)

### For File Structure
→ **Read**: [`PROJECT_FILES.md`](./PROJECT_FILES.md) (complete file list)

### For Database Understanding
→ **Read**: [`docs/ER_DIAGRAM.md`](./docs/ER_DIAGRAM.md) (database structure)

### For DBMS Concepts
→ **Read**: [`docs/DBMS_CONCEPTS.md`](./docs/DBMS_CONCEPTS.md) (learning material)

### For Interview Prep
→ **Read**: [`docs/VIVA_QUESTIONS.md`](./docs/VIVA_QUESTIONS.md) (Q&A)

---

## 📂 Project Structure

```
Fluxore-EV-Charging-System/
├── backend/              # Node.js API
│   ├── config/          # Database config
│   ├── routes/          # 6 API route modules
│   └── server.js        # Express server
├── database/            # SQLite database
│   ├── fluxore.db       # Database file
│   └── setup.js         # Setup script
├── frontend/            # HTML/CSS/JS UI
│   ├── css/
│   ├── js/
│   └── *.html
├── docs/                # Documentation
│   ├── ER_DIAGRAM.md
│   ├── DBMS_CONCEPTS.md
│   └── VIVA_QUESTIONS.md
└── *.md                 # Setup & guide docs
```

---

## ✨ Key Features

### 👤 For Users
- 🔐 User registration & login
- 🚗 Manage multiple EV vehicles
- 📍 Browse charging stations
- ⏰ Book charging slots
- 🔋 Automatic charging time calculation
- ❌ Cancel bookings with penalty fees
- 📊 View booking history

### 🔧 For Admins
- 🏢 Manage charging stations
- 🔌 Configure charging ports
- 💰 Set pricing
- 🚙 Add vehicle makes & models
- 📈 View system statistics
- 👥 Manage users and bookings
- ⚙️ Configure system settings

---

## 🛠 Technology Stack

| Layer | Technology |
|-------|-----------|
| **Runtime** | Node.js |
| **Web Framework** | Express.js |
| **Database** | SQLite3 |
| **Authentication** | JWT + bcrypt |
| **Frontend** | HTML5 + CSS3 + Vanilla JS |
| **API** | REST |

---

## 🗄️ Database

### 13 Tables
- Roles, Users, Vehicles (Makes & Models)
- Stations, Ports, Bookings, Payments
- Time Slots, Pricing, Settings, Audit Logs

### 20+ Endpoints
- Authentication (login/register)
- Station operations
- Vehicle management
- Booking creation & cancellation
- Admin functions
- Payment processing

### Sample Data Included
- 5 test users (1 admin, 4 regular)
- 6 charging stations
- 45+ charging ports
- 20+ vehicle models
- 7+ sample bookings

---

## ✅ Conversion Details

### What Changed
- ✅ MySQL → SQLite
- ✅ mysql2 driver → sqlite3 driver
- ✅ Connection pooling → File-based DB
- ✅ All 6 route files updated
- ✅ Database config rewritten
- ✅ Setup automated

### What Stayed the Same
- ✅ All API endpoints
- ✅ All features
- ✅ Frontend code
- ✅ Authentication logic
- ✅ Business logic

### Migration Path
See [`SQLite_Migration_Guide.md`](./SQLite_Migration_Guide.md) for upgrading to MySQL.

---

## 🚀 Getting Started Checklist

- [ ] Read `QUICKSTART.md` (5 min read)
- [ ] Run `npm install` in backend folder
- [ ] Run `npm run setup-db` to create database
- [ ] Run `npm run dev` to start server
- [ ] Open http://localhost:3000 in browser
- [ ] Login with test credentials
- [ ] Explore features
- [ ] Read `README.md` for complete info
- [ ] Review `docs/ER_DIAGRAM.md` for database structure

---

## 💡 For Learning

This project is perfect for understanding:
- **DBMS Concepts** (Normalization, Transactions, Constraints)
- **Database Design** (ER modeling, Schema design)
- **REST APIs** (CRUD operations, Error handling)
- **Authentication** (JWT, Bcrypt)
- **Full-Stack Development** (Backend + Frontend)

See `docs/DBMS_CONCEPTS.md` and `docs/VIVA_QUESTIONS.md` for educational material.

---

## 📁 Important Files

### To Start
| File | Purpose |
|------|---------|
| `QUICKSTART.md` | 3-minute quick start |
| `INSTALLATION.md` | Detailed setup |
| `.env.example` | Config template |

### Database
| File | Purpose |
|------|---------|
| `database/setup.js` | Auto-setup script |
| `database/schema.sqlite` | Database schema |
| `database/sample_data.sqlite` | Sample data |

### Backend
| File | Purpose |
|------|---------|
| `backend/server.js` | Express app |
| `backend/config/database.js` | SQLite config |
| `backend/routes/` | API endpoints (6 files) |

### Frontend
| File | Purpose |
|------|---------|
| `frontend/*.html` | Web pages (5 files) |
| `frontend/css/style.css` | Styling |
| `frontend/js/` | Logic (2 files) |

### Documentation
| File | Purpose |
|------|---------|
| `README.md` | Complete guide |
| `SQLite_Migration_Guide.md` | Technical details |
| `CONVERSION_SUMMARY.md` | What changed |
| `PROJECT_FILES.md` | File inventory |
| `docs/ER_DIAGRAM.md` | Database structure |
| `docs/DBMS_CONCEPTS.md` | Learning material |
| `docs/VIVA_QUESTIONS.md` | Interview prep |

---

## 🔐 Default Credentials

### Admin Account
```
Username: admin
Password: password123
```

### Test User Account
```
Username: john_doe
Password: password123
```

---

## 📊 API Examples

### Register User
```bash
POST http://localhost:3000/api/auth/register
Content-Type: application/json

{
  "username": "newuser",
  "email": "newuser@example.com",
  "password": "password123",
  "full_name": "New User",
  "phone_number": "9876543210",
  "address": "Test Address"
}
```

### Login
```bash
POST http://localhost:3000/api/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "password123"
}
```

### Get Stations
```bash
GET http://localhost:3000/api/stations
```

See `README.md` for complete API documentation.

---

## 🎓 Educational Benefits

By studying this project, you'll learn:

1. **Database Concepts**
   - Entity-Relationship modeling
   - Normalization (1NF, 2NF, 3NF)
   - Transactions and ACID
   - Constraints and integrity

2. **System Design**
   - API design patterns
   - Authentication flows
   - Error handling
   - Data validation

3. **Technologies**
   - Node.js and Express.js
   - SQLite database
   - Frontend development
   - Full-stack integration

4. **Best Practices**
   - Code organization
   - Separation of concerns
   - Error handling
   - Security practices

---

## 🆘 Troubleshooting

### Database not created?
```powershell
npm run setup-db
```

### Port already in use?
Edit `.env`:
```
PORT=3001
```

### Module not found?
```powershell
npm install
```

For more help, see `INSTALLATION.md`.

---

## 🔄 Project Statistics

- **13** Database tables
- **20+** API endpoints
- **5** Frontend pages
- **6** Route modules
- **3** Database views
- **175+** Sample records
- **10,000+** Lines of code
- **3,500+** Lines of documentation

---

## 📞 Quick Links

| Need | Go To |
|------|-------|
| Quick start | [`QUICKSTART.md`](./QUICKSTART.md) |
| Installation | [`INSTALLATION.md`](./INSTALLATION.md) |
| Full overview | [`README.md`](./README.md) |
| SQLite info | [`SQLite_Migration_Guide.md`](./SQLite_Migration_Guide.md) |
| What changed | [`CONVERSION_SUMMARY.md`](./CONVERSION_SUMMARY.md) |
| File list | [`PROJECT_FILES.md`](./PROJECT_FILES.md) |
| Database | [`docs/ER_DIAGRAM.md`](./docs/ER_DIAGRAM.md) |
| Learning | [`docs/DBMS_CONCEPTS.md`](./docs/DBMS_CONCEPTS.md) |
| Interview | [`docs/VIVA_QUESTIONS.md`](./docs/VIVA_QUESTIONS.md) |

---

## 🎉 You're Ready!

Everything is set up and ready to go. Just follow these 3 steps:

```powershell
cd backend
npm install
npm run setup-db
npm run dev
```

Then open: **http://localhost:3000** 🚗⚡

---

## 📝 Next Steps

1. ✅ Complete the 3 setup commands above
2. ✅ Test login with provided credentials
3. ✅ Explore the user dashboard
4. ✅ Read the documentation
5. ✅ Try booking a charging slot
6. ✅ Test admin features

---

**Fluxore EV Charging System** | Powered by SQLite | Ready to learn and develop! 🚗⚡💾
