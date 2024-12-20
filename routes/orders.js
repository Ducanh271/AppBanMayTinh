const express = require('express');
const router = express.Router();
const {
    getAllOrders,
    createOrder,
    getOrdersByUserId,
    getOrderById,
    updateOrderStatus,
    deleteOrder,
} = require('../controllers/orders');

// Định nghĩa các route cho Orders
router.get('/', getAllOrders); // Lấy tất cả đơn hàng
router.post('/', createOrder); // Tạo đơn hàng
router.get('/user/:userId', getOrdersByUserId); // Lấy danh sách đơn hàng của một người dùng
router.get('/:id', getOrderById); // Lấy chi tiết đơn hàng theo ID
router.put('/:id', updateOrderStatus); // Cập nhật trạng thái đơn hàng
router.delete('/:id', deleteOrder); // Xóa đơn hàng

module.exports = router;
