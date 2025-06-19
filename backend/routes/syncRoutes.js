// syncRoutes.js - Routes for handling cron time settings

const express = require('express');
const { getCronTime, updateCronTimeController } = require('../controllers/syncController');
const router = express.Router();

/**
 * @route GET /sync/cron-time
 * @desc Get the current cron schedule time.
 */
router.get('/cron-time', getCronTime);

/**
 * @route POST /sync/update-cron
 * @desc Update the cron schedule time.
 * @body { newCronTime: String }
 */
router.post('/update-cron', updateCronTimeController);

module.exports = router;
