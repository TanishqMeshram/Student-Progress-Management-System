// cron/studentSyncCron.js
const cron = require('node-cron');
const { syncStudentData } = require('../controllers/syncController');
const SyncSettings = require('../models/SyncSettings');

let cronJob = null;

// Start Cron Job Based on DB Cron Time
const startCronJob = async () => {
    const settings = await SyncSettings.findOne({ _id: 'syncSettings' });
    const cronTime = settings ? settings.cronTime : '6 19 17 6 2'; // Default: daily at midnight

    if (cronJob) {
        cronJob.stop();
    }

    cronJob = cron.schedule(cronTime, async () => {
        console.log('Running Codeforces data sync at', new Date());
        await syncStudentData();
    });

    console.log(`Cron job scheduled to run at: ${cronTime}`);
};

// Update Cron Time Dynamically
const updateCronTime = async (newCronTime) => {
    await SyncSettings.findOneAndUpdate(
        { _id: 'syncSettings' },
        { cronTime: newCronTime },
        { upsert: true, new: true }
    );
    await startCronJob(); // Restart with updated cron time
};

module.exports = { startCronJob, updateCronTime };