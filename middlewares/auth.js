const jwt = require('jsonwebtoken');

// Middleware xác thực người dùng
function authenticate(req, res, next) {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
        return res.status(401).json({ message: "Unauthorized: No token provided" });
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // Lưu thông tin user từ token vào request
        next();
    } catch (error) {
        console.error("Error during authentication:", error);
        res.status(401).json({ message: "Unauthorized: Invalid token" });
    }
}

// Middleware phân quyền admin
function authorizeAdmin(req, res, next) {
    if (req.user.role !== "admin") {
        return res.status(403).json({ message: "Forbidden: Admins only" });
    }
    next();
}

module.exports = { authenticate, authorizeAdmin };
