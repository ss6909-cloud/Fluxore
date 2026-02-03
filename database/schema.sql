-- =====================================================
-- FLUXORE EV CHARGING STATION MANAGEMENT SYSTEM
-- Database Schema (MySQL/MariaDB)
-- =====================================================

-- Drop existing database if exists and create new
DROP DATABASE IF EXISTS fluxore_db;
CREATE DATABASE fluxore_db;
USE fluxore_db;

-- =====================================================
-- 1. ROLES TABLE
-- Stores user roles for role-based access control
-- =====================================================
CREATE TABLE roles (
    role_id INT PRIMARY KEY AUTO_INCREMENT,
    role_name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- 2. USERS TABLE
-- Stores both admin and consumer user information
-- =====================================================
CREATE TABLE users (
    user_id INT PRIMARY KEY AUTO_INCREMENT,
    role_id INT NOT NULL,
    username VARCHAR(100) NOT NULL UNIQUE,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(200) NOT NULL,
    phone_number VARCHAR(15),
    address TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP NULL,
    
    CONSTRAINT fk_user_role FOREIGN KEY (role_id) 
        REFERENCES roles(role_id) ON DELETE RESTRICT,
    INDEX idx_username (username),
    INDEX idx_email (email),
    INDEX idx_role (role_id)
);

-- =====================================================
-- 3. VEHICLE MAKES TABLE
-- Stores EV car manufacturers (managed by admin)
-- =====================================================
CREATE TABLE vehicle_makes (
    make_id INT PRIMARY KEY AUTO_INCREMENT,
    make_name VARCHAR(100) NOT NULL UNIQUE,
    country VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_make_name (make_name)
);

-- =====================================================
-- 4. VEHICLE MODELS TABLE
-- Stores EV car models with technical specifications
-- =====================================================
CREATE TABLE vehicle_models (
    model_id INT PRIMARY KEY AUTO_INCREMENT,
    make_id INT NOT NULL,
    model_name VARCHAR(100) NOT NULL,
    battery_capacity_kwh DECIMAL(6,2) NOT NULL, -- in kilowatt-hours
    charging_rate_kw DECIMAL(6,2) NOT NULL, -- in kilowatts
    charging_efficiency DECIMAL(5,2) DEFAULT 90.00, -- percentage (85-95%)
    year INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_model_make FOREIGN KEY (make_id) 
        REFERENCES vehicle_makes(make_id) ON DELETE CASCADE,
    CONSTRAINT chk_battery_capacity CHECK (battery_capacity_kwh > 0),
    CONSTRAINT chk_charging_rate CHECK (charging_rate_kw > 0),
    CONSTRAINT chk_efficiency CHECK (charging_efficiency BETWEEN 50 AND 100),
    
    UNIQUE KEY unique_model (make_id, model_name, year),
    INDEX idx_model_name (model_name)
);

-- =====================================================
-- 5. USER VEHICLES TABLE
-- Links users to their EV vehicles
-- =====================================================
CREATE TABLE user_vehicles (
    user_vehicle_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    model_id INT NOT NULL,
    license_plate VARCHAR(20) UNIQUE,
    is_primary BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_uv_user FOREIGN KEY (user_id) 
        REFERENCES users(user_id) ON DELETE CASCADE,
    CONSTRAINT fk_uv_model FOREIGN KEY (model_id) 
        REFERENCES vehicle_models(model_id) ON DELETE RESTRICT,
    
    INDEX idx_user_vehicle (user_id),
    INDEX idx_license_plate (license_plate)
);

-- =====================================================
-- 6. CHARGING STATIONS TABLE
-- Stores charging station locations and details
-- =====================================================
CREATE TABLE charging_stations (
    station_id INT PRIMARY KEY AUTO_INCREMENT,
    station_name VARCHAR(200) NOT NULL,
    address TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100),
    pincode VARCHAR(10),
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    total_ports INT NOT NULL DEFAULT 1,
    is_operational BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    CONSTRAINT chk_total_ports CHECK (total_ports > 0),
    INDEX idx_station_name (station_name),
    INDEX idx_city (city),
    INDEX idx_operational (is_operational)
);

