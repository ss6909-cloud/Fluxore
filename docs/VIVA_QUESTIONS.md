# 🎤 VIVA Questions & Answers - Fluxore DBMS Project

## General DBMS Concepts

### Q1: What is a Database Management System?
**Answer**: A DBMS is software that manages databases, providing mechanisms for:
- Data storage and retrieval
- Data security and integrity
- Concurrent access by multiple users
- Data backup and recovery

In our project, we use MySQL as the DBMS to manage the Fluxore EV charging system data.

---

### Q2: What are the advantages of using DBMS over file systems?
**Answer**:
1. **Data Independence**: Application programs independent of data structure
2. **Data Integrity**: Constraints ensure valid data
3. **Reduced Redundancy**: Normalization eliminates duplication
4. **Concurrent Access**: Multiple users can access simultaneously
5. **Data Security**: Role-based access control
6. **Backup & Recovery**: Automated mechanisms

**Example in Fluxore**: Multiple users can book slots simultaneously without conflicts, thanks to DBMS transaction management.

---

### Q3: Explain the types of keys in DBMS.
**Answer**:

1. **Primary Key**: Uniquely identifies each record
   - Example: `user_id` in USERS table

2. **Foreign Key**: Links two tables
   - Example: `role_id` in USERS references `role_id` in ROLES

3. **Candidate Key**: Attributes that can be primary key
   - Example: `email`, `username` in USERS

4. **Super Key**: Set of attributes uniquely identifying records
   - Example: (`user_id`, `email`) combination

5. **Unique Key**: Ensures uniqueness but allows NULL
   - Example: `license_plate` in USER_VEHICLES

---

### Q4: What is Normalization? Why is it important?
**Answer**: Normalization is organizing data to reduce redundancy and improve data integrity.

**Normal Forms in Fluxore**:

**1NF**: All attributes atomic
- No multi-valued attributes
- Example: phone_number is single value, not array

**2NF**: No partial dependencies
- All non-key attributes depend on entire primary key
- Example: In BOOKINGS, all attributes depend on booking_id

**3NF**: No transitive dependencies
- Non-key attributes don't depend on other non-key attributes
- Example: PRICING is separate table, not embedded in STATIONS

**Benefits**:
- ✅ No data redundancy
- ✅ Easier updates (change in one place)
- ✅ Better data integrity
- ✅ Efficient storage

---

### Q5: What are ACID properties?
**Answer**: ACID ensures reliable database transactions:

**A - Atomicity**: All operations complete or none do
- Example: Creating booking + payment together (both succeed or both fail)

**C - Consistency**: Database moves from one valid state to another
- Example: Check constraints ensure charge percentage is 0-100

**I - Isolation**: Concurrent transactions don't interfere
- Example: Two users booking same slot won't cause conflict

**D - Durability**: Committed changes are permanent
- Example: Completed bookings survive system crash

---

## Project-Specific Questions

### Q6: Explain the ER model of your project.
**Answer**: Our ER model has 13 entities:

**Main Entities**:
1. **USERS** - System users (admin/consumer)
2. **CHARGING_STATIONS** - Physical locations
3. **CHARGING_PORTS** - Individual charging points
4. **BOOKINGS** - Slot reservations
5. **VEHICLE_MODELS** - EV specifications
6. **PAYMENTS** - Transaction records

**Key Relationships**:
- USERS → BOOKINGS (1:N) - One user, many bookings
- STATIONS → PORTS (1:N) - One station, many ports
- PORTS → BOOKINGS (1:N) - One port, many bookings
- BOOKINGS → PAYMENTS (1:N) - One booking, multiple payments possible

---

### Q7: Why did you normalize your database?
**Answer**: 

**Without Normalization** (Problems):
```
BOOKINGS: booking_id, user_name, user_email, station_name, 
          station_address, vehicle_name, battery_capacity...
```
- ❌ Redundant station data in every booking
- ❌ User data duplicated
- ❌ Update anomalies (change station address everywhere)

**With Normalization** (Solution):
```
USERS: user_id, name, email
STATIONS: station_id, name, address
BOOKINGS: booking_id, user_id (FK), station_id (FK)
```
- ✅ Each data point stored once
- ✅ Update station address in one place
- ✅ Maintains data integrity

---

### Q8: How do you prevent double booking in your system?
**Answer**: Three-layer protection:

