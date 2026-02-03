const express = require('express');
const router = express.Router();
const { dbGet, dbAll, dbRun, dbBegin, dbCommit, dbRollback } = require('../config/database');

// Get all bookings (admin only)
router.get('/bookings', async (req, res) => {
    try {
        const bookings = await dbAll(`
            SELECT * FROM v_user_booking_history LIMIT 100
        `);
        res.json(bookings);
    } catch (error) {
        console.error('Error fetching bookings:', error);
        res.status(500).json({ error: 'Failed to fetch bookings' });
    }
});

// Add charging station
router.post('/stations', async (req, res) => {
    try {
        const {
            station_name,
            address,
            city,
            state,
            pincode,
            latitude,
            longitude,
            total_ports
        } = req.body;

        if (!station_name || !address || !city || !total_ports) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        await dbBegin();

        // Insert station
        const result = await dbRun(`
            INSERT INTO charging_stations 
            (station_name, address, city, state, pincode, latitude, longitude, total_ports)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `, [station_name, address, city, state, pincode, latitude, longitude, total_ports]);

        const station_id = result.lastID;

        // Create ports for the station
        for (let i = 1; i <= total_ports; i++) {
            await dbRun(`
                INSERT INTO charging_ports (station_id, port_number, port_type, max_power_kw)
                VALUES (?, ?, 'Type 2', 50.00)
            `, [station_id, i]);
        }

        await dbCommit();

        res.status(201).json({
            message: 'Station created successfully',
            station_id
        });

    } catch (error) {
        await dbRollback();
        console.error('Error creating station:', error);
        res.status(500).json({ error: 'Failed to create station' });
    }
});

// Update station
router.put('/stations/:id', async (req, res) => {
    try {
        const { station_name, address, city, state, pincode, is_operational } = req.body;
        
        await dbRun(`
            UPDATE charging_stations
            SET station_name = COALESCE(?, station_name),
                address = COALESCE(?, address),
                city = COALESCE(?, city),
                state = COALESCE(?, state),
                pincode = COALESCE(?, pincode),
                is_operational = COALESCE(?, is_operational)
            WHERE station_id = ?
        `, [station_name, address, city, state, pincode, is_operational, req.params.id]);

        res.json({ message: 'Station updated successfully' });
    } catch (error) {
        console.error('Error updating station:', error);
        res.status(500).json({ error: 'Failed to update station' });
    }
});

// Delete station
router.delete('/stations/:id', async (req, res) => {
    try {
        await dbRun(`
            DELETE FROM charging_stations WHERE station_id = ?
        `, [req.params.id]);

        res.json({ message: 'Station deleted successfully' });
    } catch (error) {
        console.error('Error deleting station:', error);
        res.status(500).json({ error: 'Failed to delete station' });
    }
});

// Add vehicle make
router.post('/vehicle-makes', async (req, res) => {
    try {
        const { make_name, country } = req.body;

        if (!make_name) {
            return res.status(400).json({ error: 'Make name required' });
        }

        const result = await dbRun(`
            INSERT INTO vehicle_makes (make_name, country) VALUES (?, ?)
        `, [make_name, country]);

        res.status(201).json({
            message: 'Vehicle make added successfully',
            make_id: result.lastID
        });
    } catch (error) {
        console.error('Error adding vehicle make:', error);
        res.status(500).json({ error: 'Failed to add vehicle make' });
    }
});

// Add vehicle model
router.post('/vehicle-models', async (req, res) => {
    try {
        const {
            make_id,
            model_name,
            battery_capacity_kwh,
            charging_rate_kw,
            charging_efficiency,
            year
        } = req.body;

        if (!make_id || !model_name || !battery_capacity_kwh || !charging_rate_kw) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const result = await dbRun(`
            INSERT INTO vehicle_models 
            (make_id, model_name, battery_capacity_kwh, charging_rate_kw, charging_efficiency, year)
            VALUES (?, ?, ?, ?, ?, ?)
        `, [make_id, model_name, battery_capacity_kwh, charging_rate_kw, charging_efficiency || 90, year]);

        res.status(201).json({
            message: 'Vehicle model added successfully',
            model_id: result.lastID
        });
    } catch (error) {
        console.error('Error adding vehicle model:', error);
        res.status(500).json({ error: 'Failed to add vehicle model' });
    }
});

// Update pricing
router.post('/pricing', async (req, res) => {
    try {
        const {
            station_id,
            price_per_kwh,
            price_per_hour,
            cancellation_fee,
            late_cancellation_fee,
            effective_from
        } = req.body;

        // Deactivate old pricing for the station
        if (station_id) {
            await dbRun(`
                UPDATE pricing SET is_active = 0 
                WHERE station_id = ? AND is_active = 1
            `, [station_id]);
        } else {
            await dbRun(`
                UPDATE pricing SET is_active = 0 
                WHERE station_id IS NULL AND is_active = 1
            `);
        }

        // Insert new pricing
        const result = await dbRun(`
            INSERT INTO pricing 
            (station_id, price_per_kwh, price_per_hour, cancellation_fee, late_cancellation_fee, effective_from)
            VALUES (?, ?, ?, ?, ?, ?)
        `, [
            station_id || null,
            price_per_kwh || 0,
            price_per_hour || 0,
            cancellation_fee || 0,
            late_cancellation_fee || 50,
            effective_from || new Date().toISOString().split('T')[0]
        ]);

        res.status(201).json({
            message: 'Pricing updated successfully',
            pricing_id: result.lastID
        });
    } catch (error) {
        console.error('Error updating pricing:', error);
        res.status(500).json({ error: 'Failed to update pricing' });
    }
});

// Get system settings
router.get('/settings', async (req, res) => {
    try {
        const settings = await dbAll(`
            SELECT * FROM system_settings
        `);
        res.json(settings);
    } catch (error) {
        console.error('Error fetching settings:', error);
        res.status(500).json({ error: 'Failed to fetch settings' });
    }
});

// Update system setting
router.put('/settings/:key', async (req, res) => {
    try {
        const { setting_value } = req.body;

        await dbRun(`
            UPDATE system_settings 
            SET setting_value = ?
            WHERE setting_key = ?
        `, [setting_value, req.params.key]);

        res.json({ message: 'Setting updated successfully' });
    } catch (error) {
        console.error('Error updating setting:', error);
        res.status(500).json({ error: 'Failed to update setting' });
    }
});

// Dashboard stats
router.get('/dashboard/stats', async (req, res) => {
    try {
        const stats = await dbAll(`
            SELECT 
                (SELECT COUNT(*) FROM users WHERE role_id = (SELECT role_id FROM roles WHERE role_name = 'USER')) as total_users,
                (SELECT COUNT(*) FROM charging_stations WHERE is_operational = 1) as total_stations,
                (SELECT COUNT(*) FROM charging_ports WHERE is_available = 1) as available_ports,
                (SELECT COUNT(*) FROM bookings WHERE booking_status = 'CONFIRMED') as active_bookings,
                (SELECT COUNT(*) FROM bookings WHERE booking_date = date('now')) as today_bookings,
                (SELECT SUM(amount) FROM payments WHERE payment_status = 'COMPLETED') as total_revenue
        `);

        res.json(stats && stats.length > 0 ? stats[0] : {});
    } catch (error) {
        console.error('Error fetching stats:', error);
        res.status(500).json({ error: 'Failed to fetch dashboard stats' });
    }
});

module.exports = router;
