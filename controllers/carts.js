const Cart = require('../models/cart');
const Product = require('../models/product');
const { ObjectId } = require('mongodb');
//0. Tạo giỏ hàng 
async function createCart(req, res) {
    const { userId } = req.body;

    // Kiểm tra nếu userId không hợp lệ
    if (!ObjectId.isValid(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
    }

    try {
        // Kiểm tra nếu giỏ hàng đã tồn tại
        const existingCart = await Cart.findOne({ _id: new ObjectId(userId) }); // Sử dụng `new ObjectId`
        if (existingCart) {
            return res.status(400).json({ message: "Cart already exists" });
        }

        // Tạo giỏ hàng mới
        const newCart = {
            _id: new ObjectId(userId), // Sử dụng `new ObjectId`
            items: [],
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        await Cart.insertOne(newCart); // Thay `create` bằng `insertOne` (đúng với MongoDB)
        res.status(201).json({ message: "Cart created successfully", cart: newCart });
    } catch (error) {
        console.error("Error creating cart:", error);
        res.status(500).json({ message: "Failed to create cart", error: error.message });
    }
}
//1. Lấy giỏ hàng theo userId
async function getCartByUserId(req, res) {
    const userId = req.params.userId;
     // Kiểm tra tính hợp lệ của userId
     if (!ObjectId.isValid(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
    }
    try {
        const cart = await Cart.findOne({ _id: new ObjectId(userId) });
        console.log("Cart found:", cart); // Log sản phẩm nếu tìm thấy
    
        if (!cart) {
          console.log("No cart found with the given ID");
          return res.status(404).json({ message: "Cart not found" });
        }
        // Lấy thông tin các sản phẩm trong giỏ hàng
        const productIds = cart.items.map(item => item.productId);
        const products = await Product.find({ _id: { $in: productIds } }).toArray();

        // Ghép thông tin sản phẩm vào các mặt hàng trong giỏ hàng
        const detailedItems = cart.items.map(item => {
            const product = products.find(p => p._id.toString() === item.productId.toString());
            return {
                productId: item.productId,
                title: product?.title || "Unknown Product",
                price: product?.price || 0,
                image: product?.image || "",
                quantity: item.quantity,
                total: (product?.price || 0) * item.quantity
            };
        });

        // Tính tổng giá trị giỏ hàng
        const totalPrice = detailedItems.reduce((sum, item) => sum + item.total, 0);

        // Trả về chi tiết giỏ hàng
        const detailedCart = {
            userId: cart.userId,
            items: detailedItems,
            totalPrice: totalPrice,
            createdAt: cart.createdAt,
            updatedAt: cart.updatedAt
        };

        res.status(200).json(detailedCart);
        
      } catch (error) {
        console.error("Error fetching cart:", error.message);
        res.status(500).json({ message: "Error fetching cart", error: error.message });
      }
  
}
//2. Lấy tất cả giỏ hàng
async function getAllCarts(req, res) {
    try {
      const carts = await Cart.find().toArray(); // Lấy tất cả giỏ hàng từ database
      res.status(200).json(carts); // Trả về danh sách giỏ hàng
    } catch (error) {
      console.error('Error fetching carts:', error);
      res.status(500).json({ message: 'Error fetching carts', error: error.message });
    }
  }

    // 3. Thêm sản phẩm vào giỏ hàng
    async function addToCart(req, res) {
        const { userId, productId, quantity } = req.body;

        // Kiểm tra đầu vào
        if (!userId || !ObjectId.isValid(productId) || quantity <= 0) {
            return res.status(400).json({ message: "Invalid userId, productId, or quantity" });
        }

        try {
            // Chuyển `productId` và `userId` sang ObjectId
            const productObjectId = new ObjectId(productId);
            const userObjectId = new ObjectId(userId);

            // Tìm giỏ hàng của người dùng
            const cart = await Cart.findOne({ _id: userObjectId });

            if (!cart) {
                return res.status(404).json({ message: "Cart not found." });
            }

            // Kiểm tra sản phẩm trong giỏ hàng
            const itemIndex = cart.items.findIndex(item => item.productId.equals(productObjectId));

            if (itemIndex > -1) {
                // Sản phẩm đã tồn tại -> Tăng số lượng
                await Cart.updateOne(
                    { _id: userObjectId, "items.productId": productObjectId },
                    {
                        $inc: { "items.$.quantity": quantity },
                        $set: { updatedAt: new Date() }
                    }
                );
            } else {
                // Sản phẩm chưa tồn tại -> Thêm mới
                await Cart.updateOne(
                    { _id: userObjectId },
                    {
                        $push: { items: { productId: productObjectId, quantity } },
                        $set: { updatedAt: new Date() }
                    }
                );
            }

            // Lấy lại giỏ hàng đã cập nhật
            const updatedCart = await Cart.findOne({ _id: userObjectId });

            res.status(200).json({ 
                success: true,
                message: "Product added to cart",
                cart: updatedCart });
        } catch (error) {
            console.error("Error adding to cart:", error);
            res.status(500).json({ 
                success: false,
                message: "Internal server error",
                error: error.message });
        }
    }

//5. Cập nhật số lượng sản phẩm trong giỏ hàng
async function updateCartItem(req, res) {
    const { userId, productId } = req.params;
    const { quantity } = req.body;

    // Kiểm tra ID hợp lệ   
    if (!ObjectId.isValid(userId) || !ObjectId.isValid(productId)) {
        return res.status(400).json({ message: "Invalid userId or productId" });
    }

    // Kiểm tra số lượng hợp lệ
    if (!Number.isInteger(quantity) || quantity <= 0) {
        return res.status(400).json({ message: "Quantity must be a positive integer" });
    }

    try {
        const userObjectId = new ObjectId(userId);
        const productObjectId = new ObjectId(productId);

        // Tìm giỏ hàng của người dùng
        const cart = await Cart.findOne({ _id: userObjectId });

        if (!cart) {
            return res.status(404).json({ message: "Cart not found for this user" });
        }

        // Tìm sản phẩm trong giỏ hàng
        const itemIndex = cart.items.findIndex(item => item.productId.equals(productObjectId));

        if (itemIndex === -1) {
            return res.status(404).json({ message: "Product not found in cart" });
        }

        // Cập nhật số lượng sản phẩm
        cart.items[itemIndex].quantity = quantity;

        // Lưu giỏ hàng sau khi cập nhật
        await Cart.updateOne(
            { _id: userObjectId },
            { $set: { items: cart.items, updatedAt: new Date() } }
        );

        res.status(200).json({ 
            success: true,
            message: "Cart item updated successfully",
             cart });
    } catch (error) {
        console.error("Error updating cart item:", error);
        res.status(500).json({ 
            success: false,
            message: "Internal server error",
             error: error.message });
    }
}

//6. Xóa sản phẩm khỏi giỏ hàng
async function removeCartItem(req, res) {
    const userId = req.params.userId;
    const productId = req.params.productId;

    // Kiểm tra ID hợp lệ
    if (!ObjectId.isValid(userId) || !ObjectId.isValid(productId)) {
        return res.status(400).json({ message: "Invalid userId or productId" });
    }

    try {
        const userObjectId = new ObjectId(userId);
        const productObjectId = new ObjectId(productId);

        // Tìm giỏ hàng của người dùng
        const cart = await Cart.findOne({ _id: userObjectId });

        if (!cart) {
            return res.status(404).json({ message: "Cart not found for this user" });
        }

        // Lọc bỏ sản phẩm khỏi giỏ hàng
        const updatedItems = cart.items.filter(item => !item.productId.equals(productObjectId));

        // Kiểm tra xem sản phẩm có trong giỏ hàng không
        if (updatedItems.length === cart.items.length) {
            return res.status(404).json({ message: "Product not found in cart" });
        }

        // Cập nhật giỏ hàng
        await Cart.updateOne(
            { _id: userObjectId },
            { $set: { items: updatedItems, updatedAt: new Date() } }
        );

        res.status(200).json({ message: "Product removed from cart successfully", cart: { ...cart, items: updatedItems } });
    } catch (error) {
        console.error("Error removing product from cart:", error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
}
//7. Xóa toàn bộ giỏ hàng
async function clearCart(req, res) {
    const userId = req.params.userId;

    // Kiểm tra ID hợp lệ
    if (!ObjectId.isValid(userId)) {
        return res.status(400).json({ message: "Invalid userId" });
    }

    try {
        const userObjectId = new ObjectId(userId);

        // Tìm giỏ hàng của người dùng
        const cart = await Cart.findOne({ _id: userObjectId });

        if (!cart) {
            return res.status(404).json({ message: "Cart not found for this user" });
        }

        // Xóa tất cả sản phẩm trong giỏ hàng
        await Cart.updateOne(
            { _id: userObjectId },
            { $set: { items: [], updatedAt: new Date() } }
        );

        res.status(200).json({ message: "Cart cleared successfully", cart: { ...cart, items: [] } });
    } catch (error) {
        console.error("Error clearing cart:", error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
}

module.exports = { createCart, clearCart, removeCartItem, updateCartItem, addToCart, getCartByUserId, getAllCarts };
