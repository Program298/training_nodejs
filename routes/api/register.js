const express = require('express');
const User = require('../../models/users.model');
const bcrypt = require('bcrypt');
const router = express.Router();

router.post('/register', async (req, res) => {
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
          const userdata ={
             _id: user._id,
            Username: user.Username,
            Role: user.Role,
            Approved: user.Approved
};
        await user.save();
        res.status(201).json({
            status: "201",
            message: "success",
            data: [userdata]
        });   
    } catch (error) {
        res.status(400).json({ 
            status: "400",
            message: "create user failed",
        });
        console.error(error);
    }
    
});


module.exports = router;