-- =====================================================
-- 7. CHARGING PORTS TABLE
-- Individual charging ports at each station
-- =====================================================
CREATE TABLE charging_ports (
    port_id INT PRIMARY KEY AUTO_INCREMENT,
    station_id INT NOT NULL,
    port_number INT NOT NULL,
    port_type VARCHAR(50) DEFAULT 'Type 2', -- CCS, CHAdeMO, Type 2, etc.
    max_power_kw DECIMAL(6,2) DEFAULT 50.00,
    is_available BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_port_station FOREIGN KEY (station_id) 
        REFERENCES charging_stations(station_id) ON DELETE CASCADE,
    CONSTRAINT chk_port_number CHECK (port_number > 0),
    CONSTRAINT chk_max_power CHECK (max_power_kw > 0),
    
    UNIQUE KEY unique_port (station_id, port_number),
    INDEX idx_station_port (station_id),
    INDEX idx_available (is_available)
);

-- =====================================================
-- 8. PRICING TABLE
-- Stores pricing configurations for charging
-- =====================================================
CREATE TABLE pricing (
    pricing_id INT PRIMARY KEY AUTO_INCREMENT,
    station_id INT, -- NULL means default pricing for all stations
    price_per_kwh DECIMAL(10,2) DEFAULT 0.00,
    price_per_hour DECIMAL(10,2) DEFAULT 0.00,
    cancellation_fee DECIMAL(10,2) DEFAULT 0.00,
    late_cancellation_fee DECIMAL(10,2) DEFAULT 50.00, -- if cancelled within 2 hours
    effective_from DATE NOT NULL,
    effective_to DATE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_pricing_station FOREIGN KEY (station_id) 
        REFERENCES charging_stations(station_id) ON DELETE CASCADE,
    CONSTRAINT chk_price_kwh CHECK (price_per_kwh >= 0),
    CONSTRAINT chk_price_hour CHECK (price_per_hour >= 0),
    CONSTRAINT chk_cancellation_fee CHECK (cancellation_fee >= 0),
    CONSTRAINT chk_dates CHECK (effective_to IS NULL OR effective_to >= effective_from),
    
    INDEX idx_station_pricing (station_id),
    INDEX idx_active_pricing (is_active, effective_from)
);

-- =====================================================
-- 9. TIME SLOTS TABLE
-- Predefined time slots for booking
-- =====================================================
CREATE TABLE time_slots (
    slot_id INT PRIMARY KEY AUTO_INCREMENT,
    slot_duration_minutes INT NOT NULL DEFAULT 60, -- 30, 60, 90, 120 minutes
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT chk_slot_duration CHECK (slot_duration_minutes IN (30, 60, 90, 120)),
    UNIQUE KEY unique_duration (slot_duration_minutes)
);

-- =====================================================
-- 10. BOOKINGS TABLE
-- Stores all charging slot bookings
-- =====================================================
CREATE TABLE bookings (
    booking_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    station_id INT NOT NULL,
    port_id INT NOT NULL,
    user_vehicle_id INT NOT NULL,
    slot_id INT NOT NULL,
    booking_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    current_charge_percentage DECIMAL(5,2) DEFAULT 20.00, -- User's current battery %
    target_charge_percentage DECIMAL(5,2) DEFAULT 80.00, -- Desired battery %
    estimated_energy_kwh DECIMAL(8,2), -- Calculated energy needed
    estimated_duration_minutes INT, -- Calculated charging time
    booking_status ENUM('CONFIRMED', 'CANCELLED', 'COMPLETED', 'IN_PROGRESS') DEFAULT 'CONFIRMED',
    cancellation_reason TEXT,
    cancelled_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_booking_user FOREIGN KEY (user_id) 
        REFERENCES users(user_id) ON DELETE CASCADE,
    CONSTRAINT fk_booking_station FOREIGN KEY (station_id) 
        REFERENCES charging_stations(station_id) ON DELETE RESTRICT,
    CONSTRAINT fk_booking_port FOREIGN KEY (port_id) 
        REFERENCES charging_ports(port_id) ON DELETE RESTRICT,
    CONSTRAINT fk_booking_vehicle FOREIGN KEY (user_vehicle_id) 
        REFERENCES user_vehicles(user_vehicle_id) ON DELETE RESTRICT,
    CONSTRAINT fk_booking_slot FOREIGN KEY (slot_id) 
        REFERENCES time_slots(slot_id) ON DELETE RESTRICT,
    CONSTRAINT chk_charge_percentage CHECK (current_charge_percentage BETWEEN 0 AND 100),
    CONSTRAINT chk_target_percentage CHECK (target_charge_percentage BETWEEN 0 AND 100),
    CONSTRAINT chk_charge_logic CHECK (target_charge_percentage > current_charge_percentage),
    CONSTRAINT chk_time_logic CHECK (end_time > start_time),
    
    INDEX idx_user_booking (user_id),
    INDEX idx_station_booking (station_id),
    INDEX idx_booking_date (booking_date),
    INDEX idx_booking_status (booking_status),
    INDEX idx_port_booking (port_id, booking_date, start_time)
);

