// routes/syncRoutes.js
const express = require('express');
const { manualSync } = require('../controllers/syncController');
const { updateCronTime } = require('../cron/studentSyncCron');
const router = express.Router();
const SyncSettings = require('../models/SyncSettings');

router.get('/cron-time', async (req, res) => {
    try {
        const settings = await SyncSettings.findOne({ _id: 'syncSettings' });
        if (!settings) {
            return res.json({ cronTime: 'Not Set' });
        }
        console.log("settings: ", settings);
        res.json({ cronTime: settings.cronTime });
    } catch (err) {
        console.error('Error fetching cron time:', err);
        res.status(500).json({ message: 'Failed to fetch cron time.' });
    }
});


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
