const Student = require('../models/Student');
const sendEmail = require('../utils/sendEmail');
const generateEmail = require('../utils/emailTemplate');

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

module.exports = checkInactiveStudents;
