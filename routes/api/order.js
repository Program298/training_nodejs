const express = require('express');
const Product = require('../../models/product.model');
const {
    authenticateToken,
    requireAdminOrApproved
} = require('../../midleware/auth');

const router = express.Router();


router.get('/orders', authenticateToken, requireAdminOrApproved, async (req, res) => {
    try {
        const orders = await Product.aggregate([
            { $unwind: "$Order" },
            { $sort: { "Order.time": -1 } },
            { $project: { 
                _id: 0,
                Order_id: "$Order._id",
                Product_id: "$_id",
                Product_name: 1, 
                Price: 1,  
                User_id: "$Order.User_id", 
                time: "$Order.time" } 
            }
        ]);
        if (!orders || orders.length === 0) {
            return res.status(200).json({
                status: "200",
                message: "No orders found",
                data: []
            });
        }
        res.status(200).json({
            status: "200",
            message: "success",
            data: [orders]
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