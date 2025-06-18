const generateEmail = (student) => {
    return `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; background: linear-gradient(135deg, #e0f2fe 0%, #f0fdf4 100%); padding: 32px 0; min-height: 100vh;">
            <div style="max-width: 480px; margin: 0 auto; background: #fff; border-radius: 18px; box-shadow: 0 4px 24px rgba(0,0,0,0.07); padding: 32px 28px;">
                <div style="text-align: center; margin-bottom: 24px;">
                    <img src="https://cdn-icons-png.flaticon.com/512/3135/3135768.png" alt="Student Icon" width="64" height="64" style="border-radius: 50%; background: #e0f2fe; padding: 8px;"/>
                </div>
                <h2 style="color: #2563eb; font-size: 1.7rem; margin-bottom: 8px; margin-top: 0;">Hello ${student.name},</h2>
                <p style="color: #334155; font-size: 1.08rem; margin-bottom: 18px;">
                    <strong>We noticed you haven't solved any problems in the last few days.</strong>
                </p>
                <div style="background: #f0fdf4; border-left: 4px solid #22c55e; padding: 16px 18px; border-radius: 8px; margin-bottom: 18px;">
                    <p style="color: #166534; font-size: 1rem; margin: 0;">
                        This is a gentle reminder to get back to practicing and sharpening your skills!
                    </p>
                </div>
                <p style="color: #64748b; font-size: 1rem; margin-bottom: 24px;">
                    Keep going, your progress matters. Every problem you solve brings you closer to your goals!
                </p>
                <div style="text-align: center; margin-bottom: 24px;">
                    <a href="https://codeforces.com/" style="display: inline-block; background: linear-gradient(90deg, #2563eb 0%, #22d3ee 100%); color: #fff; text-decoration: none; padding: 12px 28px; border-radius: 8px; font-weight: 600; font-size: 1rem; box-shadow: 0 2px 8px rgba(34, 211, 238, 0.08); transition: background 0.2s;">
                        Practice Now
                    </a>
                </div>
                <p style="color: #334155; font-size: 1rem; margin-bottom: 0;">Happy Problem Solving!<br/>
                <span style="color: #22c55e; font-weight: bold;">The Student Progress Team</span></p>
            </div>
            <div style="text-align: center; color: #94a3b8; font-size: 0.9rem; margin-top: 32px;">
                &copy; ${new Date().getFullYear()} Student Progress Management System
            </div>
        </div>
    `;
};

module.exports = generateEmail;