**1. Database Trigger**:
```sql
CREATE TRIGGER trg_prevent_double_booking
BEFORE INSERT ON bookings
-- Checks for overlapping time slots on same port
```

**2. Application Logic**:
- Check availability before showing slots to user
- Validate again before creating booking

**3. Transaction Management**:
```javascript
BEGIN TRANSACTION
  -- Check availability
  -- Create booking
  -- If conflict, ROLLBACK
COMMIT
```

**Example**: If two users try booking Port 1 at 10:00 AM simultaneously, the database trigger ensures only one succeeds.

---

### Q9: Explain the role-based access control in your project.
**Answer**:

**Implementation**:
1. **ROLES Table**: Stores role definitions (ADMIN, USER)
2. **USERS.role_id**: Links each user to a role
3. **JWT Token**: Includes role information
4. **Middleware**: Verifies role before allowing access

**Access Control**:

**Admin Can**:
- ✅ Add/edit/delete stations
- ✅ Add vehicle makes/models
- ✅ Set pricing
- ✅ View all bookings
- ✅ Manage system settings

**User Can**:
- ✅ Book charging slots
- ✅ Cancel own bookings
- ✅ View own bookings
- ✅ Add own vehicles
- ❌ Cannot access admin functions

**Example**:
```javascript
// Middleware
if (user.role !== 'ADMIN') {
  return res.status(403).json({ error: 'Admin access required' });
}
```

---

### Q10: How does your system calculate charging time?
**Answer**:

**Trigger automatically calculates**:

```sql
-- Get vehicle specs
battery_capacity = 60 kWh
charging_rate = 50 kW
efficiency = 90%

-- User inputs
current_charge = 20%
target_charge = 80%

-- Calculation
energy_needed = 60 * (80 - 20) / 100 = 36 kWh

charging_time = (36 / 50) * (100 / 90) * 60 
              = 0.72 * 1.11 * 60 
              = 48 minutes
```

**Formula**:
```
Time = (Energy / Power) × (100 / Efficiency) × 60 minutes
```

**Stored in**:
- `estimated_energy_kwh` = 36.0
- `estimated_duration_minutes` = 48

---

### Q11: Explain the transaction flow for creating a booking.
**Answer**:

**Step-by-Step**:

1. **Begin Transaction**
```javascript
await connection.beginTransaction();
```

2. **Validate Slot Availability**
```sql
SELECT * FROM bookings 
WHERE port_id = ? AND booking_date = ?
  AND (start_time < ? AND end_time > ?)
```

3. **Insert Booking** (Trigger calculates estimates)
```sql
INSERT INTO bookings (user_id, station_id, port_id, ...)
VALUES (?, ?, ?, ...)
```

4. **Create Payment Record**
```sql
INSERT INTO payments (booking_id, user_id, amount, ...)
VALUES (?, ?, ?, ...)
```

5. **Log Action**
```sql
INSERT INTO audit_logs (user_id, action_type, ...)
VALUES (?, 'BOOKING_CREATED', ...)
```

6. **Commit Transaction**
```javascript
await connection.commit();
```

**If any step fails**: Entire transaction rolls back - No partial bookings!

---

### Q12: What indexes have you used and why?
**Answer**:

**Primary Key Indexes** (Automatic):
- Fast lookup by ID
- Example: `user_id`, `booking_id`, `station_id`

**Foreign Key Indexes**:
- Speed up JOIN operations
- Example: `bookings.user_id`, `bookings.station_id`

**Custom Indexes**:

1. **Username & Email**:
```sql
INDEX idx_username (username)
INDEX idx_email (email)
```
- Fast login lookups

2. **Booking Date & Status**:
```sql
INDEX idx_booking_date (booking_date)
INDEX idx_booking_status (booking_status)
```
- Filter bookings by date/status quickly

3. **Port Booking Lookup**:
```sql
INDEX idx_port_booking (port_id, booking_date, start_time)
```
- Check slot availability efficiently

**Impact**: Queries run 10-100x faster with proper indexes

---

### Q13: How do you handle cancellation fees?
**Answer**:

**Business Rule**: Free cancellation if >2 hours before booking, else penalty fee

**Implementation**:

