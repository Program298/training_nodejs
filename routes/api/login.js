const express = require('express');
const User = require('../../models/users.model');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');


const router = express.Router();

router.post('/login', async (req, res) => {
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
        return res.status(200).json({
            status: "200",
            message: "User Login success but not approved",
            data: user,
            token: token
        });
    }  else {
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '3h' });
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



module.exports = router;