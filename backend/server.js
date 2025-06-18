const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();
const { startCronJob } = require('./cron/studentSyncCron');
const syncRoutes = require('./routes/syncRoutes');
const studentRoutes = require('./routes/studentRoutes');
require('dotenv').config();
require('./cron/emailCron'); // Add this at the top of your server.js to start the cron job


app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/students', studentRoutes);
app.use('/api/sync', syncRoutes);

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
