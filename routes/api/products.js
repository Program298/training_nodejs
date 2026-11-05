const express = require('express');
const router = express.Router();
const Product = require('../../models/product.model');
const mongoose = require('mongoose');
const {authenticateToken,requireAdminOrApproved
} = require('../../midleware/auth');



router.get('/products', authenticateToken, requireAdminOrApproved, async (req, res) => {
    try {
          const products = await Product.find({});

          if (!products) {
            res.status(400).json({
              status: "400",
              message: "Products not found",
              data: products
            });
          }
        res.status(200).json({
            status: "200",
            message: "success",
            data: products
        });}
      
     catch (error) {
        console.error(error);
        res.status(500).json({
            status: "500",
            message: "Internal server error"
        })
    
    }
})

router.get('/products/:id', authenticateToken, requireAdminOrApproved, async (req, res) => {
    try {
        const productId = req.params.id;

           if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({
                status: "400",
                message: "Invalid product ID"
            });
        }
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({
                status: "404",
                message: "There is no product associated with this ID",
                data: product
            })
        }
        res.status(200).json({
            status: "200",
            message: "success",
            data: product
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            status: "500",
            message: "Internal server error"
        });
    }
});

router.post('/products', authenticateToken, requireAdminOrApproved, async (req, res) => {
    try {
        const { Product_name, Max_order, Price } = req.body;
        if (!Product_name || !Max_order || !Price) {
            return res.status(400).json({
                status: "400",
                message: "Incomplete information"
            })
        }
        const procuct = new Product({ Product_name, Max_order, Price });
        await procuct.save();
        res.status(201).json({
            status: "201",
            message: "Product created successfully",
            data: procuct
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            status: "500",
            message: "Internal server error"
        });
    }
})

router.put('/products/:id', authenticateToken, requireAdminOrApproved, async (req, res) => {
    try {
        const productId = req.params.id; 
        const { Product_name, Max_order, Price } = req.body;
        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({
                status: "400",
                message: "Invalid product ID"
            });
        }
        const product = await Product.findByIdAndUpdate(productId, { Product_name, Max_order, Price }, { new: true });
        if (!product) {
            return res.status(404).json({
                status: "404",
                message: "Product not found"
            });
        }
        res.status(201).json({
            status: "201",
            message: "Product updated successfully",
            data: product
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            status: "500",
            message: "Internal server error"
        });

    }
});


router.delete('/products/:id', authenticateToken, requireAdminOrApproved, async (req, res) => {
    try {
        const productId = req.params.id;
        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({
                status: "400",
                message: "Invalid product ID"
            });
        }
        const product = await Product.findByIdAndDelete(productId);
        console.log(product);
        if (!product) {
            return res.status(404).json({
                status: "404",
                message: "Product not found"
            });
        }
        res.status(200).json({
            status: "200",
            message: "Product deleted successfully",
            data: product
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            status: "500",
            message: "Internal server error"
        });
    }
});
///ส่วนของ Order
router.get('/products/:id/orders', authenticateToken, requireAdminOrApproved, async (req, res) => {
    try {
        const productId = req.params.id;
        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({
                status: "400",
                message: "Invalid product ID"
            });
        }
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({
                status: "404",
                message: "Product not found"
            });
        }
        if (!product.Order || product.Order.length === 0) {
            return res.status(200).json({
                status: "200",
                message: "No orders found for this product",
                data: []
            })  
        }   
        return res.status(200).json({
            status: "200",
            message: "success",
            data: product.Order 
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            status: "500",
            message: "Internal server error"
        });
    }
});

router.post('/products/:id/orders', authenticateToken, requireAdminOrApproved, async (req, res) => {
 try {
    const productId = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(productId)) {
        return res.status(400).json({
            status: "400",
            message: "Invalid product ID"
        });
    }
    const product = await Product.findById(productId);
    console.log('product:', product._id, 'Max_Order:', product.Max_order);
    if (!product) {
        return res.status(404).json({
            status: "404",
            message: "Product not found"
        });
    }
    const orderCount = product.Order.length;
  
    if (orderCount >= product.Max_order) {
        return res.status(400).json({
            status: "200",
            message: "Orders are full;"
        });
    }
    else {
        const newOrder = {
            time: new Date(),
            User_id: req.user.userId
        };
        product.Order.push(newOrder);
        await product.save();
        return res.status(201).json({
            status: "201",
            message: "Order created successfully",
            data: newOrder
        });
    }
 } catch (error) {
    console.error(error);
    res.status(500).json({
        status: "500",
        message: "Internal server error"
    })
 }
})



module.exports = router;