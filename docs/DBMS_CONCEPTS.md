# 📋 DBMS Concepts Applied in Fluxore

## Detailed Explanation of Database Concepts

### 1. Data Models

#### Relational Data Model
Our entire project uses the relational model where:
- **Tables (Relations)** represent entities
- **Rows (Tuples)** represent records
- **Columns (Attributes)** represent properties
- **Relationships** connect tables via foreign keys

**Example**:
```
USERS Table:
┌─────────┬──────────┬─────────────────┬────────────┐
│ user_id │ username │ email           │ full_name  │
├─────────┼──────────┼─────────────────┼────────────┤
│ 1       │ admin    │ admin@flux.com  │ Admin      │
│ 2       │ john_doe │ john@email.com  │ John Doe   │
└─────────┴──────────┴─────────────────┴────────────┘
```

---

### 2. Schema Architecture

#### Three-Level Architecture

**1. External Schema (View Level)**
- User-specific views
- Example: `v_user_booking_history` shows only relevant booking info
```sql
CREATE VIEW v_user_booking_history AS
SELECT booking_id, full_name, station_name, booking_date
FROM bookings JOIN users JOIN stations...
```

**2. Conceptual Schema (Logical Level)**
- Complete database structure
- All tables, relationships, constraints
- Independent of physical storage

**3. Internal Schema (Physical Level)**
- How data is stored on disk
- Indexes, file organization
- Handled by MySQL engine

**Data Independence**:
- ✅ Change view without changing tables
- ✅ Change storage without changing schema
- ✅ Application logic independent of storage

---

### 3. Keys and Constraints

#### Types of Keys

**Primary Key**:
```sql
CREATE TABLE users (
    user_id INT PRIMARY KEY AUTO_INCREMENT,
    ...
);
```
- Uniquely identifies each record
- Cannot be NULL
- Only one per table

**Foreign Key**:
```sql
CREATE TABLE bookings (
    booking_id INT PRIMARY KEY,
    user_id INT NOT NULL,
    station_id INT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (station_id) REFERENCES charging_stations(station_id)
);
```
- Links tables together
- Enforces referential integrity
- CASCADE, RESTRICT, SET NULL options

**Candidate Key**:
- Attributes that could be primary key
- Example in USERS: `user_id`, `username`, `email`
- We chose `user_id` as PK (simpler, integer)

**Super Key**:
- Set of attributes uniquely identifying records
- Example: (`user_id`, `email`) together
- Candidate keys are minimal super keys

**Composite Key**:
```sql
CREATE TABLE charging_ports (
    station_id INT,
    port_number INT,
    ...,
    PRIMARY KEY (station_id, port_number)
);
```
- Multiple columns as primary key
- Used when single column insufficient

**Alternate Key**:
- Candidate keys not chosen as primary key
- Example: `username`, `email` in USERS
- Enforced with UNIQUE constraint

---

### 4. Integrity Constraints

#### Entity Integrity
```sql
-- Primary key cannot be NULL
user_id INT PRIMARY KEY NOT NULL
```

#### Referential Integrity
```sql
-- Foreign key must reference existing record
FOREIGN KEY (role_id) REFERENCES roles(role_id)
    ON DELETE RESTRICT  -- Cannot delete role if users exist
    ON UPDATE CASCADE   -- Update propagates to referencing tables
```

#### Domain Integrity
```sql
-- Value must be in valid range
CHECK (battery_capacity_kwh > 0)
CHECK (charging_efficiency BETWEEN 50 AND 100)
CHECK (target_charge_percentage > current_charge_percentage)

-- Enum restricts to specific values
booking_status ENUM('CONFIRMED', 'CANCELLED', 'COMPLETED', 'IN_PROGRESS')
```

#### User-defined Integrity
```sql
-- Business rules via triggers
CREATE TRIGGER trg_prevent_double_booking
BEFORE INSERT ON bookings
FOR EACH ROW
BEGIN
    IF EXISTS (SELECT 1 FROM bookings 
               WHERE port_id = NEW.port_id 
               AND booking_date = NEW.booking_date
               AND start_time < NEW.end_time 
               AND end_time > NEW.start_time) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Slot already booked';
    END IF;
END;
```

---

### 5. Normalization in Depth

#### Unnormalized Form (UNF)

