const Student = require('../models/Student');
const sendEmail = require('../utils/sendEmail');
const generateEmail = require('../utils/emailTemplate');
const cron = require('node-cron');

const checkInactiveStudents = async () => {
    try {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const inactiveStudents = await Student.find({
            lastActivityDate: { $lt: sevenDaysAgo },
            autoReminderEnabled: true
        });

        for (const student of inactiveStudents) {
            const emailContent = generateEmail(student);
            await sendEmail(
                student.email,
                'Time to get back to problem solving!',
                emailContent
            );

            student.remindersSent += 1;
            await student.save();
        }

        console.log('Reminder emails sent successfully.');
    } catch (err) {
        console.error('Error sending reminder emails:', err);
    }
};

cron.schedule('0 22 18 6 3', () => {
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
