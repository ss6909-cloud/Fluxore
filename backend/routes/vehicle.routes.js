const express = require('express');
const router = express.Router();
const { dbGet, dbAll, dbRun, dbBegin, dbCommit, dbRollback } = require('../config/database');

// Get all vehicle makes
router.get('/makes', async (req, res) => {
    try {
        const makes = await dbAll(`
            SELECT * FROM vehicle_makes ORDER BY make_name
        `);
        res.json(makes);
    } catch (error) {
        console.error('Error fetching makes:', error);
        res.status(500).json({ error: 'Failed to fetch vehicle makes' });
    }
});

// Get models by make
router.get('/makes/:makeId/models', async (req, res) => {
    try {
        const models = await dbAll(`
            SELECT vm.*, vmk.make_name
            FROM vehicle_models vm
            JOIN vehicle_makes vmk ON vm.make_id = vmk.make_id
            WHERE vm.make_id = ?
            ORDER BY vm.model_name, vm.year DESC
        `, [req.params.makeId]);

        res.json(models);
    } catch (error) {
        console.error('Error fetching models:', error);
        res.status(500).json({ error: 'Failed to fetch vehicle models' });
    }
});

// Get all vehicle models
router.get('/models', async (req, res) => {
    try {
        const models = await dbAll(`
            SELECT vm.*, vmk.make_name
            FROM vehicle_models vm
            JOIN vehicle_makes vmk ON vm.make_id = vmk.make_id
            ORDER BY vmk.make_name, vm.model_name
        `);
        res.json(models);
    } catch (error) {
        console.error('Error fetching models:', error);
        res.status(500).json({ error: 'Failed to fetch vehicle models' });
    }
});

// Get user's vehicles (requires authentication)
router.get('/user/:userId', async (req, res) => {
    try {
        const vehicles = await dbAll(`
            SELECT 
                uv.*,
                vm.model_name,
                vm.battery_capacity_kwh,
                vm.charging_rate_kw,
                vm.charging_efficiency,
                vmk.make_name
            FROM user_vehicles uv
            JOIN vehicle_models vm ON uv.model_id = vm.model_id
            JOIN vehicle_makes vmk ON vm.make_id = vmk.make_id
            WHERE uv.user_id = ?
        `, [req.params.userId]);

        res.json(vehicles);
    } catch (error) {
        console.error('Error fetching user vehicles:', error);
        res.status(500).json({ error: 'Failed to fetch user vehicles' });
    }
});

// Add vehicle to user account
router.post('/user/:userId', async (req, res) => {
    try {
        const { model_id, license_plate, is_primary } = req.body;
        const user_id = req.params.userId;

        if (!model_id) {
            return res.status(400).json({ error: 'Model ID required' });
        }

        // If setting as primary, unset other vehicles
        if (is_primary) {
            await dbRun(
                'UPDATE user_vehicles SET is_primary = 0 WHERE user_id = ?',
                [user_id]
            );
        }

        const result = await dbRun(`
            INSERT INTO user_vehicles (user_id, model_id, license_plate, is_primary)
            VALUES (?, ?, ?, ?)
        `, [user_id, model_id, license_plate || null, is_primary ? 1 : 0]);

        res.status(201).json({
            message: 'Vehicle added successfully',
            user_vehicle_id: result.lastID
        });
    } catch (error) {
        console.error('Error adding vehicle:', error);
        res.status(500).json({ error: 'Failed to add vehicle' });
    }
});

module.exports = router;