-- =====================================================
-- 11. PAYMENTS TABLE
-- Stores payment information for bookings
-- =====================================================
CREATE TABLE payments (
    payment_id INT PRIMARY KEY AUTO_INCREMENT,
    booking_id INT NOT NULL,
    user_id INT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    payment_type ENUM('CHARGING_FEE', 'CANCELLATION_FEE') DEFAULT 'CHARGING_FEE',
    payment_status ENUM('PENDING', 'COMPLETED', 'FAILED', 'REFUNDED') DEFAULT 'PENDING',
    payment_method VARCHAR(50), -- Credit Card, Debit Card, UPI, Wallet
    transaction_id VARCHAR(100) UNIQUE,
    payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_payment_booking FOREIGN KEY (booking_id) 
        REFERENCES bookings(booking_id) ON DELETE CASCADE,
    CONSTRAINT fk_payment_user FOREIGN KEY (user_id) 
        REFERENCES users(user_id) ON DELETE CASCADE,
    CONSTRAINT chk_amount CHECK (amount >= 0),
    
    INDEX idx_booking_payment (booking_id),
    INDEX idx_user_payment (user_id),
    INDEX idx_payment_status (payment_status),
    INDEX idx_transaction_id (transaction_id)
);

-- =====================================================
-- 12. SYSTEM SETTINGS TABLE
-- Stores global system configurations
-- =====================================================
CREATE TABLE system_settings (
    setting_id INT PRIMARY KEY AUTO_INCREMENT,
    setting_key VARCHAR(100) NOT NULL UNIQUE,
    setting_value TEXT NOT NULL,
    setting_type VARCHAR(50) DEFAULT 'STRING', -- STRING, NUMBER, BOOLEAN, JSON
    description TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_setting_key (setting_key)
);

-- =====================================================
-- 13. AUDIT LOG TABLE (Optional - for tracking changes)
-- Logs important system events and changes
-- =====================================================
CREATE TABLE audit_logs (
    log_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    action_type VARCHAR(100) NOT NULL, -- LOGIN, LOGOUT, BOOKING_CREATED, BOOKING_CANCELLED, etc.
    table_name VARCHAR(100),
    record_id INT,
    old_value TEXT,
    new_value TEXT,
    ip_address VARCHAR(45),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_audit_user FOREIGN KEY (user_id) 
        REFERENCES users(user_id) ON DELETE SET NULL,
    
    INDEX idx_user_audit (user_id),
    INDEX idx_action_type (action_type),
    INDEX idx_created_at (created_at)
);

-- =====================================================
-- TRIGGERS FOR BUSINESS LOGIC
-- =====================================================

-- Trigger: Prevent booking overlap on same port
DELIMITER //
CREATE TRIGGER trg_prevent_double_booking
BEFORE INSERT ON bookings
FOR EACH ROW
BEGIN
    DECLARE overlap_count INT;
    
    SELECT COUNT(*) INTO overlap_count
    FROM bookings
    WHERE port_id = NEW.port_id
      AND booking_date = NEW.booking_date
      AND booking_status IN ('CONFIRMED', 'IN_PROGRESS')
      AND (
          (NEW.start_time < end_time AND NEW.end_time > start_time)
      );
    
    IF overlap_count > 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Time slot already booked for this port';
    END IF;
END//
DELIMITER ;

