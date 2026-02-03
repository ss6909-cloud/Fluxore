const express = require('express');
const router = express.Router();
const { dbGet, dbAll, dbRun, dbBegin, dbCommit, dbRollback } = require('../config/database');

// Process payment (dummy simulation)
router.post('/process', async (req, res) => {
    try {
        const {
            booking_id,
            payment_method,
            card_number,
            cvv,
            expiry
        } = req.body;

        if (!booking_id || !payment_method) {
            return res.status(400).json({ error: 'Missing required payment fields' });
        }

        await dbBegin();

        // Get pending payment for this booking
        const payments = await dbAll(`
            SELECT * FROM payments 
            WHERE booking_id = ? AND payment_status = 'PENDING'
            ORDER BY payment_id DESC LIMIT 1
        `, [booking_id]);

        if (!payments || payments.length === 0) {
            await dbRollback();
            return res.status(404).json({ error: 'No pending payment found' });
        }

        const payment = payments[0];

        // Simulate payment processing
        // In real app, integrate with payment gateway
        const transaction_id = `TXN${Date.now()}${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

        // Update payment status
        await dbRun(`
            UPDATE payments
            SET payment_status = 'COMPLETED',
                payment_method = ?,
                transaction_id = ?,
                payment_date = datetime('now')
            WHERE payment_id = ?
        `, [payment_method, transaction_id, payment.payment_id]);

        // If it's a charging fee, update booking status
        if (payment.payment_type === 'CHARGING_FEE') {
            await dbRun(`
                UPDATE bookings
                SET booking_status = 'CONFIRMED'
                WHERE booking_id = ?
            `, [booking_id]);
        }

        await dbCommit();

        res.json({
            message: 'Payment processed successfully',
            transaction_id,
            amount: payment.amount,
            status: 'COMPLETED'
        });

    } catch (error) {
        await dbRollback();
        console.error('Payment error:', error);
        res.status(500).json({ error: 'Payment processing failed' });
    }
});

// Get payment details
router.get('/booking/:bookingId', async (req, res) => {
    try {
        const payments = await dbAll(`
            SELECT 
                p.*,
                b.booking_date,
                b.start_time,
                cs.station_name,
                u.full_name,
                u.email
            FROM payments p
            JOIN bookings b ON p.booking_id = b.booking_id
            JOIN charging_stations cs ON b.station_id = cs.station_id
            JOIN users u ON p.user_id = u.user_id
            WHERE p.booking_id = ?
            ORDER BY p.payment_id DESC
        `, [req.params.bookingId]);

        if (!payments || payments.length === 0) {
            return res.status(404).json({ error: 'No payments found' });
        }

        res.json(payments);
    } catch (error) {
        console.error('Error fetching payments:', error);
        res.status(500).json({ error: 'Failed to fetch payment details' });
    }
});

// Get user payment history
router.get('/user/:userId', async (req, res) => {
    try {
        const payments = await dbAll(`
            SELECT 
                p.*,
                b.booking_date,
                cs.station_name
            FROM payments p
            JOIN bookings b ON p.booking_id = b.booking_id
            JOIN charging_stations cs ON b.station_id = cs.station_id
            WHERE p.user_id = ?
            ORDER BY p.payment_date DESC
        `, [req.params.userId]);

        res.json(payments);
    } catch (error) {
        console.error('Error fetching payment history:', error);
        res.status(500).json({ error: 'Failed to fetch payment history' });
    }
});

module.exports = router;
