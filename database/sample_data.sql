-- =====================================================
-- FLUXORE - SAMPLE DATA
-- Populate database with realistic test data
-- =====================================================

USE fluxore_db;

-- =====================================================
-- 1. INSERT ROLES
-- =====================================================
INSERT INTO roles (role_name, description) VALUES
('ADMIN', 'System administrator with full access'),
('USER', 'Regular consumer who can book charging slots');

-- =====================================================
-- 2. INSERT USERS
-- Password: 'password123' (in real app, use bcrypt hash)
-- =====================================================
INSERT INTO users (role_id, username, email, password_hash, full_name, phone_number, address) VALUES
(1, 'admin', 'admin@fluxore.com', '$2b$10$rZ8qQXQf5Z.5Z8qQXQf5Z.5Z8qQXQf5Z.5Z8qQXQf5Z.5Z8qQX', 'System Administrator', '9876543210', 'Fluxore HQ, Bangalore'),
(2, 'john_doe', 'john@example.com', '$2b$10$rZ8qQXQf5Z.5Z8qQXQf5Z.5Z8qQXQf5Z.5Z8qQXQf5Z.5Z8qQX', 'John Doe', '9876543211', 'Koramangala, Bangalore'),
(2, 'jane_smith', 'jane@example.com', '$2b$10$rZ8qQXQf5Z.5Z8qQXQf5Z.5Z8qQXQf5Z.5Z8qQXQf5Z.5Z8qQX', 'Jane Smith', '9876543212', 'Indiranagar, Bangalore'),
(2, 'robert_king', 'robert@example.com', '$2b$10$rZ8qQXQf5Z.5Z8qQXQf5Z.5Z8qQXQf5Z.5Z8qQXQf5Z.5Z8qQX', 'Robert King', '9876543213', 'Whitefield, Bangalore'),
(2, 'emily_brown', 'emily@example.com', '$2b$10$rZ8qQXQf5Z.5Z8qQXQf5Z.5Z8qQXQf5Z.5Z8qQXQf5Z.5Z8qQX', 'Emily Brown', '9876543214', 'HSR Layout, Bangalore');

-- =====================================================
-- 3. INSERT VEHICLE MAKES
-- =====================================================
INSERT INTO vehicle_makes (make_name, country) VALUES
('Tesla', 'USA'),
('BYD', 'China'),
('Tata Motors', 'India'),
('MG Motor', 'UK/China'),
('Hyundai', 'South Korea'),
('Mahindra', 'India'),
('Nissan', 'Japan'),
('BMW', 'Germany'),
('Audi', 'Germany'),
('Rivian', 'USA');

-- =====================================================
-- 4. INSERT VEHICLE MODELS
-- =====================================================
INSERT INTO vehicle_models (make_id, model_name, battery_capacity_kwh, charging_rate_kw, charging_efficiency, year) VALUES
-- Tesla Models
(1, 'Model 3', 60.00, 250.00, 92.00, 2023),
(1, 'Model S', 100.00, 250.00, 93.00, 2023),
(1, 'Model X', 100.00, 250.00, 91.00, 2023),
(1, 'Model Y', 75.00, 250.00, 92.00, 2024),

-- BYD Models
(2, 'Atto 3', 60.48, 80.00, 88.00, 2023),
(2, 'e6', 71.70, 90.00, 87.00, 2022),

-- Tata Motors
(3, 'Nexon EV', 30.20, 50.00, 85.00, 2023),
(3, 'Tigor EV', 26.00, 50.00, 85.00, 2023),
(3, 'Tiago EV', 24.00, 50.00, 84.00, 2023),

-- MG Motor
(4, 'ZS EV', 50.30, 80.00, 87.00, 2023),
(4, 'Comet EV', 17.30, 25.00, 82.00, 2023),

-- Hyundai
(5, 'Kona Electric', 39.20, 100.00, 89.00, 2023),
(5, 'Ioniq 5', 72.60, 220.00, 91.00, 2024),

-- Mahindra
(6, 'e2o Plus', 15.90, 30.00, 80.00, 2020),
(6, 'XUV400 EV', 39.40, 50.00, 86.00, 2023),

