// routes/syncRoutes.js
const express = require('express');
const { getCronTime, updateCronTimeController } = require('../controllers/syncController');
const router = express.Router();

router.get('/cron-time', getCronTime);
router.post('/update-cron', updateCronTimeController);

module.exports = router;
