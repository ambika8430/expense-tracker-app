const Sib = require('sib-api-v3-sdk');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const { User } = require('../models/association');
require('dotenv').config();

const client = Sib.ApiClient.instance;
const apiKey = client.authentications['api-key'];
apiKey.apiKey = process.env.MAIL_KEY;

const tranEmailApi = new Sib.TransactionalEmailsApi();

const sender = { email: 'grey.4e2@gmail.com', name:'expense-tracker' };

exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        // Check if user exists
        const user = await User.findOne({ where: { email } });
        if (!user) return res.status(404).json({ message: 'User not found' });

        // Generate reset token
        const resetToken = crypto.randomBytes(32).toString('hex');

        // Hash the token
        const hashedToken = await bcrypt.hash(resetToken, 10);

        // Set token and expiration (1-hour validity)
        user.resetToken = hashedToken;
        user.resetTokenExpires = new Date(Date.now() + 3600000);
        await user.save();

        const resetLink = `http://localhost:3001/reset-password.html?token=${resetToken}&email=${email}`;

        // Send email
        const emailData = await tranEmailApi.sendTransacEmail({
            sender,
            to: [{ email }],
            subject: 'Password Reset Request',
            textContent: `Click the link below to reset your password. This link will expire in 1 hour.\n\n${resetLink}`,
            htmlContent: `<p><a href="${resetLink}">click here</a> to reset your password. This link will expire in 1 hour.</p>`,
        });


        console.log(emailData)

        res.json({ message: 'Password reset email sent.' });

    } catch (error) {
        console.error('Error sending reset email:', error);
        res.status(500).json({ success: false, message: error });
    }
};

exports.resetPassword = async (req, res) => {
    try {
        const { email, token, newPassword } = req.body;

        console.log(email, token, newPassword)

        // Check if user exists
        const user = await User.findOne({ where: { email } });
        if (!user) return res.status(404).json({ message: 'User not found' });

        // Check if the reset token exists and is valid
        const isTokenValid = await bcrypt.compare(token, user.resetToken);
        if (!isTokenValid) {
            return res.status(400).json({ message: 'Invalid or expired token' });
        }

        // Hash and update the password
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        user.resetToken = null; // Remove the token after successful reset

        await user.save();

        res.status(200).json({ success: true, message: 'Password changed successfully' });

    } catch (error) {
        console.error('Error in resetPassword:', error);
        res.status(500).json({ message: 'Something went wrong.' });
    }
};
