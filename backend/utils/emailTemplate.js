const generateEmail = (student) => {
    return `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
            <h2>Hello ${student.name},</h2>
            <p>We've noticed you haven't solved any problems in the last few days.</p>
            <p>This is a gentle reminder to get back to practicing and sharpening your skills!</p>
            <p>Keep going, your progress matters.</p>
            <br />
            <p>Happy Problem Solving!</p>
            <p>The Student Progress Team</p>
        </div>
    `;
};

module.exports = generateEmail;