-- Nissan
(7, 'Leaf', 40.00, 100.00, 88.00, 2023),

-- BMW
(8, 'iX', 111.50, 195.00, 92.00, 2024),
(8, 'i4', 83.90, 200.00, 93.00, 2024),

-- Audi
(9, 'e-tron GT', 93.40, 270.00, 94.00, 2024),

-- Rivian
(10, 'R1T', 135.00, 220.00, 90.00, 2024);

-- =====================================================
-- 5. INSERT USER VEHICLES
-- =====================================================
INSERT INTO user_vehicles (user_id, model_id, license_plate, is_primary) VALUES
(2, 7, 'KA01AB1234', TRUE),  -- John: Tata Nexon EV
(3, 1, 'KA02CD5678', TRUE),  -- Jane: Tesla Model 3
(4, 10, 'KA03EF9012', TRUE), -- Robert: MG ZS EV
(5, 12, 'KA04GH3456', TRUE); -- Emily: Hyundai Kona Electric

-- =====================================================
-- 6. INSERT CHARGING STATIONS
-- =====================================================
INSERT INTO charging_stations (station_name, address, city, state, pincode, latitude, longitude, total_ports, is_operational) VALUES
('Fluxore Koramangala Hub', '80 Feet Road, Koramangala 4th Block', 'Bangalore', 'Karnataka', '560034', 12.9352, 77.6245, 6, TRUE),
('Fluxore Indiranagar Station', '100 Feet Road, Indiranagar', 'Bangalore', 'Karnataka', '560038', 12.9716, 77.6412, 4, TRUE),
('Fluxore Whitefield Center', 'ITPL Main Road, Whitefield', 'Bangalore', 'Karnataka', '560066', 12.9698, 77.7500, 8, TRUE),
('Fluxore HSR Layout', 'Outer Ring Road, HSR Layout Sector 1', 'Bangalore', 'Karnataka', '560102', 12.9116, 77.6383, 5, TRUE),
('Fluxore Electronic City', 'Hosur Road, Electronic City Phase 1', 'Bangalore', 'Karnataka', '560100', 12.8456, 77.6603, 10, TRUE),
('Fluxore Airport Hub', 'Kempegowda International Airport', 'Bangalore', 'Karnataka', '560300', 13.1986, 77.7066, 12, TRUE);

-- =====================================================
-- 7. INSERT CHARGING PORTS
-- =====================================================
-- Koramangala (6 ports)
INSERT INTO charging_ports (station_id, port_number, port_type, max_power_kw, is_available) VALUES
(1, 1, 'CCS', 60.00, TRUE),
(1, 2, 'CCS', 60.00, TRUE),
(1, 3, 'Type 2', 50.00, TRUE),
(1, 4, 'Type 2', 50.00, TRUE),
(1, 5, 'CHAdeMO', 50.00, TRUE),
(1, 6, 'CCS', 150.00, TRUE);

-- Indiranagar (4 ports)
INSERT INTO charging_ports (station_id, port_number, port_type, max_power_kw, is_available) VALUES
(2, 1, 'Type 2', 50.00, TRUE),
(2, 2, 'Type 2', 50.00, TRUE),
(2, 3, 'CCS', 100.00, TRUE),
(2, 4, 'CCS', 100.00, TRUE);

-- Whitefield (8 ports)
INSERT INTO charging_ports (station_id, port_number, port_type, max_power_kw, is_available) VALUES
(3, 1, 'CCS', 150.00, TRUE),
(3, 2, 'CCS', 150.00, TRUE),
(3, 3, 'CCS', 60.00, TRUE),
(3, 4, 'CCS', 60.00, TRUE),
(3, 5, 'Type 2', 50.00, TRUE),
(3, 6, 'Type 2', 50.00, TRUE),
(3, 7, 'CHAdeMO', 50.00, TRUE),
(3, 8, 'CCS', 250.00, TRUE);

-- HSR Layout (5 ports)
INSERT INTO charging_ports (station_id, port_number, port_type, max_power_kw, is_available) VALUES
(4, 1, 'CCS', 60.00, TRUE),
(4, 2, 'CCS', 60.00, TRUE),
(4, 3, 'Type 2', 50.00, TRUE),
(4, 4, 'Type 2', 50.00, TRUE),
(4, 5, 'CCS', 100.00, TRUE);

