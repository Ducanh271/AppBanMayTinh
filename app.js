const express = require('express');
const { connectDB } = require('./config/database');
const productRoutes = require('./routes/products'); // route sản phẩm
const cartRoutes = require('./routes/carts'); // Thêm route giỏ hàng
const usersRouter = require('./routes/users'); // Route User
const orderRoutes = require('./routes/orders');


require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;
const { MongoClient } = require('mongodb');
const bcrypt = require('bcrypt'); // Import bcrypt để mã hóa mật khẩu
const path = require('path');
const cors = require('cors');
// app.use(cors());
app.use(cors({
  origin: '*', // Cho phép tất cả nguồn
  methods: 'GET,POST,PUT,DELETE', // Các phương thức được phép
  allowedHeaders: 'Content-Type,Authorization'
}));
app.use(express.json());
app.use('/api/products', productRoutes); // Sử dụng route cho sản phẩm
app.use('/api/carts', cartRoutes); // Route giỏ hàng
app.use('/api/users', usersRouter); // route user
app.use('/api/orders', orderRoutes); // route đơn hàng
// Hàm tạo admin cố định
async function createDefaultAdmin() {
  const client = new MongoClient(process.env.MONGO_URI); // Kết nối database từ file config
  try {
    await client.connect();
    const db = client.db("my_database"); // Thay "your_database_name" bằng tên database của bạn
    const users = db.collection("users");

    // Kiểm tra xem admin có tồn tại hay chưa
    const existingAdmin = await users.findOne({ email: "admin@example.com" });
    if (existingAdmin) {
      console.log("Default admin already exists.");
      return;
    }

    // Nếu chưa tồn tại, tạo admin mới
    const hashedPassword = await bcrypt.hash("admin123", 10); // Mã hóa mật khẩu
    const defaultAdmin = {
      name: "Super Admin",
      email: "admin@example.com",
      password: hashedPassword,
      role: "admin", // Vai trò admin
      createdAt: new Date(),
    };

    await users.insertOne(defaultAdmin); // Thêm admin vào collection users
    console.log("Default admin created successfully.");
  } catch (error) {
    console.error("Error creating default admin:", error);
  } finally {
    await client.close();
  }
}
//front-end
    // Middleware để phục vụ các file tĩnh (HTML, CSS, JS)
    app.use(express.static(path.join(__dirname, 'public')));

    // Route chính để trả về trang frontend
app.get('/adminPage', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/AdminPage', 'AdminPageProduct.html'));
});
app.listen(port, async () => {
  await connectDB();
  await createDefaultAdmin();
  console.log(`Server is running on http://localhost:${port}`);
});

