const express = require('express');
const mongoose = require('mongoose');
const User = require('../../models/users.model');
const {
    authenticateToken,
    requireAdminOrApproved,
    requireAdmin
} = require('../../midleware/auth');

const router = express.Router();

router.put('/users/:id/approve', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const userId = req.params.id;
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({
                status: "400",
                message: "Invalid user ID"
            });
        }

        const user = await User.findByIdAndUpdate(userId, { Approved: true }, { new: true });
        if (!user) {
            return res.status(400).json({
                status: "400",
                message: "User not found"
            });
        }
        res.status(201).json({
            status: "201",
            message: "User approved successfully",
            data: user
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            status: "500",
            message: "Internal server error"
        });
    }
});


module.exports = router;