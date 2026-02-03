const express = require('express');
const router = express.Router();
const { dbGet, dbAll, dbRun, dbBegin, dbCommit, dbRollback } = require('../config/database');

// Create new booking
router.post('/', async (req, res) => {
    try {
        const {
            user_id,
            station_id,
            port_id,
            user_vehicle_id,
            slot_id,
            booking_date,
            start_time,
            end_time,
            current_charge_percentage,
            target_charge_percentage
        } = req.body;

        // Validate required fields
        if (!user_id || !station_id || !port_id || !user_vehicle_id || !booking_date || !start_time || !end_time) {
            return res.status(400).json({ error: 'Missing required booking fields' });
        }

        // Start transaction
        await dbBegin();

        // Check if slot is available (trigger will also check, but good to verify first)
        const existingBookings = await dbAll(`
            SELECT booking_id FROM bookings
            WHERE port_id = ? 
              AND booking_date = ?
              AND booking_status IN ('CONFIRMED', 'IN_PROGRESS')
              AND (? < end_time AND ? > start_time)
        `, [port_id, booking_date, start_time, end_time]);

        if (existingBookings && existingBookings.length > 0) {
            await dbRollback();
            return res.status(400).json({ error: 'Time slot already booked' });
        }

        // Insert booking (trigger will calculate estimates)
        const result = await dbRun(`
            INSERT INTO bookings (
                user_id, station_id, port_id, user_vehicle_id, slot_id,
                booking_date, start_time, end_time,
                current_charge_percentage, target_charge_percentage
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            user_id, station_id, port_id, user_vehicle_id, slot_id || 2,
            booking_date, start_time, end_time,
            current_charge_percentage || 20, target_charge_percentage || 80
        ]);

        const booking_id = result.lastID;

        // Get active pricing
        const pricing = await dbAll(`
            SELECT * FROM v_active_pricing 
            WHERE station_id = ? OR station_id IS NULL
            ORDER BY station_id DESC LIMIT 1
        `, [station_id]);

        const price = pricing && pricing.length > 0 ? pricing[0].price_per_kwh : 0;

        // Create payment record
        await dbRun(`
            INSERT INTO payments (booking_id, user_id, amount, payment_type, payment_status)
            VALUES (?, ?, ?, 'CHARGING_FEE', 'PENDING')
        `, [booking_id, user_id, price]);

        // Create audit log
        await dbRun(`
            INSERT INTO audit_logs (user_id, action_type, table_name, record_id, new_value)
            VALUES (?, 'BOOKING_CREATED', 'bookings', ?, 'CONFIRMED')
        `, [user_id, booking_id]);

        await dbCommit();

        // Fetch the created booking with details
        const bookingDetails = await dbAll(`
            SELECT 
                b.*,
                cs.station_name,
                cp.port_number,
                vm.model_name,
                vmk.make_name
            FROM bookings b
            JOIN charging_stations cs ON b.station_id = cs.station_id
            JOIN charging_ports cp ON b.port_id = cp.port_id
            JOIN user_vehicles uv ON b.user_vehicle_id = uv.user_vehicle_id
            JOIN vehicle_models vm ON uv.model_id = vm.model_id
            JOIN vehicle_makes vmk ON vm.make_id = vmk.make_id
            WHERE b.booking_id = ?
        `, [booking_id]);

        res.status(201).json({
            message: 'Booking created successfully',
            booking: bookingDetails && bookingDetails.length > 0 ? bookingDetails[0] : null
        });

    } catch (error) {
        await dbRollback();
        console.error('Booking error:', error);
        res.status(500).json({ error: error.message || 'Failed to create booking' });
    }
});

// Get user bookings
router.get('/user/:userId', async (req, res) => {
    try {
        const { status } = req.query;
        
        let query = `
            SELECT 
                b.*,
                cs.station_name,
                cs.address,
                cs.city,
                cp.port_number,
                cp.port_type,
                vm.model_name,
                vmk.make_name,
                p.amount AS payment_amount,
                p.payment_status
            FROM bookings b
            JOIN charging_stations cs ON b.station_id = cs.station_id
            JOIN charging_ports cp ON b.port_id = cp.port_id
            JOIN user_vehicles uv ON b.user_vehicle_id = uv.user_vehicle_id
            JOIN vehicle_models vm ON uv.model_id = vm.model_id
            JOIN vehicle_makes vmk ON vm.make_id = vmk.make_id
            LEFT JOIN payments p ON b.booking_id = p.booking_id
            WHERE b.user_id = ?
        `;

        const params = [req.params.userId];

        if (status) {
            query += ' AND b.booking_status = ?';
            params.push(status);
        }

        query += ' ORDER BY b.booking_date DESC, b.start_time DESC';

        const bookings = await dbAll(query, params);
        res.json(bookings);

    } catch (error) {
        console.error('Error fetching bookings:', error);
        res.status(500).json({ error: 'Failed to fetch bookings' });
    }
});

// Get booking by ID
router.get('/:id', async (req, res) => {
    try {
        const bookings = await dbAll(`
            SELECT 
                b.*,
                cs.station_name,
                cs.address,
                cp.port_number,
                vm.model_name,
                vmk.make_name
            FROM bookings b
            JOIN charging_stations cs ON b.station_id = cs.station_id
            JOIN charging_ports cp ON b.port_id = cp.port_id
            JOIN user_vehicles uv ON b.user_vehicle_id = uv.user_vehicle_id
            JOIN vehicle_models vm ON uv.model_id = vm.model_id
            JOIN vehicle_makes vmk ON vm.make_id = vmk.make_id
            WHERE b.booking_id = ?
        `, [req.params.id]);

        if (!bookings || bookings.length === 0) {
            return res.status(404).json({ error: 'Booking not found' });
        }

        res.json(bookings[0]);
    } catch (error) {
        console.error('Error fetching booking:', error);
        res.status(500).json({ error: 'Failed to fetch booking' });
    }
});

// Cancel booking
router.put('/:id/cancel', async (req, res) => {
    try {
        const { cancellation_reason, user_id } = req.body;
        const booking_id = req.params.id;

        await dbBegin();

        // Get booking details
        const bookings = await dbAll(`
            SELECT * FROM bookings WHERE booking_id = ?
        `, [booking_id]);

        if (!bookings || bookings.length === 0) {
            await dbRollback();
            return res.status(404).json({ error: 'Booking not found' });
        }

        const booking = bookings[0];

        if (booking.booking_status === 'CANCELLED') {
            await dbRollback();
            return res.status(400).json({ error: 'Booking already cancelled' });
        }

        if (booking.booking_status === 'COMPLETED') {
            await dbRollback();
            return res.status(400).json({ error: 'Cannot cancel completed booking' });
        }

        // Check if cancellation is within 2 hours
        const bookingDateTime = new Date(`${booking.booking_date} ${booking.start_time}`);
        const now = new Date();
        const hoursDifference = (bookingDateTime - now) / (1000 * 60 * 60);

        let cancellationFee = 0;

        if (hoursDifference < 2 && hoursDifference > 0) {
            // Get late cancellation fee
            const pricing = await dbAll(`
                SELECT late_cancellation_fee FROM v_active_pricing 
                WHERE station_id = ? OR station_id IS NULL
                ORDER BY station_id DESC LIMIT 1
            `, [booking.station_id]);

            cancellationFee = pricing && pricing.length > 0 ? pricing[0].late_cancellation_fee : 50;

            // Create cancellation fee payment
            await dbRun(`
                INSERT INTO payments (booking_id, user_id, amount, payment_type, payment_status)
                VALUES (?, ?, ?, 'CANCELLATION_FEE', 'PENDING')
            `, [booking_id, user_id, cancellationFee]);
        }

        // Update booking status
        await dbRun(`
            UPDATE bookings 
            SET booking_status = 'CANCELLED',
                cancellation_reason = ?,
                cancelled_at = datetime('now')
            WHERE booking_id = ?
        `, [cancellation_reason || 'User cancelled', booking_id]);

        await dbCommit();

        res.json({
            message: 'Booking cancelled successfully',
            cancellation_fee: cancellationFee
        });

    } catch (error) {
        await dbRollback();
        console.error('Cancellation error:', error);
        res.status(500).json({ error: 'Failed to cancel booking' });
    }
});

module.exports = router;
