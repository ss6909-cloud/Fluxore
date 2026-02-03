const express = require('express');
const router = express.Router();
const { dbGet, dbAll, dbRun, dbBegin, dbCommit, dbRollback } = require('../config/database');

// Get all charging stations
router.get('/', async (req, res) => {
    try {
        const stations = await dbAll(`
            SELECT 
                cs.*,
                COUNT(cp.port_id) AS active_ports,
                SUM(CASE WHEN cp.is_available = 1 THEN 1 ELSE 0 END) AS available_ports
            FROM charging_stations cs
            LEFT JOIN charging_ports cp ON cs.station_id = cp.station_id
            WHERE cs.is_operational = 1
            GROUP BY cs.station_id
        `);

        res.json(stations);
    } catch (error) {
        console.error('Error fetching stations:', error);
        res.status(500).json({ error: 'Failed to fetch stations' });
    }
});

// Get station by ID with ports
router.get('/:id', async (req, res) => {
    try {
        const stations = await dbAll(`
            SELECT * FROM charging_stations WHERE station_id = ?
        `, [req.params.id]);

        if (!stations || stations.length === 0) {
            return res.status(404).json({ error: 'Station not found' });
        }

        const ports = await dbAll(`
            SELECT * FROM charging_ports WHERE station_id = ?
        `, [req.params.id]);

        res.json({
            ...stations[0],
            ports
        });
    } catch (error) {
        console.error('Error fetching station:', error);
        res.status(500).json({ error: 'Failed to fetch station' });
    }
});

// Check available slots for a station on a date
router.get('/:id/availability', async (req, res) => {
    try {
        const { date } = req.query;
        
        if (!date) {
            return res.status(400).json({ error: 'Date parameter required' });
        }

        // Get all ports for the station
        const ports = await dbAll(`
            SELECT port_id, port_number, port_type, is_available
            FROM charging_ports 
            WHERE station_id = ? AND is_available = 1
        `, [req.params.id]);

        // Get booked slots for each port on that date
        const bookings = await dbAll(`
            SELECT port_id, start_time, end_time
            FROM bookings
            WHERE station_id = ? 
              AND booking_date = ?
              AND booking_status IN ('CONFIRMED', 'IN_PROGRESS')
        `, [req.params.id, date]);

        // Generate time slots (9 AM to 9 PM in 1-hour intervals)
        const timeSlots = [];
        for (let hour = 9; hour < 21; hour++) {
            timeSlots.push({
                start_time: `${String(hour).padStart(2, '0')}:00:00`,
                end_time: `${String(hour + 1).padStart(2, '0')}:00:00`
            });
        }

        // Check availability for each port and slot
        const availability = ports.map(port => {
            const portBookings = bookings.filter(b => b.port_id === port.port_id);
            
            const slots = timeSlots.map(slot => {
                const isBooked = portBookings.some(booking => {
                    return (slot.start_time < booking.end_time && 
                            slot.end_time > booking.start_time);
                });
                
                return {
                    ...slot,
                    available: !isBooked
                };
            });

            return {
                port_id: port.port_id,
                port_number: port.port_number,
                port_type: port.port_type,
                slots
            };
        });

        res.json({
            station_id: req.params.id,
            date,
            ports: availability
        });
    } catch (error) {
        console.error('Error checking availability:', error);
        res.status(500).json({ error: 'Failed to check availability' });
    }
});

module.exports = router;
