const crypto = require('crypto');
const nodemailer = require('nodemailer');
const { hashPassword } = require('../utils/hash'); // Import hàm mã hóa
const User = require('../models/user'); // Import model người dùng

// API yêu cầu đặt lại mật khẩu
async function requestPasswordReset(req, res) {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ message: "Email is required" });
    }

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Tạo token reset và thời gian hết hạn
        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetTokenExpiry = Date.now() + 3600000; // 1 giờ

        // Cập nhật thông tin vào cơ sở dữ liệu
        await User.updateOne(
            { _id: user._id },
            { $set: { resetToken, resetTokenExpiry } }
        );

        // Thiết lập email gửi token
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'your-email@example.com',
                pass: 'your-email-password',
            },
        });

        const mailOptions = {
            from: 'your-email@example.com',
            to: email,
            subject: 'Password Reset Request',
            html: `
                <p>You requested a password reset</p>
                <p>Click this <a href="http://your-frontend-url/reset-password/${resetToken}">link</a> to reset your password.</p>
            `,
        };

        // Gửi email
        await transporter.sendMail(mailOptions);

        res.status(200).json({ message: "Password reset email sent" });
    } catch (error) {
        console.error("Error during password reset request:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

// API đặt lại mật khẩu
async function resetPassword(req, res) {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
        return res.status(400).json({ message: "Token and new password are required" });
    }

    try {
        // Tìm người dùng dựa trên token và kiểm tra hạn
        const user = await User.findOne({
            resetToken: token,
            resetTokenExpiry: { $gt: Date.now() }, // Token còn hạn
        });

        if (!user) {
            return res.status(400).json({ message: "Invalid or expired token" });
        }

        // Mã hóa mật khẩu mới
        const hashedPassword = await hashPassword(newPassword);

        // Cập nhật mật khẩu mới và xóa token
        await User.updateOne(
            { _id: user._id },
            {
                $set: { password: hashedPassword },
                $unset: { resetToken: "", resetTokenExpiry: "" },
            }
        );

        res.status(200).json({ message: "Password reset successfully" });
    } catch (error) {
        console.error("Error during password reset:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

module.exports = { requestPasswordReset, resetPassword };
