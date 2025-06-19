/**
 * Cron job for sending inactivity reminder emails to students.
 * Runs at a schedule defined by EMAIL_CRON env or default.
 */

const Student = require('../models/Student');
const sendEmail = require('../utils/sendEmail');
const generateEmail = require('../utils/emailTemplate');
const cron = require('node-cron');

/**
 * Check for inactive students and send reminder emails.
 */
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
            await sendEmail({
                to: student.email,
                subject: 'Time to get back to problem solving!',
                html: emailContent
            });

            student.remindersSent += 1;
            await student.save();
        }

        console.log('Reminder emails sent successfully.');
    } catch (err) {
        console.error('Error sending reminder emails:', err);
    }
};

const emailCronTime = process.env.EMAIL_CRON || '0 8 * * 1';

/**
 * Start the email reminder cron job.
 */
const startEmailCron = () => {
    cron.schedule(emailCronTime, async () => {
        console.log('Running inactivity check...');
        await checkInactiveStudents();
    });
};

module.exports = { startEmailCron };
