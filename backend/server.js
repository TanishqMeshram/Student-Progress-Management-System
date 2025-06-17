const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();
const { startCronJob } = require('./cron/studentSyncCron');
const syncRoutes = require('./routes/syncRoutes');
const studentRoutes = require('./routes/studentRoutes');
const cron = require('node-cron');
const checkInactiveStudents = require('./cron/emailCron');
require('dotenv').config();
require('./cron/emailCron'); // Add this at the top of your server.js to start the cron job


app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/students', studentRoutes);
app.use('/api/sync', syncRoutes);

cron.schedule('45 18 17 6 2', () => {
    console.log('Running inactivity check...');
    checkInactiveStudents();
});

// ┌───────────── minute (0 - 59)
// │ ┌───────────── hour (0 - 23)
// │ │ ┌───────────── day of the month (1 - 31)
// │ │ │ ┌───────────── month (1 - 12)
// │ │ │ │ ┌───────────── day of the week (0 - 6) (Sunday to Saturday)
// │ │ │ │ │
// * * * * * command to execute

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log('MongoDB connected');
        app.listen(process.env.PORT || 5000, () => console.log('Server running on port 5000'));
    })
    .catch(err => console.log(err));

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    startCronJob();
});
