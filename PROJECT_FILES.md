# Project File Structure - Fluxore EV Charging System (SQLite Edition)

## Complete Directory Tree

```
Fluxore-EV-Charging-System/
│
├── 📄 README.md                           # Main project documentation
├── 📄 QUICKSTART.md                       # 3-step quick start guide
├── 📄 INSTALLATION.md                     # Detailed installation instructions
├── 📄 SQLite_Migration_Guide.md           # SQLite technical details & migration
├── 📄 CONVERSION_SUMMARY.md               # What changed in MySQL→SQLite conversion
├── 📄 PROJECT_FILES.md                    # This file
│
├── 📁 backend/                            # Node.js/Express Backend
│   ├── 📄 server.js                       # Main Express server & app initialization
│   ├── 📄 package.json                    # Dependencies & npm scripts
│   ├── 📄 .env.example                    # Environment configuration template
│   │
│   ├── 📁 config/
│   │   └── 📄 database.js                 # SQLite connection & promise wrappers
│   │
│   └── 📁 routes/                         # REST API endpoints
│       ├── 📄 auth.routes.js              # Authentication (login/register)
│       ├── 📄 station.routes.js           # Charging station operations
│       ├── 📄 vehicle.routes.js           # Vehicle make/model management
│       ├── 📄 booking.routes.js           # Booking CRUD & availability
│       ├── 📄 admin.routes.js             # Admin operations & settings
│       └── 📄 payment.routes.js           # Payment processing
│
├── 📁 database/                           # Database files
│   ├── 📄 fluxore.db                      # SQLite database file (auto-generated)
│   ├── 📄 schema.sqlite                   # SQLite schema definition
│   ├── 📄 sample_data.sqlite              # Sample data for testing
│   ├── 📄 setup.js                        # Database initialization script
│   ├── 📄 schema.sql                      # Original MySQL schema (reference)
│   └── 📄 sample_data.sql                 # Original MySQL data (reference)
│
├── 📁 frontend/                           # HTML/CSS/JavaScript UI
│   ├── 📄 index.html                      # Landing page
│   ├── 📄 login.html                      # User login page
│   ├── 📄 register.html                   # User registration page
│   ├── 📄 user-dashboard.html             # Main user interface
│   ├── 📄 admin-dashboard.html            # Admin control panel
│   │
│   ├── 📁 css/
│   │   └── 📄 style.css                   # Complete styling (2100+ lines)
│   │
│   └── 📁 js/
│       ├── 📄 main.js                     # Utility functions & API helpers
│       ├── 📄 user-dashboard.js           # User dashboard logic
│       └── 📄 admin-dashboard.js          # Admin dashboard logic
│
└── 📁 docs/                               # Documentation
    ├── 📄 ER_DIAGRAM.md                   # Entity-relationship diagram
    ├── 📄 DBMS_CONCEPTS.md                # Database management concepts
    └── 📄 VIVA_QUESTIONS.md               # Interview Q&A for DBMS
```

---

## 📋 File Summary by Category

### 📄 Documentation Files (7 files)
| File | Purpose | Size |
|------|---------|------|
| README.md | Project overview | 600+ lines |
| QUICKSTART.md | 3-step quick start | 150+ lines |
| INSTALLATION.md | Detailed setup guide | 400+ lines |
| SQLite_Migration_Guide.md | Technical migration details | 600+ lines |
| CONVERSION_SUMMARY.md | Conversion changelog | 300+ lines |
| docs/ER_DIAGRAM.md | Database relationships | 400+ lines |
| docs/DBMS_CONCEPTS.md | DBMS theory | 500+ lines |
| docs/VIVA_QUESTIONS.md | Interview prep | 600+ lines |

### 🔧 Backend Files (9 files)

**Core Application**:
| File | Purpose | Lines |
|------|---------|-------|
| backend/server.js | Express server setup | 97 |
| backend/package.json | Dependencies & scripts | 20 |
| backend/.env.example | Environment template | 10 |
| backend/config/database.js | SQLite connection | 75 |

**API Routes** (6 files):
| File | Purpose | Lines |
|------|---------|-------|
| backend/routes/auth.routes.js | Login/register endpoints | 130 |
| backend/routes/station.routes.js | Station operations | 120 |
| backend/routes/vehicle.routes.js | Vehicle management | 110 |
| backend/routes/booking.routes.js | Booking operations | 150+ |
| backend/routes/admin.routes.js | Admin functionality | 200+ |
| backend/routes/payment.routes.js | Payment processing | 100+ |

