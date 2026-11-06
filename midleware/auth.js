const jwt = require('jsonwebtoken');
const User = require('../models/users.model');

async function authenticateToken(req, res, next) {
    try {
        token = req.headers.authorization.split('Bearer ')[1];
        decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = decoded;
        req.user = user;
        return next();
    } catch (error) {
        return res.status(401).json({
            status: "401",
            message: "Unauthorized"
        })
    }
}

async function requireAdminOrApproved(req, res, next) {
    try {
        const user = await User.findById(req.user.userId);
        if (user.Role === 'Admin' || user.Approved === true) {
            return next();
        } else {
            return res.status(401).json({
                status: "401",
                message: "User is not approved or not an admin"
            });
        }
    }
    catch (error) {
        res.status(500).json({
            status: "500",
            message: "Internal server error"
        });
        console.error(error);
    }
}

async function requireAdmin(req, res, next) {
    try {
        const user = await User.findById(req.userId);
        if (!user || user.Role !== 'Admin') {
            return res.status(401).json({
                status: "401",
                message: "You are not Admin"
            });
        }
        return next();
    } catch (error) {
        res.status(500).json({
            status: "500",
            message: "Internal server error"
        });
        console.error(error);
    }

}

module.exports = { authenticateToken, requireAdminOrApproved, requireAdmin };