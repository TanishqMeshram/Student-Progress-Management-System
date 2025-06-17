const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  secure: true, 
  auth: {
    user: "tanishqmeshram88@gmail.com",
    pass: "fvhubdvgtpjfkdon",
  },
});

const sendEmail = async (to, subject, html) => {
    try {
        await transporter.sendMail({
            from: 'tanishqmeshram88@gmail.com',
            to,
            subject,
            html
        });
        console.log(`Email sent to ${to}`);
    } catch (err) {
        console.error(`Failed to send email to ${to}:`, err);
    }
};

module.exports = sendEmail;