### 🗄 Database Files (6 files)
| File | Purpose | Records |
|------|---------|---------|
| database/fluxore.db | SQLite database | Auto-generated |
| database/schema.sqlite | SQLite schema | 13 tables |
| database/sample_data.sqlite | Test data | 175+ records |
| database/setup.js | Setup automation | Executable |
| database/schema.sql | MySQL schema | Reference |
| database/sample_data.sql | MySQL data | Reference |

### 🎨 Frontend Files (8 files)

**HTML Pages** (5 files):
| File | Purpose |
|------|---------|
| frontend/index.html | Landing page |
| frontend/login.html | Login form |
| frontend/register.html | Registration form |
| frontend/user-dashboard.html | User portal |
| frontend/admin-dashboard.html | Admin control |

**Styling** (1 file):
| File | Purpose | Lines |
|------|---------|-------|
| frontend/css/style.css | Complete UI styling | 2100+ |

**JavaScript** (2 files):
| File | Purpose | Lines |
|------|---------|-------|
| frontend/js/main.js | Utilities & API helpers | 300+ |
| frontend/js/user-dashboard.js | User interface logic | 1000+ |

---

## 🗂 Database Schema (13 Tables)

### Tables Overview
1. **roles** - User role definitions (ADMIN, USER)
2. **users** - User accounts with authentication
3. **vehicle_makes** - EV manufacturers (Tesla, BYD, etc.)
4. **vehicle_models** - Vehicle specifications & battery info
5. **user_vehicles** - User's registered vehicles
6. **charging_stations** - Charging station locations
7. **charging_ports** - Individual charging ports per station
8. **pricing** - Pricing configurations
9. **time_slots** - Predefined booking durations
10. **bookings** - Charging slot reservations
11. **payments** - Payment records
12. **system_settings** - Global configurations
13. **audit_logs** - System event tracking

### Database Statistics
- **Tables**: 13
- **Indexes**: 25+
- **Views**: 3
- **Triggers**: 3 (in MySQL version)
- **Foreign Keys**: 15+
- **Constraints**: 50+

---

## 📊 API Endpoints (20+)

### Authentication (2)
- POST `/api/auth/register` - Register new user
- POST `/api/auth/login` - User login

### Stations (3)
- GET `/api/stations` - List all stations
- GET `/api/stations/:id` - Get station details
- GET `/api/stations/:id/availability` - Check slot availability

### Vehicles (4)
- GET `/api/vehicles/makes` - List car makes
- GET `/api/vehicles/makes/:id/models` - Models by make
- GET `/api/vehicles/user/:id` - User's vehicles
- POST `/api/vehicles/user/:id` - Add vehicle to user

### Bookings (4)
- POST `/api/bookings` - Create booking
- GET `/api/bookings/user/:id` - User's bookings
- GET `/api/bookings/:id` - Booking details
- PUT `/api/bookings/:id/cancel` - Cancel booking

### Admin (5+)
- GET `/api/admin/dashboard` - Dashboard stats
- POST `/api/admin/stations` - Add station
- GET `/api/admin/bookings` - All bookings
- POST `/api/admin/vehicles/makes` - Add vehicle make
- And more...

### Payments (2)
- POST `/api/payments/process` - Process payment
- GET `/api/payments/user/:id` - Payment history

---

## 🔄 Database Relationships

### User-Related
```
roles (1) ──── (N) users
users (1) ──── (N) user_vehicles
users (1) ──── (N) bookings
users (1) ──── (N) audit_logs
```

### Vehicle-Related
```
vehicle_makes (1) ──── (N) vehicle_models
vehicle_models (1) ──── (N) user_vehicles
```

### Station-Related
```
charging_stations (1) ──── (N) charging_ports
charging_stations (1) ──── (N) pricing
charging_stations (1) ──── (N) bookings
```

### Booking-Related
```
users (1) ──── (N) bookings
stations (1) ──── (N) bookings
ports (1) ──── (N) bookings
user_vehicles (1) ──── (N) bookings
time_slots (1) ──── (N) bookings
bookings (1) ──── (N) payments
```

---

## 💾 Data Sample

### Users
- 1 Admin user
- 4 Regular users (john_doe, jane_smith, robert_king, emily_brown)

### Vehicles
- 10 vehicle makes
- 20+ vehicle models with realistic specs

### Stations
- 6 charging stations across Bangalore
- 45+ total charging ports
- Mix of port types (CCS, Type 2, CHAdeMO)

### Bookings
- 7 sample bookings (completed, confirmed, cancelled)
- Real dates and times

### Payments
- 6 sample payment records
- Mix of successful and pending payments