**Problems**:
```
BOOKINGS:
booking_id | user_name | user_email | user_phone | station_name | station_address | 
vehicle_make | vehicle_model | battery_capacity | charging_rate | ...
```

Issues:
- ❌ User data repeated in every booking
- ❌ Station data repeated
- ❌ Vehicle data repeated
- ❌ Insertion anomaly (can't add station without booking)
- ❌ Deletion anomaly (delete booking, lose station info)
- ❌ Update anomaly (change station address in multiple places)

#### First Normal Form (1NF)

**Rules**:
1. Each cell contains single value (atomic)
2. Each row is unique
3. No repeating groups

**Applied**:
```sql
-- ✓ Single values only
full_name VARCHAR(200)  -- Not: names (array)
phone_number VARCHAR(15)  -- Not: phones (multiple)

-- ✓ Each row unique via primary key
user_id INT PRIMARY KEY

-- ✓ No repeating groups
-- Not: vehicle1_make, vehicle2_make, vehicle3_make
-- Instead: Separate USER_VEHICLES table
```

#### Second Normal Form (2NF)

**Rules**:
1. Must be in 1NF
2. No partial dependencies
   - All non-key attributes fully depend on primary key

**Example**:

**Violation** (Not in 2NF):
```
BOOKING_DETAILS (booking_id, port_id, booking_date, port_type, max_power_kw)
                 ─────────────────────
                    Composite PK

- port_type depends only on port_id (partial dependency)
- max_power_kw depends only on port_id (partial dependency)
```

**Solution** (2NF):
```
BOOKINGS (booking_id, port_id, booking_date, ...)
                      └── FK
CHARGING_PORTS (port_id, port_type, max_power_kw, ...)
```
Now all attributes in each table fully depend on their primary key.

#### Third Normal Form (3NF)

**Rules**:
1. Must be in 2NF
2. No transitive dependencies
   - Non-key attributes don't depend on other non-key attributes

**Example**:

**Violation** (Not in 3NF):
```
VEHICLE_MODELS (model_id, model_name, make_id, make_name, country)
- make_name depends on make_id (not on model_id directly)
- country depends on make_id
- Transitive: model_id → make_id → make_name
```

**Solution** (3NF):
```
VEHICLE_MODELS (model_id, model_name, make_id)
                                       └── FK
VEHICLE_MAKES (make_id, make_name, country)
```
Eliminated transitive dependency.

#### Boyce-Codd Normal Form (BCNF)

**Rules**:
- Stricter version of 3NF
- For every functional dependency X → Y, X must be a superkey

**Our Design**: Already in BCNF
- All determinants are candidate keys
- No anomalies present

---

### 6. Functional Dependencies

#### Definition
If attribute A determines attribute B, we write: A → B

**Examples in Fluxore**:

```
user_id → username, email, full_name
         (user_id determines all user attributes)

booking_id → user_id, station_id, booking_date, start_time
            (booking_id determines all booking attributes)

model_id → battery_capacity_kwh, charging_rate_kw
          (model_id determines vehicle specs)

station_id, port_number → port_id
                          (composite key determines port)
```

#### Armstrong's Axioms

**Reflexivity**: If Y ⊆ X, then X → Y
```
Example: (user_id, email) → user_id
```

**Augmentation**: If X → Y, then XZ → YZ
```
Example: If user_id → email
         Then (user_id, booking_id) → (email, booking_id)
```

**Transitivity**: If X → Y and Y → Z, then X → Z
```
Example: If booking_id → user_id
         And user_id → email
         Then booking_id → email
```

---

### 7. Transactions

#### ACID Properties in Detail

**Atomicity Example**:
```javascript
// Creating booking with payment
BEGIN TRANSACTION;

try {
    // Step 1: Insert booking
    INSERT INTO bookings (...) VALUES (...);
    
    // Step 2: Create payment record
    INSERT INTO payments (...) VALUES (...);
    
    // Step 3: Log action
    INSERT INTO audit_logs (...) VALUES (...);
    
    COMMIT; // All succeed
} catch (error) {
    ROLLBACK; // All fail - maintains atomicity
}
```

**Consistency Example**:
```sql
-- Constraint ensures consistency
CHECK (target_charge_percentage > current_charge_percentage)

-- If violated, transaction fails
-- Database never in inconsistent state
```

**Isolation Example**:
```
Time  | User A                    | User B
------|---------------------------|---------------------------
t1    | SELECT port availability  |
t2    |                           | SELECT port availability
t3    | INSERT booking            |
t4    |                           | INSERT booking (FAILS)
t5    | COMMIT                    | ROLLBACK

Result: Only one booking succeeds (isolation maintained)
```

**Durability Example**:
```javascript
// After COMMIT
await connection.commit();

// Even if server crashes here
// Booking is permanently saved
// Will exist after restart
```

#### Transaction States

```
         START
           ↓
    [ACTIVE STATE]
           ↓
    ┌──────┴──────┐
    ↓             ↓
[COMMIT]      [ROLLBACK]
    ↓             ↓
[COMMITTED]  [ABORTED]
```

**Example Flow**:
1. START: Begin transaction
2. ACTIVE: Execute SQL statements
3. If error → ROLLBACK → ABORTED
4. If success → COMMIT → COMMITTED

---

### 8. Concurrency Control

#### Problems Without Concurrency Control

**Lost Update**:
```
Time  | Transaction 1           | Transaction 2
------|------------------------|----------------------
t1    | READ slots (5 free)    |
t2    |                        | READ slots (5 free)
t3    | BOOK slot (4 free)     |
t4    |                        | BOOK slot (4 free) ← Wrong!
t5    | WRITE (4 free)         |
t6    |                        | WRITE (4 free)

Result: 2 bookings made, but count shows only 1 lost
```

**Dirty Read**:
```
Time  | Transaction 1           | Transaction 2
------|------------------------|----------------------
t1    | UPDATE price = 100     |
t2    |                        | READ price (100)
t3    | ROLLBACK               | ← Read uncommitted data
t4    |                        | Uses wrong price!
```

**Solution: Locking**:

**Exclusive Lock (X-lock)**:
```sql
BEGIN;
SELECT * FROM bookings 
WHERE port_id = 1 
FOR UPDATE; -- Exclusive lock

-- Other transactions wait
INSERT INTO bookings (...);
COMMIT; -- Lock released
```

**Shared Lock (S-lock)**:
```sql
BEGIN;
SELECT * FROM pricing 
LOCK IN SHARE MODE; -- Shared lock

-- Others can read but not write
COMMIT;
```

---

### 9. Indexing

#### Types of Indexes

**B-Tree Index** (Default):
```sql
CREATE INDEX idx_username ON users(username);
```
- Balanced tree structure
- Good for =, <, >, BETWEEN, LIKE 'prefix%'
- Used for primary keys

**Hash Index**:
```sql
CREATE INDEX idx_email USING HASH ON users(email);
```
- Fast equality lookups
- Not good for range queries

**Composite Index**:
```sql
CREATE INDEX idx_port_booking 
ON bookings(port_id, booking_date, start_time);
```
- Multiple columns
- Order matters (left-prefix rule)

**Unique Index**:
```sql
CREATE UNIQUE INDEX idx_unique_email ON users(email);
```
- Ensures uniqueness
- Automatically created for UNIQUE constraints

#### Index Impact

**Without Index**:
```sql
SELECT * FROM users WHERE username = 'john_doe';
-- Full table scan: O(n)
-- Reads all rows
```

**With Index**:
```sql
SELECT * FROM users WHERE username = 'john_doe';
-- Index lookup: O(log n)
-- Direct access
```

**Performance Example**:
```
Table Size: 1,000,000 users

Without Index:
- Scan 1,000,000 rows
- Time: ~5 seconds

With Index:
- Traverse log₂(1,000,000) ≈ 20 nodes
- Time: ~0.001 seconds
```

---

### 10. Joins

#### Types of Joins in Fluxore

**INNER JOIN**:
```sql
SELECT b.booking_id, u.full_name, cs.station_name
FROM bookings b
INNER JOIN users u ON b.user_id = u.user_id
INNER JOIN charging_stations cs ON b.station_id = cs.station_id;
```
Result: Only bookings with matching users and stations

**LEFT JOIN**:
```sql
SELECT cs.station_name, COUNT(b.booking_id) as total_bookings
FROM charging_stations cs
LEFT JOIN bookings b ON cs.station_id = b.station_id
GROUP BY cs.station_id;
```
Result: All stations, even those with 0 bookings

**RIGHT JOIN** (Rarely used):
```sql
SELECT u.username, b.booking_id
FROM bookings b
RIGHT JOIN users u ON b.user_id = u.user_id;
```
Result: All users, even those without bookings

**CROSS JOIN** (Cartesian Product):
```sql
SELECT s.station_id, t.slot_duration_minutes
FROM charging_stations s
CROSS JOIN time_slots t;
```
Result: Every station paired with every time slot

**SELF JOIN**:
```sql
-- Find users who booked at same station
SELECT u1.username, u2.username, b1.station_id
FROM bookings b1
JOIN bookings b2 ON b1.station_id = b2.station_id AND b1.user_id != b2.user_id
JOIN users u1 ON b1.user_id = u1.user_id
JOIN users u2 ON b2.user_id = u2.user_id;
```

---

### 11. Aggregate Functions

#### Usage in Fluxore

**COUNT**:
```sql
-- Total bookings
SELECT COUNT(*) FROM bookings;

-- Bookings per user
SELECT user_id, COUNT(*) as booking_count
FROM bookings
GROUP BY user_id;

-- Count only confirmed
SELECT COUNT(*) FROM bookings WHERE booking_status = 'CONFIRMED';
```

**SUM**:
```sql
-- Total revenue
SELECT SUM(amount) as total_revenue 
FROM payments 
WHERE payment_status = 'COMPLETED';

-- Revenue per station
SELECT station_id, SUM(amount) as station_revenue
FROM payments p
JOIN bookings b ON p.booking_id = b.booking_id
GROUP BY b.station_id;
```

**AVG**:
```sql
-- Average battery capacity
SELECT AVG(battery_capacity_kwh) as avg_capacity
FROM vehicle_models;

-- Average booking duration
SELECT AVG(TIMESTAMPDIFF(MINUTE, start_time, end_time)) as avg_duration
FROM bookings;
```

**MAX / MIN**:
```sql
-- Most expensive station
SELECT station_id, MAX(price_per_kwh) as max_price
FROM pricing
GROUP BY station_id;

-- Shortest booking
SELECT MIN(TIMESTAMPDIFF(MINUTE, start_time, end_time)) as shortest
FROM bookings;
```

**GROUP BY with HAVING**:
```sql
-- Users with more than 5 bookings
SELECT user_id, COUNT(*) as booking_count
FROM bookings
GROUP BY user_id
HAVING COUNT(*) > 5;

-- Stations with average rating > 4.5
SELECT station_id, AVG(rating) as avg_rating
FROM reviews
GROUP BY station_id
HAVING AVG(rating) > 4.5;
```

---

### 12. Subqueries

#### Types Used

**Scalar Subquery** (Returns single value):
```sql
-- Get user with most bookings
SELECT full_name
FROM users
WHERE user_id = (
    SELECT user_id 
    FROM bookings 
    GROUP BY user_id 
    ORDER BY COUNT(*) DESC 
    LIMIT 1
);
```

**Row Subquery** (Returns single row):
```sql
-- Get station details where price is highest
SELECT * FROM charging_stations
WHERE station_id = (
    SELECT station_id FROM pricing ORDER BY price_per_kwh DESC LIMIT 1
);
```

**Table Subquery** (Returns multiple rows):
```sql
-- Users who made bookings in last month
SELECT *
FROM users
WHERE user_id IN (
    SELECT DISTINCT user_id 
    FROM bookings 
    WHERE booking_date >= DATE_SUB(NOW(), INTERVAL 1 MONTH)
);
```

**Correlated Subquery** (References outer query):
```sql
-- Users with above-average bookings
SELECT u.username, 
       (SELECT COUNT(*) FROM bookings WHERE user_id = u.user_id) as count
FROM users u
WHERE (SELECT COUNT(*) FROM bookings WHERE user_id = u.user_id) > 
      (SELECT AVG(booking_count) FROM 
       (SELECT COUNT(*) as booking_count FROM bookings GROUP BY user_id) as avg_bookings);
```

**EXISTS**:
```sql
-- Stations with at least one booking
SELECT station_name
FROM charging_stations cs
WHERE EXISTS (
    SELECT 1 FROM bookings WHERE station_id = cs.station_id
);
```

---

This comprehensive guide covers all major DBMS concepts demonstrated in the Fluxore project. Use it for understanding, viva preparation, and future enhancements!
