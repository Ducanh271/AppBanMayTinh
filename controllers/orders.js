const Order = require('../models/order');
const { ObjectId } = require('mongodb');
const Product = require('../models/product');
// 1. Tạo đơn hàng mới
async function createOrder(req, res) {
    const { userId, items, address, phoneNumber } = req.body;

    // Hàm kiểm tra định dạng số điện thoại
    function validatePhoneNumber(phoneNumber) {
        const phoneRegex = /^[0-9]{10,15}$/; // Chỉ chấp nhận 10-15 chữ số
        return phoneRegex.test(phoneNumber);
    }

    // Kiểm tra đầu vào
    if (!userId || !items || items.length === 0 || !phoneNumber) {
        return res.status(400).json({ message: "Invalid input" });
    }

    // Kiểm tra định dạng số điện thoại
    if (!validatePhoneNumber(phoneNumber)) {
        return res.status(400).json({ message: "Invalid phone number format" });
    }

    try {
        // Chuyển userId sang ObjectId
        const userObjectId = new ObjectId(userId);

        // Lấy thông tin sản phẩm từ database
        const productIds = items.map(item => new ObjectId(item.productId));
        const products = await Product.find({ _id: { $in: productIds } }).toArray();

        // Kiểm tra nếu có sản phẩm không tồn tại
        if (products.length !== items.length) {
            return res.status(400).json({ message: "Some products do not exist." });
        }

        // Tính tổng giá trị đơn hàng và định dạng items
        let total = 0;
        const formattedItems = items.map(item => {
            const product = products.find(p => p._id.toString() === item.productId);
            const itemTotal = product.price * item.quantity;
            total += itemTotal;

            return {
                productId: new ObjectId(item.productId),
                quantity: item.quantity,
                price: product.price, // Lưu giá tại thời điểm tạo đơn hàng
                total: itemTotal // Tổng giá trị cho từng sản phẩm
            };
        });

        // Tạo document cho đơn hàng
        const newOrder = {
            userId: userObjectId,
            items: formattedItems,
            address,
            phoneNumber, // Thêm số điện thoại
            status: 'pending', // Trạng thái đơn hàng ban đầu
            total, // Tổng giá trị đơn hàng
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        // Lưu vào collection "orders"
        const result = await Order.insertOne(newOrder);

        res.status(201).json({ 
            message: "Order created successfully", 
            orderId: result.insertedId,
            total // Trả về tổng giá trị đơn hàng
        });
    } catch (error) {
        console.error("Error creating order:", error);
        res.status(500).json({ message: "Error creating order", error: error.message });
    }
}


// 2. Lấy danh sách đơn hàng của một người dùng
async function getOrdersByUserId(req, res) {
    const userId = req.params.userId;

    if (!ObjectId.isValid(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
    }

    try {
        const orders = await Order.find({ userId: new ObjectId(userId) }).toArray();
        res.status(200).json(orders);
    } catch (error) {
        console.error("Error fetching orders:", error);
        res.status(500).json({ message: "Error fetching orders", error: error.message });
    }
}

// 3. Lấy chi tiết một đơn hàng
async function getOrderById(req, res) {
    const orderId = req.params.id;

    if (!ObjectId.isValid(orderId)) {
        return res.status(400).json({ message: "Invalid order ID" });
    }

    try {
        // Lấy đơn hàng từ collection orders
        const order = await Order.findOne({ _id: new ObjectId(orderId) });
        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        // Truy vấn thông tin sản phẩm từ collection products
        const productIds = order.items.map(item => item.productId);
        const products = await Product.find({ _id: { $in: productIds } }).toArray();

        // Ghép thông tin sản phẩm vào items
        const detailedItems = order.items.map(item => {
            const product = products.find(p => p._id.toString() === item.productId.toString());
            return {
                productId: item.productId,
                title: product?.title || "Unknown Product", // Lấy title từ products
                price: product?.price || 0, // Lấy price từ products
                quantity: item.quantity,
                total: (product?.price || 0) * item.quantity // Tính tổng cho từng sản phẩm
            };
        });

        // Chuẩn bị phản hồi chi tiết đơn hàng
        const detailedOrder = {
            _id: order._id,
            userId: order.userId,
            items: detailedItems,
            address: order.address,
            totalPrice: detailedItems.reduce((sum, item) => sum + item.total, 0), // Tính tổng giá trị đơn hàng
            status: order.status,
            createdAt: order.createdAt,
            updatedAt: order.updatedAt
        };

        res.status(200).json(detailedOrder);
    } catch (error) {
        console.error("Error fetching order:", error);
        res.status(500).json({ message: "Error fetching order", error: error.message });
    }
}
// 4. Cập nhật trạng thái đơn hàng
async function updateOrderStatus(req, res) {
    const orderId = req.params.id;
    const { status } = req.body;

    if (!ObjectId.isValid(orderId) || !status) {
        return res.status(400).json({ message: "Invalid input" });
    }

    try {
        const result = await Order.updateOne(
            { _id: new ObjectId(orderId) },
            { $set: { status, updatedAt: new Date() } }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({ message: "Order not found" });
        }

        res.status(200).json({ message: "Order updated successfully" });
    } catch (error) {
        console.error("Error updating order:", error);
        res.status(500).json({ message: "Error updating order", error: error.message });
    }
}

// 5. Xóa đơn hàng
async function deleteOrder(req, res) {
    const orderId = req.params.id;

    if (!ObjectId.isValid(orderId)) {
        return res.status(400).json({ message: "Invalid order ID" });
    }

    try {
        const result = await Order.deleteOne({ _id: new ObjectId(orderId) });

        if (result.deletedCount === 0) {
            return res.status(404).json({ message: "Order not found" });
        }

        res.status(200).json({ message: "Order deleted successfully" });
    } catch (error) {
        console.error("Error deleting order:", error);
        res.status(500).json({ message: "Error deleting order", error: error.message });
    }
}
//6. API: Lấy tất cả đơn hàng
async function getAllOrders(req, res) {
    try {
        // Lấy tất cả đơn hàng từ collection "orders"
        const orders = await Order.find().toArray();

        // Kiểm tra nếu không có đơn hàng
        if (orders.length === 0) {
            return res.status(404).json({ message: "No orders found" });
        }

        // Trả về danh sách đơn hàng
        res.status(200).json(orders);
    } catch (error) {
        console.error("Error fetching orders:", error);
        res.status(500).json({ message: "Error fetching orders", error: error.message });
    }
}

module.exports = { getAllOrders, createOrder, getOrdersByUserId, getOrderById, updateOrderStatus, deleteOrder };
