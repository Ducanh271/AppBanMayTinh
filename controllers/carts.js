const Cart = require('../models/cart');
const Product = require('../models/product');
const { ObjectId } = require('mongodb');

//1. Lấy giỏ hàng theo userId
async function getCartByUserId(req, res) {
    const userId = req.params.userId;

    // Kiểm tra ID hợp lệ
    if (!ObjectId.isValid(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
    }

    try {
        // Truy vấn giỏ hàng
        const cart = await Cart.findOne({ userId: new ObjectId(userId) });

        if (!cart) {
            return res.status(404).json({ message: "Cart not found" });
        }

        res.status(200).json(cart);
    } catch (error) {
        console.error("Error fetching cart:", error);
        res.status(500).json({ message: "Internal server error", error: error.message });
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
//3. Lấy 1 giỏ hàng theo Id của giỏ hàng
async function getCartById(req, res) {
  const cartId = req.params.id;

  // Kiểm tra ID có hợp lệ không
  if (!ObjectId.isValid(cartId)) {
      return res.status(400).json({ message: "Invalid cart ID" });
  }

  try {
      // Tìm giỏ hàng trong database
      const cart = await Cart.findOne({ _id: new ObjectId(cartId) });
      
      if (!cart) {
          return res.status(404).json({ message: "Cart not found" });
      }
      
      res.json(cart);
  } catch (error) {
      console.error("Error fetching cart:", error);
      res.status(500).json({ message: "Error fetching cart", error: error.message });
  }
}

//4. Thêm sản phẩm vào giỏ hàng
async function addToCart(req, res) {
    const { userId, productId, quantity } = req.body;

    // Kiểm tra ID hợp lệ
    if (!ObjectId.isValid(userId) || !ObjectId.isValid(productId)) {
        return res.status(400).json({ message: "Invalid userId or productId" });
    }

    try {
        // Tìm giỏ hàng của người dùng
        let cart = await Cart.findOne({ userId: new ObjectId(userId) });

        if (!cart) {
            // Nếu giỏ hàng chưa tồn tại, tạo mới
            cart = {
                userId: new ObjectId(userId),
                items: [{ productId: new ObjectId(productId), quantity: quantity }],
                createdAt: new Date()
            };
            await Cart.insertOne(cart);
        } else {
            // Nếu giỏ hàng đã tồn tại
            const itemIndex = cart.items.findIndex(item => item.productId.equals(new ObjectId(productId)));

            if (itemIndex > -1) {
                // Nếu sản phẩm đã có trong giỏ hàng, cập nhật số lượng
                cart.items[itemIndex].quantity += quantity;
            } else {
                // Nếu sản phẩm chưa có, thêm mới vào giỏ hàng
                cart.items.push({ productId: new ObjectId(productId), quantity: quantity });
            }

            // Cập nhật giỏ hàng trong database
            await Cart.updateOne(
                { userId: new ObjectId(userId) },
                { $set: { items: cart.items, updatedAt: new Date() } }
            );
        }

        res.status(200).json({ message: "Product added to cart successfully", cart });
    } catch (error) {
        console.error("Error adding to cart:", error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
}
//5. Cập nhật số lượng sản phẩm trong giỏ hàng
async function updateCartItem(req, res) {
    const userId = req.params.userId;
    const { productId, quantity } = req.body;

    // Kiểm tra ID hợp lệ
    if (!ObjectId.isValid(userId) || !ObjectId.isValid(productId)) {
        return res.status(400).json({ message: "Invalid userId or productId" });
    }

    if (quantity <= 0) {
        return res.status(400).json({ message: "Quantity must be greater than zero" });
    }

    try {
        // Tìm giỏ hàng của người dùng
        const cart = await Cart.findOne({ userId: new ObjectId(userId) });

        if (!cart) {
            return res.status(404).json({ message: "Cart not found for this user" });
        }

        // Tìm sản phẩm trong giỏ hàng
        const itemIndex = cart.items.findIndex(item => item.productId.equals(new ObjectId(productId)));

        if (itemIndex === -1) {
            return res.status(404).json({ message: "Product not found in cart" });
        }

        // Cập nhật số lượng sản phẩm
        cart.items[itemIndex].quantity = quantity;

        // Lưu giỏ hàng sau khi cập nhật
        await Cart.updateOne(
            { userId: new ObjectId(userId) },
            { $set: { items: cart.items, updatedAt: new Date() } }
        );

        res.status(200).json({ message: "Cart item updated successfully", cart });
    } catch (error) {
        console.error("Error updating cart item:", error);
        res.status(500).json({ message: "Internal server error", error: error.message });
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
        // Tìm giỏ hàng của người dùng
        const cart = await Cart.findOne({ userId: new ObjectId(userId) });

        if (!cart) {
            return res.status(404).json({ message: "Cart not found for this user" });
        }

        // Tìm sản phẩm trong giỏ hàng
        const itemIndex = cart.items.findIndex(item => item.productId.equals(new ObjectId(productId)));

        if (itemIndex === -1) {
            return res.status(404).json({ message: "Product not found in cart" });
        }

        // Xóa sản phẩm khỏi giỏ hàng
        cart.items.splice(itemIndex, 1);

        // Cập nhật giỏ hàng trong database
        await Cart.updateOne(
            { userId: new ObjectId(userId) },
            { $set: { items: cart.items, updatedAt: new Date() } }
        );

        res.status(200).json({ message: "Product removed from cart successfully", cart });
    } catch (error) {
        console.error("Error removing cart item:", error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
}
//7. Xóa toàn bộ giỏ hàng
async function clearCart(req, res) {
    const userId = req.params.userId;

    // Kiểm tra ID hợp lệ
    if (!ObjectId.isValid(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
    }

    try {
        // Tìm giỏ hàng của người dùng
        const cart = await Cart.findOne({ userId: new ObjectId(userId) });

        if (!cart) {
            return res.status(404).json({ message: "Cart not found for this user" });
        }

        // Xóa toàn bộ sản phẩm trong giỏ hàng
        cart.items = [];

        // Cập nhật giỏ hàng trong database
        await Cart.updateOne(
            { userId: new ObjectId(userId) },
            { $set: { items: cart.items, updatedAt: new Date() } }
        );

        res.status(200).json({ message: "Cart cleared successfully", cart });
    } catch (error) {
        console.error("Error clearing cart:", error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
}
//8. Tính tổng giá trị giỏ hàng
async function calculateCartTotal(req, res) {
    const userId = req.params.userId;

    // Kiểm tra ID hợp lệ
    if (!ObjectId.isValid(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
    }

    try {
        // Tìm giỏ hàng của người dùng
        const cart = await Cart.findOne({ userId: new ObjectId(userId) });

        if (!cart || cart.items.length === 0) {
            return res.status(404).json({ message: "Cart is empty or not found" });
        }

        let total = 0;

        // Tính tổng giá trị giỏ hàng
        for (const item of cart.items) {
            // Lấy thông tin sản phẩm từ database
            const product = await Product.findOne({ _id: new ObjectId(item.productId) });

            if (!product) {
                return res.status(404).json({ message: `Product with ID ${item.productId} not found` });
            }

            total += product.price * item.quantity;
        }

        res.status(200).json({ message: "Cart total calculated successfully", total });
    } catch (error) {
        console.error("Error calculating cart total:", error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
}


module.exports = { calculateCartTotal, clearCart, removeCartItem, updateCartItem, addToCart, getCartById, getCartByUserId, getAllCarts };