-- Electronic City (10 ports)
INSERT INTO charging_ports (station_id, port_number, port_type, max_power_kw, is_available) VALUES
(5, 1, 'CCS', 150.00, TRUE),
(5, 2, 'CCS', 150.00, TRUE),
(5, 3, 'CCS', 150.00, TRUE),
(5, 4, 'CCS', 60.00, TRUE),
(5, 5, 'CCS', 60.00, TRUE),
(5, 6, 'Type 2', 50.00, TRUE),
(5, 7, 'Type 2', 50.00, TRUE),
(5, 8, 'Type 2', 50.00, TRUE),
(5, 9, 'CHAdeMO', 50.00, TRUE),
(5, 10, 'CCS', 250.00, TRUE);

-- Airport (12 ports)
INSERT INTO charging_ports (station_id, port_number, port_type, max_power_kw, is_available) VALUES
(6, 1, 'CCS', 250.00, TRUE),
(6, 2, 'CCS', 250.00, TRUE),
(6, 3, 'CCS', 150.00, TRUE),
(6, 4, 'CCS', 150.00, TRUE),
(6, 5, 'CCS', 150.00, TRUE),
(6, 6, 'CCS', 150.00, TRUE),
(6, 7, 'CCS', 60.00, TRUE),
(6, 8, 'CCS', 60.00, TRUE),
(6, 9, 'Type 2', 50.00, TRUE),
(6, 10, 'Type 2', 50.00, TRUE),
(6, 11, 'CHAdeMO', 50.00, TRUE),
(6, 12, 'CHAdeMO', 50.00, TRUE);

-- =====================================================
-- 8. INSERT PRICING
-- =====================================================
-- Default pricing (applies to all stations)
INSERT INTO pricing (station_id, price_per_kwh, price_per_hour, cancellation_fee, late_cancellation_fee, effective_from, effective_to, is_active) VALUES
(NULL, 0.00, 0.00, 0.00, 50.00, '2024-01-01', NULL, TRUE);

-- Optional: Station-specific pricing (if needed in future)
-- INSERT INTO pricing (station_id, price_per_kwh, price_per_hour, cancellation_fee, late_cancellation_fee, effective_from, effective_to, is_active) VALUES
-- (6, 12.00, 100.00, 20.00, 80.00, '2024-01-01', NULL, TRUE); -- Premium pricing for Airport

-- =====================================================
-- 9. INSERT TIME SLOTS
-- =====================================================
INSERT INTO time_slots (slot_duration_minutes) VALUES
(30),
(60),
(90),
(120);

-- =====================================================
-- 10. INSERT SAMPLE BOOKINGS
-- =====================================================
-- Past bookings (completed)
INSERT INTO bookings (user_id, station_id, port_id, user_vehicle_id, slot_id, booking_date, start_time, end_time, current_charge_percentage, target_charge_percentage, booking_status) VALUES
(2, 1, 1, 1, 2, '2024-01-15', '10:00:00', '11:00:00', 20.00, 80.00, 'COMPLETED'),
(3, 2, 11, 2, 2, '2024-01-16', '14:00:00', '15:00:00', 15.00, 85.00, 'COMPLETED'),
(4, 3, 18, 3, 3, '2024-01-17', '09:00:00', '10:30:00', 25.00, 90.00, 'COMPLETED');

-- Upcoming bookings (confirmed)
INSERT INTO bookings (user_id, station_id, port_id, user_vehicle_id, slot_id, booking_date, start_time, end_time, current_charge_percentage, target_charge_percentage, booking_status) VALUES
(2, 1, 2, 1, 2, DATE_ADD(CURDATE(), INTERVAL 1 DAY), '11:00:00', '12:00:00', 30.00, 80.00, 'CONFIRMED'),
(3, 3, 19, 2, 2, DATE_ADD(CURDATE(), INTERVAL 2 DAY), '15:00:00', '16:00:00', 20.00, 90.00, 'CONFIRMED'),
(5, 4, 28, 4, 2, DATE_ADD(CURDATE(), INTERVAL 1 DAY), '10:00:00', '11:00:00', 25.00, 85.00, 'CONFIRMED');

