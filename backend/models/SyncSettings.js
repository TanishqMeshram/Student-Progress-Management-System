const mongoose = require('mongoose');

/**
 * SyncSettings Schema
 * Stores cron time for student data sync.
 */
const syncSettingsSchema = new mongoose.Schema({
    _id: { type: String, default: 'syncSettings' },
    cronTime: { type: String, required: true }
});

module.exports = mongoose.model('SyncSettings', syncSettingsSchema);
