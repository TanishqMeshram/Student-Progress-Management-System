/**
 * Cron job for syncing student data from Codeforces.
 * Uses cron time from SyncSettings in DB or default from env.
 */

const cron = require('node-cron');
const { syncStudentData } = require('../utils/syncStudentData');
const SyncSettings = require('../models/SyncSettings');

let cronJob = null;

const getDefaultCronTime = () => process.env.STUDENT_SYNC_CRON || '0 0 * * *';

/**
 * Start or restart the student data sync cron job.
 */
const startCronJob = async () => {
    let cronTime = getDefaultCronTime();
    const settings = await SyncSettings.findOne({ _id: 'syncSettings' });
    if (settings && settings.cronTime) {
        cronTime = settings.cronTime;
    }

    if (cronJob) {
        cronJob.stop();
    }

    cronJob = cron.schedule(cronTime, async () => {
        console.log('Running Codeforces data sync at', new Date());
        await syncStudentData();
    });

    console.log(`Cron job scheduled to run at: ${cronTime}`);
};

/**
 * Update the cron job time and restart the job.
 * @param {string} newCronTime
 */
const updateCronJobTime = async (newCronTime) => {
    await SyncSettings.findOneAndUpdate(
        { _id: 'syncSettings' },
        { cronTime: newCronTime },
        { upsert: true, new: true }
    );
    await startCronJob();
};

module.exports = {
    startCronJob,
    updateCronJobTime
};