-- Cancelled booking
INSERT INTO bookings (user_id, station_id, port_id, user_vehicle_id, slot_id, booking_date, start_time, end_time, current_charge_percentage, target_charge_percentage, booking_status, cancellation_reason, cancelled_at) VALUES
(4, 2, 12, 3, 2, '2024-01-18', '16:00:00', '17:00:00', 20.00, 80.00, 'CANCELLED', 'Change of plans', '2024-01-17 10:30:00');

-- =====================================================
-- 11. INSERT PAYMENTS
-- =====================================================
INSERT INTO payments (booking_id, user_id, amount, payment_type, payment_status, payment_method, transaction_id) VALUES
(1, 2, 0.00, 'CHARGING_FEE', 'COMPLETED', 'UPI', 'TXN001234567890'),
(2, 3, 0.00, 'CHARGING_FEE', 'COMPLETED', 'Credit Card', 'TXN001234567891'),
(3, 4, 0.00, 'CHARGING_FEE', 'COMPLETED', 'Debit Card', 'TXN001234567892'),
(4, 2, 0.00, 'CHARGING_FEE', 'PENDING', 'UPI', 'TXN001234567893'),
(5, 3, 0.00, 'CHARGING_FEE', 'PENDING', 'Credit Card', 'TXN001234567894'),
(7, 4, 50.00, 'CANCELLATION_FEE', 'COMPLETED', 'Wallet', 'TXN001234567895');

-- =====================================================
-- 12. INSERT SYSTEM SETTINGS
-- =====================================================
INSERT INTO system_settings (setting_key, setting_value, setting_type, description) VALUES
('cancellation_hours_limit', '2', 'NUMBER', 'Minimum hours before booking to allow free cancellation'),
('default_slot_duration', '60', 'NUMBER', 'Default slot duration in minutes'),
('max_advance_booking_days', '30', 'NUMBER', 'Maximum days in advance for booking'),
('enable_email_notifications', 'true', 'BOOLEAN', 'Send email notifications to users'),
('enable_sms_notifications', 'false', 'BOOLEAN', 'Send SMS notifications to users'),
('maintenance_mode', 'false', 'BOOLEAN', 'Put system in maintenance mode'),
('support_email', 'support@fluxore.com', 'STRING', 'Customer support email'),
('support_phone', '1800-123-4567', 'STRING', 'Customer support phone number');

-- =====================================================
-- 13. INSERT AUDIT LOGS (Sample)
-- =====================================================
INSERT INTO audit_logs (user_id, action_type, table_name, record_id, old_value, new_value, ip_address) VALUES
(1, 'LOGIN', NULL, NULL, NULL, NULL, '192.168.1.100'),
(2, 'LOGIN', NULL, NULL, NULL, NULL, '192.168.1.101'),
(2, 'BOOKING_CREATED', 'bookings', 1, NULL, 'CONFIRMED', '192.168.1.101'),
(3, 'LOGIN', NULL, NULL, NULL, NULL, '192.168.1.102'),
(4, 'BOOKING_CANCELLED', 'bookings', 7, 'CONFIRMED', 'CANCELLED', '192.168.1.103');

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================
-- Check station availability
SELECT * FROM v_station_availability;

-- Check user bookings
SELECT * FROM v_user_booking_history LIMIT 10;

-- Check active pricing
SELECT * FROM v_active_pricing;

-- Total counts
SELECT 
    'Users' AS entity, COUNT(*) AS count FROM users
UNION ALL
SELECT 'Stations', COUNT(*) FROM charging_stations
UNION ALL
SELECT 'Ports', COUNT(*) FROM charging_ports
UNION ALL
SELECT 'Vehicle Makes', COUNT(*) FROM vehicle_makes
UNION ALL
SELECT 'Vehicle Models', COUNT(*) FROM vehicle_models
UNION ALL
SELECT 'Bookings', COUNT(*) FROM bookings
UNION ALL
SELECT 'Payments', COUNT(*) FROM payments;

-- =====================================================
-- END OF SAMPLE DATA
-- =====================================================
