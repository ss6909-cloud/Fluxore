# 📊 ER Diagram Explanation - Fluxore System

## Entity-Relationship Model

### Entities and Their Attributes

#### 1. **ROLES**
- **role_id** (PK)
- role_name
- description
- created_at

**Purpose**: Defines user roles (ADMIN, USER) for role-based access control

---

#### 2. **USERS**
- **user_id** (PK)
- role_id (FK → ROLES)
- username
- email
- password_hash
- full_name
- phone_number
- address
- is_active
- created_at
- last_login

**Purpose**: Stores all user information (both admins and consumers)

---

#### 3. **VEHICLE_MAKES**
- **make_id** (PK)
- make_name
- country
- created_at

**Purpose**: EV car manufacturers (Tesla, Tata, etc.)

---

#### 4. **VEHICLE_MODELS**
- **model_id** (PK)
- make_id (FK → VEHICLE_MAKES)
- model_name
- battery_capacity_kwh
- charging_rate_kw
- charging_efficiency
- year
- created_at

**Purpose**: Specific EV models with technical specifications

---

#### 5. **USER_VEHICLES**
- **user_vehicle_id** (PK)
- user_id (FK → USERS)
- model_id (FK → VEHICLE_MODELS)
- license_plate
- is_primary
- created_at

**Purpose**: Links users to their owned vehicles (many-to-many relationship resolver)

---

#### 6. **CHARGING_STATIONS**
- **station_id** (PK)
- station_name
- address
- city
- state
- pincode
- latitude
- longitude
- total_ports
- is_operational
- created_at
- updated_at

**Purpose**: Physical charging station locations

---

#### 7. **CHARGING_PORTS**
- **port_id** (PK)
- station_id (FK → CHARGING_STATIONS)
- port_number
- port_type
- max_power_kw
- is_available
- created_at

**Purpose**: Individual charging points at each station

---

#### 8. **TIME_SLOTS**
- **slot_id** (PK)
- slot_duration_minutes
- created_at

**Purpose**: Predefined time slot durations (30, 60, 90, 120 minutes)

---

#### 9. **BOOKINGS**
- **booking_id** (PK)
- user_id (FK → USERS)
- station_id (FK → CHARGING_STATIONS)
- port_id (FK → CHARGING_PORTS)
- user_vehicle_id (FK → USER_VEHICLES)
- slot_id (FK → TIME_SLOTS)
- booking_date
- start_time
- end_time
- current_charge_percentage
- target_charge_percentage
- estimated_energy_kwh
- estimated_duration_minutes
- booking_status
- cancellation_reason
- cancelled_at
- created_at
- updated_at

**Purpose**: Central table for all charging slot bookings

---

#### 10. **PAYMENTS**
- **payment_id** (PK)
- booking_id (FK → BOOKINGS)
- user_id (FK → USERS)
- amount
- payment_type
- payment_status
- payment_method
- transaction_id
- payment_date

**Purpose**: Payment transactions for bookings and cancellation fees

---

#### 11. **PRICING**
- **pricing_id** (PK)
- station_id (FK → CHARGING_STATIONS) [nullable]
- price_per_kwh
- price_per_hour
- cancellation_fee
- late_cancellation_fee
- effective_from
- effective_to
- is_active
- created_at

**Purpose**: Pricing configuration (default or station-specific)

---

#### 12. **SYSTEM_SETTINGS**
- **setting_id** (PK)
- setting_key
- setting_value
- setting_type
- description
- updated_at

**Purpose**: Global system configuration parameters

---

#### 13. **AUDIT_LOGS**
- **log_id** (PK)
- user_id (FK → USERS)
- action_type
- table_name
- record_id
- old_value
- new_value
- ip_address
- created_at

**Purpose**: Track system events and changes for security/debugging

---

## Relationships

### 1. ROLES → USERS (1:N)
- One role can have many users
- Each user has exactly one role
- **Cardinality**: 1:N

### 2. USERS → USER_VEHICLES (1:N)
- One user can have multiple vehicles
- Each vehicle belongs to one user
- **Cardinality**: 1:N

### 3. VEHICLE_MAKES → VEHICLE_MODELS (1:N)
- One make has many models
- Each model belongs to one make
- **Cardinality**: 1:N

### 4. VEHICLE_MODELS → USER_VEHICLES (1:N)
- One model can be owned by multiple users
- Each user vehicle references one model
- **Cardinality**: 1:N

### 5. CHARGING_STATIONS → CHARGING_PORTS (1:N)
- One station has multiple ports
- Each port belongs to one station
- **Cardinality**: 1:N

### 6. USERS → BOOKINGS (1:N)
- One user can make multiple bookings
- Each booking is by one user
- **Cardinality**: 1:N

