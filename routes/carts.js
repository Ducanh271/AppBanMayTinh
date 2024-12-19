const express = require('express');
const router = express.Router();
const { 
    createCart,
    clearCart,
    removeCartItem,
    updateCartItem,
    addToCart,
    getCartByUserId,
    getAllCarts,
   
} = require('../controllers/carts');
router.get('/', getAllCarts); // API lấy tất cả giỏ hàng
// Route: Tạo giỏ hàng mới cho người dùng
router.post('/create', createCart);
// Route để lấy thêm hàng vào giỏ của người dùng
router.post('/add', addToCart);

router.get('/:userId', getCartByUserId);
// Route: Cập nhật số lượng sản phẩm trong giỏ hàng
router.put('/:userId/update-item/:productId', updateCartItem);
// Route: Xóa sản phẩm khỏi giỏ hàng
router.delete('/:userId/remove-item/:productId', removeCartItem);
// Route: Xóa toàn bộ giỏ hàng
router.delete('/:userId/clear', clearCart);

module.exports = router;
