/**
 * Controller for sync settings (cron time).
 */

const { isValidCron } = require('cron-validator');
const SyncSettings = require('../models/SyncSettings');
const { updateCronJobTime } = require('../cron/studentSyncCron');

/**
 * GET /api/sync/cron-time
 * Get the current cron time for student data sync.
 */
const getCronTime = async (req, res) => {
    try {
        const settings = await SyncSettings.findOne({ _id: 'syncSettings' });
        if (!settings) {
            return res.json({ cronTime: 'Not Set' });
        }
        res.json({ cronTime: settings.cronTime });
    } catch (err) {
        console.error('Error fetching cron time:', err);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch cron time.',
            error: { details: err.message }
        });
    }
};

/**
 * POST /api/sync/update-cron
 * Update the cron time for student data sync.
 * Body: { newCronTime }
 */
const updateCronTimeController = async (req, res) => {
    const { newCronTime } = req.body;

    if (!newCronTime) {
        return res.status(400).json({
            success: false,
            message: 'Cron time is required',
            error: {}
        });
    }

    if (!isValidCron(newCronTime, { seconds: false, allowBlankDay: true })) {
        return res.status(400).json({
            success: false,
            message: 'Invalid cron expression',
            error: {}
        });
    }

    try {
        await updateCronJobTime(newCronTime);
        res.json({ message: 'Cron time updated successfully.' });
    } catch (err) {
        console.error('Error updating cron time:', err);
        res.status(500).json({
            success: false,
            message: 'Failed to update cron time.',
            error: { details: err.message }
        });
    }
};

module.exports = {
    getCronTime,
    updateCronTimeController
};