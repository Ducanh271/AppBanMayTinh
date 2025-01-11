const User = require('../models/user');
const Cart = require('../models/cart');
const { ObjectId } = require('mongodb');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const { hashPassword, comparePassword } = require('../utils/hash'); // Import từ hash.js
//0. Thêm admin
// Hàm thêm admin mới
async function addAdmin(req, res) {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ message: "Name, email, and password are required" });
    }

    try {
        // Kiểm tra email đã tồn tại hay chưa
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "Email already exists" });
        }
        // Mã hóa mật khẩu
        const hashedPassword = await hashPassword(password);

        // Tạo admin mới
        const newAdmin = {
            name,
            email,
            password: hashedPassword,
            role: "admin", // Vai trò admin
            createdAt: new Date(),
        };

        const result = await User.insertOne(newAdmin);
        res.status(201).json({
            message: "Admin created successfully",
            adminId: result.insertedId,
        });
    } catch (error) {
        console.error("Error creating admin:", error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
}
//1. Thêm người dùng mới
async function addUser(req, res) {
    const { name, email, password} = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ message: "Name, email, and password are required" });
    }

    try {
        // Kiểm tra email đã tồn tại hay chưa
        const existingUser = await User.findOne({ email: email });
        if (existingUser) {
            return res.status(400).json({ message: "Email already exists" });
        }

        // Mã hóa mật khẩu bằng hàm từ hash.js
        const hashedPassword = await hashPassword(password);
        // Tạo người dùng mới
        const newUser = {
            name: name,
            email: email,
            password: hashedPassword, // Lưu mật khẩu đã mã hóa
            role: "user",
            createdAt: new Date(),
        };

        const result = await User.insertOne(newUser);
        res.status(201).json({ 
            message: "User created successfully",
            userId: result.insertedId });
    } catch (error) {
        console.error("Error creating user:", error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
}

//2. Lấy thông tin một người dùng theo ID
async function getUserById(req, res) {
    const userId = req.params.id;

    // Kiểm tra ID hợp lệ
    if (!ObjectId.isValid(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
    }

    try {
        // Tìm người dùng theo ID
        const user = await User.findOne({ _id: new ObjectId(userId) });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json(user);
    } catch (error) {
        console.error("Error fetching user:", error);
        res.status(500).json({ message: "Error fetching user", error: error.message });
    }
}
// 3. Đăng nhập người dùng
async function userLogin(req, res) {
    const { email, password } = req.body;

    // Kiểm tra dữ liệu đầu vào
    if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
    }

    try {
        // Tìm người dùng dựa trên email
        const user = await User.findOne({ email: email });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // So sánh mật khẩu bằng hàm từ hash.js
        const isMatch = await comparePassword(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid password" });
        }

        // Trả về thông tin người dùng (hoặc JWT token)
        res.status(200).json({
            message: "Login successful",
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });
    } catch (error) {
        console.error("Error during login:", error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
}

// async function userLogin(req, res) {
//     const { email, password } = req.body;

//     if (!email || !password) {
//         return res.status(400).json({ message: "Email and password are required" });
//     }

//     try {
//         const user = await User.findOne({ email });

//         if (!user) {
//             return res.status(404).json({ message: "User not found" });
//         }

//         const isMatch = await bcrypt.compare(password, user.password);
//         if (!isMatch) {
//             return res.status(401).json({ message: "Invalid password" });
//         }

//         // Tạo JWT token
//         const token = jwt.sign(
//             { id: user._id, role: user.role },
//             process.env.JWT_SECRET,
//             { expiresIn: '1h' } // Token hết hạn sau 1 giờ
//         );

//         res.status(200).json({
//             message: "Login successful",
//             token, // Trả về token
//             user: {
//                 id: user._id,
//                 name: user.name,
//                 email: user.email,
//                 role: user.role,
//             },
//         });
//     } catch (error) {
//         console.error("Error during login:", error);
//         res.status(500).json({ message: "Internal server error" });
//     }
// }
//4. Lấy tất cả người dùng
async function getAllUsers(req, res) {
    try {
        const users = await User.find({}).toArray();

        if (users.length === 0) {
            return res.status(404).json({ message: "No users found" });
        }

        res.status(200).json(users);
    } catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
}
//5. Lấy danh sách người dùng với giới hạn số lượng
async function getUsersWithLimit(req, res) {
    const limit = parseInt(req.query.limit) || 10; // Lấy tham số `limit`, mặc định là 10

    if (limit <= 0) {
        return res.status(400).json({ message: "Limit must be a positive number" });
    }

    try {
        // Lấy danh sách user với giới hạn
        const users = await User.find({}).limit(limit).toArray();

        if (users.length === 0) {
            return res.status(404).json({ message: "No users found" });
        }

        res.status(200).json(users);
    } catch (error) {
        console.error("Error fetching users with limit:", error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
}
//6. Lấy danh sách người dùng với sắp xếp
async function getUsersWithSort(req, res) {
    const sortField = req.query.sort || 'name'; // Trường cần sắp xếp, mặc định là 'name'
    const sortOrder = req.query.order === 'desc' ? -1 : 1; // Thứ tự sắp xếp: 1 (asc), -1 (desc)

    try {
        // Sắp xếp kết quả
        const users = await User.find({}).sort({ [sortField]: sortOrder }).toArray();

        if (users.length === 0) {
            return res.status(404).json({ message: "No users found" });
        }

        res.status(200).json(users);
    } catch (error) {
        console.error("Error fetching sorted users:", error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
}
//7. Cập nhật thông tin người dùng
async function updateUserById(req, res) {
    const userId = req.params.id;
    const updates = req.body;

    // Kiểm tra ID hợp lệ
    if (!ObjectId.isValid(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
    }

    // Kiểm tra nếu không có trường nào để cập nhật
    if (Object.keys(updates).length === 0) {
        return res.status(400).json({ message: "No fields provided for update" });
    }

    try {
        // Thực hiện cập nhật
        const result = await User.updateOne(
            { _id: new ObjectId(userId) },
            { $set: updates }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({ message: "User updated successfully" });
    } catch (error) {
        console.error("Error updating user:", error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
}
//8. Xóa người dùng theo ID
async function deleteUserById(req, res) {
    const userId = req.params.id;

    // Kiểm tra ID hợp lệ
    if (!ObjectId.isValid(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
    }

    try {
        // Xóa người dùng
        const result = await User.deleteOne({ _id: new ObjectId(userId) });

        if (result.deletedCount === 0) {
            return res.status(404).json({ message: "User not found" });
        }
        // Xóa giỏ hàng liên kết với người dùng
        const cartResult = await Cart.deleteOne({ _id: new ObjectId(userId) });
        if (cartResult.deletedCount === 0) {
            console.warn(`No cart found for user ID: ${userId}`);
        }

        res.status(200).json({ message: "User deleted successfully" });
    } catch (error) {
        console.error("Error deleting user:", error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
}
module.exports = { addAdmin, deleteUserById, updateUserById, getUsersWithSort, getUsersWithLimit, getAllUsers, userLogin, addUser, getUserById };
