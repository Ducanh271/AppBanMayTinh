const bcrypt = require('bcrypt');

// Hàm mã hóa mật khẩu
const hashPassword = async (password) => {
    const saltRounds = 10; // Độ phức tạp mã hóa
    try {
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        return hashedPassword;
    } catch (error) {
        console.error("Error hashing password:", error);
        throw error;
    }
};

// Hàm kiểm tra mật khẩu
const comparePassword = async (plainPassword, hashedPassword) => {
    try {
        const isMatch = await bcrypt.compare(plainPassword, hashedPassword);
        return isMatch; // Trả về true nếu khớp
    } catch (error) {
        console.error("Error comparing password:", error);
        throw error;
    }
};

module.exports = { hashPassword, comparePassword };