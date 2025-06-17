// routes/syncRoutes.js
const express = require('express');
const { manualSync } = require('../controllers/syncController');
const { updateCronTime } = require('../cron/studentSyncCron');
const router = express.Router();

// Trigger Manual Sync
router.post('/manual-sync', manualSync);

// Update Cron Time
router.post('/update-cron', async (req, res) => {
    const { newCronTime } = req.body;

    if (!newCronTime) {
        return res.status(400).json({ message: 'Cron time is required' });
    }

    try {
        await updateCronTime(newCronTime);
        res.json({ message: 'Cron time updated successfully.' });
    } catch (err) {
        console.error('Error updating cron time:', err);
        res.status(500).json({ message: 'Failed to update cron time.' });
    }
});

module.exports = router;
