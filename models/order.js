const { client } = require('../config/database');

const db = client.db("my_database"); // Tên database phải chính xác
const Order = db.collection("orders"); // Tên collection phải chính xác

module.exports = Order;
