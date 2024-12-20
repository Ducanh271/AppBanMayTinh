const express = require('express');
const { connectDB } = require('./config/database');
const productRoutes = require('./routes/products'); // route sản phẩm
const cartRoutes = require('./routes/carts'); // Thêm route giỏ hàng
const usersRouter = require('./routes/users'); // Route User
const orderRoutes = require('./routes/orders');


require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use('/api/products', productRoutes); // Sử dụng route cho sản phẩm
app.use('/api/carts', cartRoutes); // Route giỏ hàng
app.use('/api/users', usersRouter); // route user
app.use('/api/orders', orderRoutes); // route đơn hàng

app.listen(port, async () => {
  await connectDB();
  console.log(`Server is running on http://localhost:${port}`);
});

