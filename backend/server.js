/**
 * Main Express server setup.
 * - Connects to MongoDB
 * - Registers middleware, routes, error handlers
 * - Starts cron jobs for data sync and email reminders
 */

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();
const { startCronJob } = require('./cron/studentSyncCron');
const syncRoutes = require('./routes/syncRoutes');
const studentRoutes = require('./routes/studentRoutes');
const errorHandler = require('./middlewares/errorHandler');
const notFound = require('./middlewares/notFound');
const logger = require('./middlewares/logger');
const { startEmailCron } = require('./cron/emailCron');
require('dotenv').config();

app.use(cors());
app.use(express.json());
app.use(logger);

// API Routes
app.use('/api/students', studentRoutes);
app.use('/api/sync', syncRoutes);

// 404 and error handlers
app.use(notFound);
app.use(errorHandler);

// Connect to MongoDB and start server
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log('MongoDB connected');
        const PORT = process.env.PORT || 5000;
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
            startCronJob();    // Start student data sync cron
            startEmailCron();  // Start email reminder cron
        });
    })
    .catch(err => console.log('MongoDB connection error:', err));