```javascript
// Get booking time
bookingDateTime = new Date(`${booking_date} ${start_time}`);
now = new Date();
hoursDifference = (bookingDateTime - now) / (1000 * 60 * 60);

if (hoursDifference < 2 && hoursDifference > 0) {
  // Late cancellation - charge fee
  const fee = getPricing().late_cancellation_fee; // Default: ₹50
  
  // Create cancellation payment
  INSERT INTO payments (
    booking_id, user_id, amount,
    payment_type = 'CANCELLATION_FEE'
  )
}

// Update booking status
UPDATE bookings SET booking_status = 'CANCELLED'
```

**Stored in**:
- PRICING table: `late_cancellation_fee`
- PAYMENTS table: Separate entry for cancellation
- BOOKINGS table: `cancellation_reason`, `cancelled_at`

---

### Q14: What are the views you created and why?
**Answer**:

**1. v_station_availability**:
```sql
CREATE VIEW v_station_availability AS
SELECT station_id, station_name, 
       COUNT(ports) as total_ports,
       SUM(is_available) as available_ports
FROM charging_stations JOIN charging_ports
GROUP BY station_id
```
**Purpose**: Quick overview of station availability without complex joins

**2. v_user_booking_history**:
```sql
CREATE VIEW v_user_booking_history AS
SELECT b.*, u.full_name, cs.station_name, vm.model_name
FROM bookings b
JOIN users u, stations cs, vehicles vm...
```
**Purpose**: Complete booking details without repetitive joins

**3. v_active_pricing**:
```sql
CREATE VIEW v_active_pricing AS
SELECT * FROM pricing
WHERE is_active = TRUE
  AND effective_from <= CURDATE()
  AND (effective_to IS NULL OR effective_to >= CURDATE())
```
**Purpose**: Only current pricing, simplified queries

**Benefits**:
- Simplifies complex queries
- Consistent data access
- Security (hide sensitive fields)
- Performance (pre-computed joins)

---

### Q15: How does your system ensure data integrity?
**Answer**:

**1. Constraint-based Integrity**:

**Primary Keys**:
```sql
user_id INT PRIMARY KEY
```
- Ensures unique identification

**Foreign Keys**:
```sql
FOREIGN KEY (role_id) REFERENCES roles(role_id)
```
- Maintains relationship validity

**Check Constraints**:
```sql
CHECK (battery_capacity_kwh > 0)
CHECK (target_charge_percentage > current_charge_percentage)
CHECK (end_time > start_time)
```
- Business rule enforcement

**Unique Constraints**:
```sql
UNIQUE (username)
UNIQUE (email)
UNIQUE (transaction_id)
```
- Prevents duplicates

**2. Trigger-based Integrity**:

**Prevent Double Booking**:
```sql
CREATE TRIGGER trg_prevent_double_booking
-- Validates no overlap before insert
```

**Auto-calculate Values**:
```sql
CREATE TRIGGER trg_calculate_charging_estimates
-- Ensures consistent calculations
```

**3. Application-level Validation**:
- Password strength
- Email format
- Date ranges
- Input sanitization

---

## Technical Questions

### Q16: Explain JOIN operations used in your project.
**Answer**:

**INNER JOIN** (Most common):
```sql
SELECT b.*, u.full_name, cs.station_name
FROM bookings b
INNER JOIN users u ON b.user_id = u.user_id
INNER JOIN charging_stations cs ON b.station_id = cs.station_id
```
**Use**: Get booking details with user and station names

**LEFT JOIN**:
```sql
SELECT cs.*, COUNT(cp.port_id) as port_count
FROM charging_stations cs
LEFT JOIN charging_ports cp ON cs.station_id = cp.station_id
GROUP BY cs.station_id
```
**Use**: Show all stations even if they have no ports

**Multiple JOINs**:
```sql
SELECT b.booking_id, u.full_name, 
       vmk.make_name, vm.model_name, cs.station_name
FROM bookings b
JOIN users u ON b.user_id = u.user_id
JOIN user_vehicles uv ON b.user_vehicle_id = uv.user_vehicle_id
JOIN vehicle_models vm ON uv.model_id = vm.model_id
JOIN vehicle_makes vmk ON vm.make_id = vmk.make_id
JOIN charging_stations cs ON b.station_id = cs.station_id
```
**Use**: Complete booking history with all details

---

### Q17: What security measures have you implemented?
**Answer**:

**1. Authentication**:
- Passwords hashed using bcrypt (salt rounds = 10)
- Never store plain text passwords
```javascript
password_hash = bcrypt.hash(password, 10)
```

