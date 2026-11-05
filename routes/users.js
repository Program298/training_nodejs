var express = require('express');
var router = express.Router();
const User = require('../models/users.model')

router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    let user = new User(
      { username : username, email : email, password : password });
    await user.save();
    res.status(201).json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/* GET users listing. */
// router.get('/', function(req, res, next) {
//   res.send('respond with a resource');
// });



module.exports = router;
