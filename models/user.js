const { client } = require('../config/database');

const db = client.db("my_database"); // Tên database của bạn
const User = db.collection("users"); // Collection tên là 'users'

module.exports = User;
