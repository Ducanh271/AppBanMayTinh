const express = require('express');
const router = express.Router();
const {
  getAllProducts,
  getSingleProduct,
  addProduct,
  updateProduct,
  deleteProduct,
  getSortedProducts,
  getAllCategories,
  getProductsByCategory,
  searchProducts
} = require('../controllers/products');

// Định nghĩa route
router.get('/search', searchProducts); // Route tìm kiếm sản phẩm theo tên
router.get('/category/:categoryName', getProductsByCategory); // API lọc sản phẩm theo danh mục
router.get('/categories', getAllCategories); // Route để lấy tất cả danh mục
router.get('/sort', getSortedProducts); // API sắp xếp sản phẩm
router.get('/:id', getSingleProduct); // Lấy 1 sản phẩm
router.post('/', addProduct);         // Thêm sản phẩm
router.put('/:id', updateProduct);    // Cập nhật sản phẩm
router.delete('/:id', deleteProduct); // Xóa sản phẩm
router.get('/', getAllProducts);      // Lấy tất cả sản phẩm

module.exports = router;

