const { client } = require('../config/database');

const db = client.db("my_database"); // Tên database phải chính xác
const Cart = db.collection("carts"); // Tên collection phải chính xác

module.exports = Cart;
