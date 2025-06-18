const SyncSettings = require('../models/SyncSettings');
const { updateCronJobTime } = require('../cron/studentSyncCron');

const getCronTime = async (req, res) => {
    try {
        const settings = await SyncSettings.findOne({ _id: 'syncSettings' });
        if (!settings) {
            return res.json({ cronTime: 'Not Set' });
        }
        res.json({ cronTime: settings.cronTime });
    } catch (err) {
        console.error('Error fetching cron time:', err);
        res.status(500).json({ message: 'Failed to fetch cron time.' });
    }
};

const updateCronTimeController = async (req, res) => {
    const { newCronTime } = req.body;

    if (!newCronTime) {
        return res.status(400).json({ message: 'Cron time is required' });
    }

    try {
        await updateCronJobTime(newCronTime);
        res.json({ message: 'Cron time updated successfully.' });
    } catch (err) {
        console.error('Error updating cron time:', err);
        res.status(500).json({ message: 'Failed to update cron time.' });
    }
};

module.exports = {
    getCronTime,
    updateCronTimeController
};