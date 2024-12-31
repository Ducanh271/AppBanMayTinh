const Product = require('../models/product');
const { ObjectId } = require('mongodb');

// 1. Hàm lấy tất cả sản phẩm
async function getAllProducts(req, res) {
    // Lấy các tham số `page` và `limit` từ query string
    const { page = 1, limit = 10 } = req.query; // Mặc định: page = 1, limit = 10
    const skip = (page - 1) * limit; // Tính số bản ghi cần bỏ qua
  
    try {
      // Lấy sản phẩm với phân trang
      const products = await Product.find()
        .skip(parseInt(skip)) // Bỏ qua số bản ghi
        .limit(parseInt(limit)) // Giới hạn số bản ghi trả về
        .toArray();
  
      // Đếm tổng số sản phẩm
      const totalProducts = await Product.countDocuments();
  
      // Trả về dữ liệu
      res.json({
        total: totalProducts, // Tổng số sản phẩm
        page: parseInt(page), // Trang hiện tại
        limit: parseInt(limit), // Số sản phẩm mỗi trang
        products // Dữ liệu sản phẩm
      });
    } catch (error) {
      console.error("Error fetching products:", error);
      res.status(500).json({ message: "Error fetching products", error: error.message });
    }
  }
//2. hàm lấy 1 sản phẩm theo id
async function getSingleProduct(req, res) {
  const productId = req.params.id;
  console.log("Product ID received:", productId); // Log ID từ request

  if (!ObjectId.isValid(productId)) {
    console.log("Invalid ID format");
    return res.status(400).json({ message: "Invalid product ID" });
  }

  try {
    const product = await Product.findOne({ _id: new ObjectId(productId) });
    console.log("Product found:", product); // Log sản phẩm nếu tìm thấy

    if (!product) {
      console.log("No product found with the given ID");
      return res.status(404).json({ message: "Product not found" });
    }

    res.json(product);
  } catch (error) {
    console.error("Error fetching product:", error.message);
    res.status(500).json({ message: "Error fetching product", error: error.message });
  }
}

//3.  Thêm sản phẩm mới
async function addProduct(req, res) {
    try {
        const newProduct = req.body;
        const result = await Product.insertOne(newProduct);
        res.status(201).json({ id: result.insertedId });
    } catch (error) {
        res.status(500).json({ message: "Error adding product", error });
    }
}

//4. Cập nhật sản phẩm
async function updateProduct(req, res) {
    try {
        const id = req.params.id;
        const updates = req.body;
        const result = await Product.updateOne(
            { _id: new ObjectId(id) },
            { $set: updates }
        );
        res.json({ modifiedCount: result.modifiedCount });
    } catch (error) {
        res.status(500).json({ message: "Error updating product", error });
    }
}

//5. Xóa sản phẩm
async function deleteProduct(req, res) {
    try {
        const id = req.params.id;
        const result = await Product.deleteOne({ _id: new ObjectId(id) });
        res.json({ deletedCount: result.deletedCount });
    } catch (error) {
        res.status(500).json({ message: "Error deleting product", error });
    }
}
// 6. Sắp xếp sản phẩm
async function getSortedProducts(req, res) {
  const { sort = "price", order = "asc" } = req.query; // Mặc định sắp xếp theo giá tăng dần
  const sortOrder = order === "desc" ? -1 : 1; // Xác định thứ tự sắp xếp (1 = tăng dần, -1 = giảm dần)

  try {
    // Kiểm tra trường sắp xếp hợp lệ
    const validFields = ["price", "title", "rating", "category"]; // Các trường được phép sắp xếp
    if (!validFields.includes(sort)) {
      return res.status(400).json({ message: `Invalid sort field: ${sort}` });
    }

    // Truy vấn dữ liệu với sắp xếp
    const products = await Product.find()
      .sort({ [sort]: sortOrder }) // Sắp xếp dựa trên trường và thứ tự
      .toArray();

    // Trả về kết quả
    res.json(products);
  } catch (error) {
    console.error("Error sorting products:", error);
    res.status(500).json({ message: "Error sorting products", error: error.message });
  }
}
//7. Lấy danh sách mặt hàng
async function getAllCategories(req, res) {
  try {
    // Lấy danh mục duy nhất từ collection
    const categories = await Product.distinct("category"); // "category" là trường chứa danh mục

    // Trả về danh sách các danh mục
    res.json(categories);
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).json({ message: "Error fetching categories", error: error.message });
  }
}

//8. Lọc sản phẩm theo danh mục
async function getProductsByCategory(req, res) {
  const { categoryName } = req.params; // Lấy tên danh mục từ URL

  try {
    // Tìm sản phẩm với điều kiện phân biệt chữ hoa/chữ thường (không phân biệt)
    const products = await Product.find({
      category: { $regex: new RegExp(categoryName, "i") } // "i" là cờ không phân biệt chữ hoa/chữ thường
    }).toArray();

    // Kiểm tra nếu không có sản phẩm
    if (products.length === 0) {
      return res.status(404).json({ message: "No products found in this category" });
    }

    // Trả về danh sách sản phẩm
    res.json({
      total: products.length, // Tổng số sản phẩm trong danh mục
      products // Dữ liệu sản phẩm
    });
  } catch (error) {
    console.error("Error fetching products by category:", error);
    res.status(500).json({ message: "Error fetching products by category", error: error.message });
  }
}
//9. tìm kiếm sản phẩm theo từ khóa
async function searchProducts(req, res) {
  const { query } = req.query; // Lấy từ khóa từ query string
  const { page = 1, limit = 10 } = req.query; // Phân trang
  const skip = (page - 1) * limit;

  try {
    if (!query) {
      return res.status(400).json({ message: "Search query cannot be empty" });
    }

    // Tìm sản phẩm theo từ khóa
    const products = await Product.find({
      title: { $regex: query, $options: "i" } // Không phân biệt hoa/thường
    })
      .skip(parseInt(skip))
      .limit(parseInt(limit))
      .toArray();

    const totalProducts = await Product.countDocuments({
      title: { $regex: query, $options: "i" }
    });

    res.json({
      total: totalProducts,
      page: parseInt(page),
      limit: parseInt(limit),
      products,
    });
  } catch (error) {
    console.error("Error searching products:", error);
    res.status(500).json({ message: "Error searching products", error: error.message });
  }
}



module.exports = { searchProducts ,getProductsByCategory,getAllCategories,getAllProducts, getSingleProduct, addProduct, updateProduct, deleteProduct, getSortedProducts };