### 7. CHARGING_STATIONS → BOOKINGS (1:N)
- One station can have multiple bookings
- Each booking is for one station
- **Cardinality**: 1:N

### 8. CHARGING_PORTS → BOOKINGS (1:N)
- One port can have multiple bookings (different times)
- Each booking uses one port
- **Cardinality**: 1:N

### 9. USER_VEHICLES → BOOKINGS (1:N)
- One vehicle can be used in multiple bookings
- Each booking is for one vehicle
- **Cardinality**: 1:N

### 10. TIME_SLOTS → BOOKINGS (1:N)
- One slot duration used by many bookings
- Each booking has one slot duration
- **Cardinality**: 1:N

### 11. BOOKINGS → PAYMENTS (1:N)
- One booking can have multiple payments (charging + cancellation)
- Each payment is for one booking
- **Cardinality**: 1:N

### 12. CHARGING_STATIONS → PRICING (1:N)
- One station can have multiple pricing configurations (history)
- Each pricing can be for one station or default (NULL)
- **Cardinality**: 1:N (optional)

### 13. USERS → AUDIT_LOGS (1:N)
- One user can generate multiple log entries
- Each log entry is for one user
- **Cardinality**: 1:N

---

## Key Design Decisions

### Why Separate USER_VEHICLES Table?
- **Reason**: Users can own multiple EVs with different specs
- **Benefit**: Avoids redundancy in BOOKINGS table
- **Example**: User has Tesla Model 3 and Tata Nexon, books with different vehicles

### Why Separate CHARGING_PORTS from STATIONS?
- **Reason**: Each port has independent availability and specifications
- **Benefit**: Prevents double booking, manages port-level details
- **Example**: Station has 5 ports, each can be booked independently

### Why TIME_SLOTS is a Separate Entity?
- **Reason**: Predefined durations for slot standardization
- **Benefit**: Easy to add new durations, enforce consistency
- **Example**: Supports 30, 60, 90, 120-minute slots

### Why PRICING has nullable station_id?
- **Reason**: Support both default and station-specific pricing
- **Benefit**: Flexibility without duplicating default prices
- **Example**: NULL = applies to all stations, specific ID = override for that station

### Why Separate PAYMENTS from BOOKINGS?
- **Reason**: One booking can have multiple payments
- **Benefit**: Tracks charging fee + cancellation fee separately
- **Example**: User cancels late, pays cancellation fee + refunds charging fee

---

## Normalization Analysis

### First Normal Form (1NF)
✅ All attributes are atomic
✅ No repeating groups
✅ Each cell contains single value

### Second Normal Form (2NF)
✅ In 1NF
✅ All non-key attributes fully depend on primary key
✅ No partial dependencies

**Example**: In VEHICLE_MODELS, model_name depends on model_id (not just make_id)

### Third Normal Form (3NF)
✅ In 2NF
✅ No transitive dependencies
✅ Non-key attributes don't depend on other non-key attributes

**Example**: Station city is not derived from pincode in the database (even though real-world relationship exists)

---

## Cardinality Summary

| Relationship | Type | Description |
|-------------|------|-------------|
| ROLES → USERS | 1:N | One role, many users |
| USERS → BOOKINGS | 1:N | One user, many bookings |
| STATIONS → PORTS | 1:N | One station, many ports |
| PORTS → BOOKINGS | 1:N | One port, many bookings (different times) |
| BOOKINGS → PAYMENTS | 1:N | One booking, possibly multiple payments |
| MAKES → MODELS | 1:N | One make, many models |
| MODELS → USER_VEHICLES | 1:N | One model, many instances owned by users |
| USERS → USER_VEHICLES | 1:N | One user, many vehicles |

---

## Participation Constraints

### Total Participation (Mandatory)
- Every BOOKING must have a USER
- Every BOOKING must have a STATION
- Every BOOKING must have a PORT
- Every BOOKING must have a VEHICLE
- Every PORT must belong to a STATION
- Every MODEL must have a MAKE

### Partial Participation (Optional)
- A STATION may not have BOOKINGS
- A USER may not have VEHICLES
- A USER may not have BOOKINGS
- PRICING may not be linked to specific STATION (default pricing)

---

## Constraints Enforced

### Entity Integrity
- Primary keys on all tables
- NOT NULL where required
- UNIQUE constraints

### Referential Integrity
- Foreign keys with CASCADE/RESTRICT
- Maintains relationship consistency

### Domain Integrity
- Check constraints (percentages 0-100, rates > 0)
- Data types enforce valid ranges
- ENUM for status fields

### Business Rules
- Trigger: Prevent double booking
- Trigger: Auto-calculate charging estimates
- Check: Target charge > Current charge
- Check: End time > Start time

---

This ER design ensures data consistency, eliminates redundancy, and supports all business operations efficiently.