-- Trigger: Calculate estimated energy and duration before booking
DELIMITER //
CREATE TRIGGER trg_calculate_charging_estimates
BEFORE INSERT ON bookings
FOR EACH ROW
BEGIN
    DECLARE battery_cap DECIMAL(6,2);
    DECLARE charge_rate DECIMAL(6,2);
    DECLARE efficiency DECIMAL(5,2);
    DECLARE energy_needed DECIMAL(8,2);
    DECLARE time_needed INT;
    
    -- Get vehicle specifications
    SELECT vm.battery_capacity_kwh, vm.charging_rate_kw, vm.charging_efficiency
    INTO battery_cap, charge_rate, efficiency
    FROM user_vehicles uv
    JOIN vehicle_models vm ON uv.model_id = vm.model_id
    WHERE uv.user_vehicle_id = NEW.user_vehicle_id;
    
    -- Calculate energy needed (kWh)
    SET energy_needed = (battery_cap * (NEW.target_charge_percentage - NEW.current_charge_percentage) / 100);
    
    -- Calculate charging time (minutes) considering efficiency
    SET time_needed = CEIL((energy_needed / charge_rate) * (100 / efficiency) * 60);
    
    SET NEW.estimated_energy_kwh = energy_needed;
    SET NEW.estimated_duration_minutes = time_needed;
END//
DELIMITER ;

-- Trigger: Auto-create audit log on booking cancellation
DELIMITER //
CREATE TRIGGER trg_log_booking_cancellation
AFTER UPDATE ON bookings
FOR EACH ROW
BEGIN
    IF NEW.booking_status = 'CANCELLED' AND OLD.booking_status != 'CANCELLED' THEN
        INSERT INTO audit_logs (user_id, action_type, table_name, record_id, old_value, new_value)
        VALUES (NEW.user_id, 'BOOKING_CANCELLED', 'bookings', NEW.booking_id, 
                OLD.booking_status, NEW.booking_status);
    END IF;
END//
DELIMITER ;

-- =====================================================
-- VIEWS FOR EASY QUERYING
-- =====================================================

-- View: Available stations with port counts
CREATE VIEW v_station_availability AS
SELECT 
    cs.station_id,
    cs.station_name,
    cs.address,
    cs.city,
    cs.total_ports,
    COUNT(cp.port_id) AS active_ports,
    SUM(CASE WHEN cp.is_available = TRUE THEN 1 ELSE 0 END) AS available_ports,
    cs.is_operational
FROM charging_stations cs
LEFT JOIN charging_ports cp ON cs.station_id = cp.station_id
WHERE cs.is_operational = TRUE
GROUP BY cs.station_id;

-- View: User booking history with vehicle details
CREATE VIEW v_user_booking_history AS
SELECT 
    b.booking_id,
    b.user_id,
    u.full_name,
    u.email,
    cs.station_name,
    cs.city,
    vm.make_id,
    vmk.make_name,
    vm.model_name,
    b.booking_date,
    b.start_time,
    b.end_time,
    b.estimated_energy_kwh,
    b.estimated_duration_minutes,
    b.booking_status,
    b.created_at
FROM bookings b
JOIN users u ON b.user_id = u.user_id
JOIN charging_stations cs ON b.station_id = cs.station_id
JOIN user_vehicles uv ON b.user_vehicle_id = uv.user_vehicle_id
JOIN vehicle_models vm ON uv.model_id = vm.model_id
JOIN vehicle_makes vmk ON vm.make_id = vmk.make_id
ORDER BY b.booking_date DESC, b.start_time DESC;

-- View: Active pricing by station
CREATE VIEW v_active_pricing AS
SELECT 
    p.pricing_id,
    COALESCE(cs.station_name, 'Default Pricing') AS station_name,
    p.station_id,
    p.price_per_kwh,
    p.price_per_hour,
    p.cancellation_fee,
    p.late_cancellation_fee,
    p.effective_from,
    p.effective_to
FROM pricing p
LEFT JOIN charging_stations cs ON p.station_id = cs.station_id
WHERE p.is_active = TRUE
  AND p.effective_from <= CURDATE()
  AND (p.effective_to IS NULL OR p.effective_to >= CURDATE());

-- =====================================================
-- INDEXES FOR PERFORMANCE OPTIMIZATION
-- =====================================================
-- Already included in table definitions above

-- =====================================================
-- CONSTRAINTS SUMMARY
-- =====================================================
-- 1. PRIMARY KEYS: Every table has a primary key for unique identification
-- 2. FOREIGN KEYS: All relationships properly enforced with CASCADE/RESTRICT
-- 3. UNIQUE CONSTRAINTS: Prevent duplicate entries (usernames, emails, etc.)
-- 4. CHECK CONSTRAINTS: Validate data ranges and business rules
-- 5. NOT NULL: Critical fields cannot be empty
-- 6. DEFAULT VALUES: Sensible defaults for optional fields
-- 7. INDEXES: Optimized query performance on frequently searched columns

-- =====================================================
-- END OF SCHEMA
-- =====================================================
