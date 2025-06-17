// models/SyncSettings.js
const mongoose = require('mongoose');

const syncSettingsSchema = new mongoose.Schema({
    _id: { type: String, default: 'syncSettings' },
    cronTime: { type: String, required: true }
});

module.exports = mongoose.model('SyncSettings', syncSettingsSchema);
