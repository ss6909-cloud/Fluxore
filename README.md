# 🚗 Fluxore - EV Charging Station Management System

> A comprehensive Database Management System (DBMS) mini project for managing EV charging stations, slot bookings, and user operations with role-based access control.
> 
> **Now powered by SQLite** - Zero configuration, file-based database! 🎉

## 📋 Table of Contents
- [Overview](#overview)
- [Quick Start](#quick-start)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Database Design](#database-design)
- [Installation](#installation)
- [Usage](#usage)
- [API Endpoints](#api-endpoints)
- [DBMS Concepts Demonstrated](#dbms-concepts-demonstrated)
- [Project Structure](#project-structure)
- [Future Enhancements](#future-enhancements)

## 🎯 Overview

Fluxore is a smart EV charging station management system that allows users to book charging slots in advance and enables administrators to manage stations, vehicles, pricing, and system configuration. The project strongly demonstrates DBMS concepts including:

- **Entity Relationships** - Complex relationships between users, stations, bookings, vehicles
- **Constraints** - Primary keys, foreign keys, check constraints, unique constraints
- **Normalization** - Database designed in 3NF (Third Normal Form)
- **Transactions** - ACID properties maintained for critical operations
- **Role-based Access** - Separate admin and user functionalities
- **Triggers** - Automated calculations and validation
- **Views** - Simplified complex queries
- **Indexes** - Performance optimization

## 🚀 Quick Start

**Get running in 3 commands:**

```powershell
cd backend
npm install
npm run setup-db && npm run dev
```

Then open: http://localhost:3000

**Default Credentials:**
- Admin: `admin` / `password123`
- User: `john_doe` / `password123`

See [QUICKSTART.md](./QUICKSTART.md) for more details.

## ✨ Features

### 👤 User (Consumer) Features
- ✅ User registration and authentication
- 📍 View available charging stations across multiple locations
- 🚗 Add and manage multiple EV vehicles
- ⏰ Book charging slots in advance
- 🔋 Automatic charging time estimation based on vehicle specs
- ❌ Cancel bookings (with penalty fee if within 2 hours)
- 📊 View booking history and status
- 💳 Dummy payment simulation

### 🔧 Admin Features
- 🏢 Add, edit, delete charging stations
- 🔌 Define number of charging ports per station
- 💰 Set pricing (price per kWh, per hour)
- 🚙 Add EV car makes and models with specifications
- 📈 View all bookings and system statistics
- ⚙️ Manage system settings
- 💵 Configure cancellation penalty fees

### ⚡ System Features
- Fixed time slot management (30, 60, 90, 120 minutes)
- Dynamic slot availability calculation
- Prevents double booking using triggers
- Charging estimation based on:
  - Battery capacity
  - Current charge level
  - Target charge level
  - Vehicle charging rate
  - Charging efficiency
- Audit logging for tracking system events

## 🛠 Technology Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **SQLite3** - Embedded database (no server required!)
- **bcrypt** - Password hashing
- **jsonwebtoken** - Authentication
- **sqlite3** - Database driver

### Frontend
- **HTML5** - Structure
- **CSS3** - Styling (Custom, no frameworks)
- **JavaScript** (Vanilla) - Interactivity
- **Fetch API** - HTTP requests

### Database
- **SQLite** - Zero-configuration, file-based, production-ready DBMS
  - Single `fluxore.db` file
  - No server setup required
  - Perfect for development and testing
  - Easy to backup and share
  - Can migrate to MySQL for production if needed

## 🗄 Database Design

### ER Diagram (Entity Relationships)

```
┌─────────────┐
│   ROLES     │
└──────┬──────┘
       │ 1
       │
       │ N
┌──────┴──────┐          ┌────────────────┐
│   USERS     │─────────▶│  AUDIT_LOGS    │
└──────┬──────┘   N   1  └────────────────┘
       │ 1
       │
       │ N
┌──────┴──────────┐      ┌────────────────────┐
│ USER_VEHICLES   │──────│ VEHICLE_MODELS     │
└──────┬──────────┘  N 1 └─────────┬──────────┘
       │                           │ N
       │                           │
       │                           │ 1
       │                  ┌────────┴──────────┐
       │                  │  VEHICLE_MAKES    │
       │                  └───────────────────┘
       │ 1
       │
       │ N
┌──────┴──────────┐
│   BOOKINGS      │◀─────────┐
└──────┬──────────┘  N    1  │
       │                     │
       │ 1                   │
       │                     │
       │ N         ┌─────────┴─────────┐
┌──────┴──────┐   │ CHARGING_STATIONS │
│  PAYMENTS   │   └─────────┬─────────┘
└─────────────┘             │ 1
                            │
                  ┌─────────┼─────────┐
                  │ N       │ 1       │
         ┌────────┴───┐     │    ┌────┴──────┐
         │TIME_SLOTS  │     │    │  PRICING  │
         └────────────┘     │    └───────────┘
                            │ N
                   ┌────────┴──────────┐
                   │ CHARGING_PORTS    │
                   └───────────────────┘
```

### Key Tables

#### 1. **users**
Stores user information with role-based access
- Primary Key: `user_id`
- Foreign Key: `role_id` → roles
- Constraints: UNIQUE(username, email)

#### 2. **charging_stations**
Stores charging station locations
- Primary Key: `station_id`
- Constraints: CHECK(total_ports > 0)

#### 3. **charging_ports**
Individual ports at each station
- Primary Key: `port_id`
- Foreign Key: `station_id` → charging_stations
- Constraints: UNIQUE(station_id, port_number)

#### 4. **vehicle_models**
EV car models with technical specs
- Primary Key: `model_id`
- Foreign Key: `make_id` → vehicle_makes
- Constraints: CHECK(battery_capacity_kwh > 0, charging_rate_kw > 0)

#### 5. **bookings**
Central table for charging slot bookings
- Primary Key: `booking_id`
- Foreign Keys: user_id, station_id, port_id, user_vehicle_id, slot_id
- Constraints: CHECK(target > current), CHECK(end_time > start_time)
- Trigger: Prevents double booking

#### 6. **payments**
Payment transactions
- Primary Key: `payment_id`
- Foreign Keys: booking_id, user_id
- Constraints: UNIQUE(transaction_id)

### Normalization

**First Normal Form (1NF)**
- All tables have atomic values
- Each column contains single values
- Each row is unique (primary key)

**Second Normal Form (2NF)**
- All non-key attributes fully depend on primary key
- No partial dependencies
- Example: vehicle_models depends on model_id, not on make details

**Third Normal Form (3NF)**
- No transitive dependencies
- Example: Pricing is separate from stations to avoid redundancy
- User vehicles separated from users to handle multiple vehicles

### Constraints Implemented

```sql
-- Primary Keys
✓ Every table has a primary key

-- Foreign Keys  
✓ All relationships enforced with CASCADE/RESTRICT

-- Check Constraints
✓ Battery capacity > 0
✓ Charging rate > 0
✓ Efficiency between 50-100%
✓ Port number > 0
✓ Charge percentages 0-100
✓ Target > Current charge

-- Unique Constraints
✓ Username, email unique
✓ Port numbers unique per station
✓ Transaction IDs unique

-- NOT NULL
✓ Critical fields marked as required

-- Default Values
✓ Timestamps, status fields, booleans
```

### Triggers

1. **trg_prevent_double_booking**
   - Prevents overlapping bookings on same port
   - Validates time slot availability
   - Raises error if conflict detected

2. **trg_calculate_charging_estimates**
   - Automatically calculates energy needed
   - Computes charging duration
   - Based on vehicle specifications

3. **trg_log_booking_cancellation**
   - Creates audit log entry
   - Tracks cancellation events

### Views

1. **v_station_availability**
   - Shows stations with port counts
   - Active vs available ports
   - Operational status

2. **v_user_booking_history**
   - Comprehensive booking details
   - Joins users, stations, vehicles
   - Sorted by date

3. **v_active_pricing**
   - Current pricing configuration
   - Station-specific or default
   - Date-range filtered

## 📦 Installation

### Prerequisites
- Node.js (v14 or higher)
- MySQL/MariaDB (v5.7 or higher)
- npm or yarn

### Step 1: Clone/Download Project
```bash
cd Fluxore-EV-Charging-System
```

### Step 2: Setup Database
```bash
# Login to MySQL
mysql -u root -p

# Run schema
mysql -u root -p < database/schema.sql

# Load sample data
mysql -u root -p < database/sample_data.sql
```

### Step 3: Configure Backend
```bash
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env with your database credentials
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=fluxore_db
```

### Step 4: Start Server
```bash
# Development mode
npm run dev

# Production mode
npm start
```

Server will start at `http://localhost:3000`

### Step 5: Access Application
Open browser and navigate to:
```
http://localhost:3000
```

## 🚀 Usage

### Default Credentials

**Admin Login:**
- Username: `admin`
- Password: `password123`

**User Login:**
- Username: `john_doe`
- Password: `password123`

### User Workflow
1. Register new account or login
2. Add your EV vehicle (make, model)
3. Browse charging stations
4. Select station and check availability
5. Book a time slot
6. Make payment (dummy)
7. View booking confirmation
8. Cancel if needed (check penalty)

### Admin Workflow
1. Login with admin credentials
2. Add new charging stations
3. Configure ports for each station
4. Add vehicle makes and models
5. Set pricing configuration
6. View all bookings
7. Manage system settings

## 🔌 API Endpoints

### Authentication
```
POST   /api/auth/register    - Register new user
POST   /api/auth/login       - User login
```

### Stations
```
GET    /api/stations              - Get all stations
GET    /api/stations/:id          - Get station by ID
GET    /api/stations/:id/availability - Check available slots
```

### Vehicles
```
GET    /api/vehicles/makes                  - Get all makes
GET    /api/vehicles/makes/:id/models       - Get models by make
GET    /api/vehicles/user/:userId           - Get user vehicles
POST   /api/vehicles/user/:userId           - Add vehicle
```

### Bookings
```
POST   /api/bookings                    - Create booking
GET    /api/bookings/user/:userId       - Get user bookings
GET    /api/bookings/:id                - Get booking by ID
PUT    /api/bookings/:id/cancel         - Cancel booking
```

### Admin (Requires Admin Role)
```
GET    /api/admin/bookings              - View all bookings
POST   /api/admin/stations              - Add station
PUT    /api/admin/stations/:id          - Update station
DELETE /api/admin/stations/:id          - Delete station
POST   /api/admin/vehicle-makes         - Add vehicle make
POST   /api/admin/vehicle-models        - Add vehicle model
POST   /api/admin/pricing               - Update pricing
GET    /api/admin/settings              - Get settings
PUT    /api/admin/settings/:key         - Update setting
GET    /api/admin/dashboard/stats       - Dashboard statistics
```

### Payments
```
POST   /api/payments/process            - Process payment
GET    /api/payments/booking/:id        - Get payment by booking
GET    /api/payments/user/:userId       - User payment history
```

## 📚 DBMS Concepts Demonstrated

### 1. Entity Relationships
- **One-to-Many**: Users → Bookings, Stations → Ports
- **Many-to-One**: Bookings → Users, Models → Makes
- **One-to-One**: Booking → Payment (in most cases)

### 2. Referential Integrity
- All foreign keys enforce relationships
- CASCADE delete where appropriate
- RESTRICT to prevent orphaned records

### 3. Data Integrity Constraints
- **Entity Integrity**: Primary keys on all tables
- **Referential Integrity**: Foreign key constraints
- **Domain Integrity**: Check constraints, data types
- **User-defined Integrity**: Business rules via triggers

### 4. Normalization Benefits
- ✅ No data redundancy
- ✅ Consistent updates
- ✅ Efficient storage
- ✅ Maintainable structure

### 5. Transactions (ACID)
- **Atomicity**: Booking + Payment as single unit
- **Consistency**: Constraints enforced
- **Isolation**: Concurrent bookings handled
- **Durability**: Committed transactions persisted

### 6. Indexes
- Primary key indexes (automatic)
- Foreign key indexes for joins
- Custom indexes on frequently queried columns
- Improves query performance

### 7. Views
- Abstraction of complex queries
- Security (hide sensitive data)
- Simplified application code

### 8. Triggers
- Automated business logic
- Data validation
- Audit logging
- Calculated fields

## 📁 Project Structure

```
Fluxore-EV-Charging-System/
│
├── database/
│   ├── schema.sql              # Complete database schema
│   └── sample_data.sql         # Sample data for testing
│
├── backend/
│   ├── config/
│   │   └── database.js         # Database connection
│   ├── routes/
│   │   ├── auth.routes.js      # Authentication
│   │   ├── station.routes.js   # Stations API
│   │   ├── vehicle.routes.js   # Vehicles API
│   │   ├── booking.routes.js   # Bookings API
│   │   ├── admin.routes.js     # Admin API
│   │   └── payment.routes.js   # Payments API
│   ├── server.js               # Express server
│   ├── package.json            # Dependencies
│   └── .env.example            # Environment template
│
├── frontend/
│   ├── css/
│   │   └── style.css           # Complete styling
│   ├── js/
│   │   ├── main.js             # Core utilities
│   │   └── user-dashboard.js   # Dashboard logic
│   ├── index.html              # Landing page
│   ├── login.html              # Login page
│   ├── register.html           # Registration
│   └── user-dashboard.html     # User dashboard
│
├── docs/
│   ├── ER_DIAGRAM.md           # ER diagram explanation
│   ├── VIVA_QUESTIONS.md       # Common viva questions
│   └── DBMS_CONCEPTS.md        # Detailed concepts
│
└── README.md                   # This file
```

## 🖼 Screenshots

*(Add screenshots after running the application)*

1. Landing Page
2. User Registration
3. Login Page
4. User Dashboard
5. Station Listing
6. Booking Form
7. Available Slots
8. Booking History
9. My Vehicles
10. Admin Dashboard

## 🔮 Future Enhancements

### Phase 2 Features
- [ ] Real-time slot availability using WebSockets
- [ ] Google Maps integration for station locations
- [ ] Email/SMS notifications
- [ ] Payment gateway integration (Razorpay, Stripe)
- [ ] Mobile app (React Native)
- [ ] Charging session monitoring
- [ ] Dynamic pricing based on demand
- [ ] Loyalty points and rewards
- [ ] Station reviews and ratings
- [ ] Multi-language support

### Advanced DBMS Features
- [ ] Stored procedures for complex operations
- [ ] Database replication for high availability
- [ ] Query optimization and performance tuning
- [ ] Database backup and recovery procedures
- [ ] Data warehousing for analytics
- [ ] Full-text search for stations

## 🎓 VIVA Questions & Answers

See [docs/VIVA_QUESTIONS.md](docs/VIVA_QUESTIONS.md) for:
- Common DBMS concept questions
- Project-specific questions
- Technical explanations
- Database design justifications

## 📄 License

This is an educational project for DBMS mini project purposes.

## 👥 Contributors

- Your Name - Complete System Development

## 🙏 Acknowledgments

- College/University Name
- Course: Database Management Systems
- Instructor: [Name]
- Year: 2024

## 📞 Support

For any queries or issues:
- Email: support@fluxore.com
- GitHub Issues: [Create an issue]

---

**Built with ❤️ for DBMS Mini Project**

*Demonstrating practical application of database concepts in a real-world scenario*