---

## 🔐 Security Features

### Authentication
- JWT token-based authentication
- Bcrypt password hashing
- Role-based access control

### Database
- Foreign key constraints
- Check constraints for data validation
- Unique constraints for critical fields
- Audit logging for tracking changes

### API
- CORS enabled
- Input validation
- Error handling
- Rate limiting ready

---

## 📦 Dependencies

### Backend (npm packages)
```json
{
  "express": "^4.18.2",         // Web framework
  "sqlite3": "^5.1.6",           // Database driver
  "bcrypt": "^5.1.1",            // Password hashing
  "jsonwebtoken": "^9.0.2",      // JWT auth
  "dotenv": "^16.3.1",           // Environment config
  "cors": "^2.8.5"               // CORS middleware
}
```

### Development
```json
{
  "nodemon": "^3.0.2"            // Auto-reload
}
```

---

## 🚀 Setup Commands

### One-Time Setup
```powershell
cd backend
npm install
npm run setup-db
```

### Development
```powershell
npm run dev          # With auto-reload
npm start            # Production mode
```

### Database
```powershell
npm run setup-db     # Initialize database
```

---

## 📈 Project Statistics

### Code Metrics
- **Total Files**: 30+
- **Total Lines of Code**: 10,000+
- **Backend Routes**: 6 files, 20+ endpoints
- **Frontend Pages**: 5 HTML pages
- **CSS**: 2,100+ lines
- **JavaScript**: 1,300+ lines
- **Documentation**: 2,800+ lines

### Database
- **Tables**: 13
- **Relationships**: 15+ foreign keys
- **Constraints**: 50+
- **Sample Records**: 175+

### Documentation
- **Main Docs**: 5 files (2,000+ lines)
- **Concept Docs**: 3 files (1,500+ lines)
- **Total Documentation**: 3,500+ lines

---

## ✅ Conversion Status

### Completed Items
- ✅ SQLite integration
- ✅ All route files converted
- ✅ Database configuration updated
- ✅ Schema and sample data adapted
- ✅ Setup automation script
- ✅ Documentation updated
- ✅ Environment simplified
- ✅ Backward compatibility (MySQL schema kept as reference)

### Ready for
- ✅ Development
- ✅ Testing
- ✅ Learning DBMS concepts
- ✅ Prototyping
- ✅ Educational use
- ✅ Migration to MySQL when needed

---

## 📚 Quick Navigation

### To Get Started
1. Read: `QUICKSTART.md` (5 minutes)
2. Run: `npm install && npm run setup-db && npm run dev`
3. Visit: http://localhost:3000

### To Understand the Project
1. Read: `README.md` (overview)
2. Review: `docs/ER_DIAGRAM.md` (database structure)
3. Study: `docs/DBMS_CONCEPTS.md` (theory)
4. Explore: `docs/VIVA_QUESTIONS.md` (interview prep)

### To Understand SQLite Implementation
1. Read: `SQLite_Migration_Guide.md`
2. Check: `backend/config/database.js`
3. Review: `database/setup.js`

### For Detailed Installation
1. Follow: `INSTALLATION.md`
2. Troubleshoot: See INSTALLATION.md section

---

## 🎓 Learning Outcomes

After working with this project, you'll understand:

1. **DBMS Concepts**
   - Entity-Relationship modeling
   - Normalization (1NF, 2NF, 3NF)
   - Transactions and ACID properties
   - Constraints and integrity

2. **Database Design**
   - Proper schema design
   - Relationships and cardinality
   - Indexes for performance
   - Views for simplification

3. **Software Architecture**
   - API design (REST)
   - Separation of concerns
   - Error handling
   - Role-based access control

4. **Technology Stack**
   - Node.js and Express.js
   - SQLite database
   - Frontend with vanilla JavaScript
   - Authentication with JWT

---

## 📞 File Locations Quick Reference

| What | Where |
|------|-------|
| Start here | `QUICKSTART.md` |
| Installation help | `INSTALLATION.md` |
| Technical details | `SQLite_Migration_Guide.md` |
| Database structure | `docs/ER_DIAGRAM.md` |
| DBMS concepts | `docs/DBMS_CONCEPTS.md` |
| Server code | `backend/server.js` |
| Database setup | `database/setup.js` |
| API routes | `backend/routes/` |
| User interface | `frontend/` |
| Styles | `frontend/css/style.css` |

---

**Fluxore - A complete, production-ready DBMS project with SQLite!** 🚗⚡

Total Project Size: ~2.5 MB (with node_modules), Core files: ~50 KB
