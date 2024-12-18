const { client } = require('../config/database');

const db = client.db("my_database"); // Tên database phải chính xác
const Product = db.collection("products"); // Tên collection phải chính xác

module.exports = Product;
