const express = require('express');
const User = require('../models/users.model');
const bcrypt = require('bcrypt');
const Product = require('../models/product.model');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const {authenticateToken,requireAdminOrApproved
} = require('../midleware/auth');

const router = express.Router();

router.post('/v1/register', async (req, res) => {
    try {
        const { Username, Password, Role, Approved } = req.body;
        const hashpassword = await bcrypt.hash(Password, 10);
        if (Username == null || Password == null) {
            return res.status(400).json({
                status: "400",
                message: "Username and Password are required"
            });
        }
       const existingUser = await User.findOne({ Username });
        if (existingUser) {
        return res.status(409).json({ message: 'This username is already in use.' });
            }

        let user = new User({ 
            Username : Username, 
            Password : hashpassword, 
            Role : Role,
            Approved : Approved
            
        });
        
        await user.save();
        res.status(200).json({
            status: "200",
            message: "success",
            data: user
        });   
    } catch (error) {
        res.status(400).json({ 
            status: "400",
            message: "create user failed",
        });
        console.error(error);
    }
    
});

router.post('/v1/login', async (req, res) => {
    try {
        const { Username, Password } = req.body;
        const user = await User.findOne({ 
            Username: Username
        });
   
    if (!user) {
        return res.status(404).json({
            status: "404",
            message: "User not found"
        });
    } 
    const isPasswordValid = await bcrypt.compare(Password, user.Password);
    if (!isPasswordValid) {
        return res.status(401).json({
            status: "401",
            message: "Invalid password"
        });
    } else if (isPasswordValid && !user.Approved){
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        return res.status(201).json({
            status: "201",
            message: "User Login success but not approved",
            data: user,
            token: token
        });
    }  else {
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        return res.status(200).json({
            status: "200",
            message: "User Login success",
            data: user,
            token: token
        });

        
    }
        
    }
    catch (error) {
       console.error(error);
       res.status(500).json({
           status: "500",
           message: "Internal server error"
       });
    }

});

router.put('/v1/users/:id/approve', authenticateToken, requireAdminOrApproved, async (req, res) => {
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


//// Api ส่วนของ Product
router.get('/v1/products', authenticateToken, requireAdminOrApproved, async (req, res) => {
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

router.get('/v1/products/:id', authenticateToken, requireAdminOrApproved, async (req, res) => {
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

router.post('/v1/products', authenticateToken, requireAdminOrApproved, async (req, res) => {
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

router.put('/v1/products/:id', authenticateToken, requireAdminOrApproved, async (req, res) => {
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
        res.status(200).json({
            status: "200",
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


router.delete('/v1/products/:id', authenticateToken, requireAdminOrApproved, async (req, res) => {
    try {
        const productId = req.params.id;
        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({
                status: "400",
                message: "Invalid product ID"
            });
        }
        const product = await Product.findByIdAndDelete(productId);
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
///////////////////////////////
///ส่วนของ Order
router.get('/v1/products/:id/orders', authenticateToken, requireAdminOrApproved, async (req, res) => {
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

router.post('/v1/products/:id/orders', authenticateToken, requireAdminOrApproved, async (req, res) => {
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

router.get('/v1/orders', authenticateToken, requireAdminOrApproved, async (req, res) => {
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
            data: orders
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
