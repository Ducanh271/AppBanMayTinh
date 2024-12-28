const express = require('express');
const router = express.Router();
const { 
    requestPasswordReset,
    resetPassword
} = require('../controllers/passwordReset');

const {
    deleteUserById,
    updateUserById,
    getUsersWithSort,
    getUsersWithLimit,
    getAllUsers,
    userLogin,
    addUser,
    getUserById
} = require('../controllers/users');


// Nhóm route liên quan đến quên mật khẩu
router.post('/request-password-reset', requestPasswordReset); // Gửi yêu cầu đặt lại mật khẩu
router.post('/reset-password', resetPassword); // Đặt lại mật khẩu

// Nhóm route liên quan đến quản lý người dùng
// Route: Đăng nhập người dùng
router.post('/login', userLogin);
// Route: Thêm người dùng mới
router.post('/', addUser);
// Route: Lấy tất cả người dùng
router.get('/', getAllUsers);
// Route: Lấy danh sách người dùng với giới hạn
router.get('/limit', getUsersWithLimit);
// Route: Lấy danh sách người dùng có sắp xếp
router.get('/sort', getUsersWithSort);
// Route: Cập nhật thông tin người dùng
router.put('/:id', updateUserById);
// Route: Xóa người dùng theo ID
router.delete('/:id', deleteUserById);
// Route: Lấy thông tin người dùng theo ID
router.get('/:id', getUserById);


module.exports = router;