**2. Authorization**:
- JWT tokens for session management
- Token includes user_id and role
- Verified on every API request
```javascript
jwt.verify(token, JWT_SECRET)
```

**3. SQL Injection Prevention**:
- Parameterized queries (prepared statements)
```javascript
await pool.query(
  'SELECT * FROM users WHERE username = ?',
  [username] // Safe from injection
)
```

**4. Role-based Access**:
- Middleware checks user role
- Admin-only endpoints protected
```javascript
if (user.role !== 'ADMIN') return 403
```

**5. Audit Logging**:
- Track all critical actions
- LOGIN, BOOKING_CREATED, BOOKING_CANCELLED
- Store IP address and timestamp

---

### Q18: How would you optimize query performance?
**Answer**:

**Current Optimizations**:

**1. Indexes**:
```sql
INDEX idx_user_booking (user_id)
INDEX idx_booking_date (booking_date)
INDEX idx_port_booking (port_id, booking_date, start_time)
```

**2. Views**:
- Pre-computed joins
- Reduces query complexity

**3. Connection Pooling**:
```javascript
connectionLimit: 10 // Reuse connections
```

**4. Proper Data Types**:
- INT for IDs (4 bytes)
- DECIMAL for prices (exact)
- ENUM for status (1 byte)

**Future Optimizations**:

**1. Query Caching**:
```javascript
// Cache station list (rarely changes)
redis.set('stations', stationData, 'EX', 3600)
```

**2. Denormalization** (for read-heavy data):
- Store calculated fields
- Example: `total_bookings` in USER table

**3. Partitioning**:
```sql
-- Partition bookings by date
PARTITION BY RANGE (YEAR(booking_date))
```

**4. Database Replication**:
- Master for writes
- Slaves for reads
- Distribute load

---

### Q19: Explain your database backup strategy.
**Answer**:

**Current Approach**:

**1. SQL Dump**:
```bash
mysqldump -u root -p fluxore_db > backup_$(date +%Y%m%d).sql
```
- Complete database export
- Schema + data
- Easy restoration

**2. Scheduled Backups**:
```bash
# Cron job: Daily at 2 AM
0 2 * * * /path/to/backup_script.sh
```

**Production Strategy**:

**1. Full Backups** (Weekly):
- Complete database dump
- Store offsite (cloud storage)

**2. Incremental Backups** (Daily):
- Only changed data
- MySQL binary logs

**3. Point-in-Time Recovery**:
- Transaction logs
- Restore to specific timestamp

**4. Replication**:
- Master-slave setup
- Real-time data copy
- Failover capability

**5. Backup Testing**:
- Regular restore drills
- Verify backup integrity

---

### Q20: What are the limitations of your current system?
**Answer**:

**Current Limitations**:

1. **Scalability**:
   - Single database server
   - No load balancing
   - **Solution**: Database replication, sharding

2. **Real-time Updates**:
   - Manual refresh for availability
   - **Solution**: WebSocket integration

3. **Payment Integration**:
   - Dummy payment only
   - **Solution**: Razorpay/Stripe API

4. **Geolocation**:
   - No distance calculation
   - **Solution**: Google Maps API

5. **Notifications**:
   - No email/SMS alerts
   - **Solution**: SendGrid, Twilio

6. **Analytics**:
   - Basic statistics only
   - **Solution**: Data warehousing, BI tools

7. **Mobile App**:
   - Web-only interface
   - **Solution**: React Native app

**Design Choices**:
- Simple and educational
- Focus on DBMS concepts
- Suitable for mini project scope

---

## Tips for Viva

### Do's:
✅ Understand each table's purpose
✅ Know all relationships
✅ Explain normalization clearly
✅ Be ready to write SQL queries
✅ Understand constraints and triggers
✅ Know your ER diagram by heart
✅ Explain real-world scenarios

### Don'ts:
❌ Memorize answers without understanding
❌ Ignore small tables (roles, time_slots)
❌ Forget ACID properties
❌ Skip trigger explanations
❌ Ignore security aspects

### Practice Queries:
```sql
-- Find available ports on a date
-- Calculate total revenue
-- List users with most bookings
-- Find busiest charging station
-- Show cancelled bookings with fees
```

---

**Good Luck with your Viva! 🎓**
