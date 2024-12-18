const express = require('express');
const router = express.Router();
const { 
    calculateCartTotal,
    clearCart,
    removeCartItem,
    updateCartItem,
    addToCart,
    getCartById,
    getCartByUserId,
    getAllCarts,
   
} = require('../controllers/carts');

// Route để lấy giỏ hàng của người dùng
router.post('/add', addToCart);
router.get('/:id', getCartById);
router.get('/:userId', getCartByUserId);
router.get('/', getAllCarts); // API lấy tất cả giỏ hàng
// Route: Cập nhật số lượng sản phẩm trong giỏ hàng
router.put('/:userId/update-item', updateCartItem);
// Route: Xóa sản phẩm khỏi giỏ hàng
router.delete('/:userId/remove-item/:productId', removeCartItem);
// Route: Xóa toàn bộ giỏ hàng
router.delete('/:userId/clear', clearCart);
// Route: Tính tổng giá trị giỏ hàng
router.get('/:userId/total', calculateCartTotal);
module.exports = router;
