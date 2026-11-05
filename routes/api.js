const express = require('express');
const router = express.Router();

router.use('/v1', require('./api/login'));
router.use('/v1', require('./api/register'));
router.use('/v1', require('./api/products'));
router.use('/v1', require('./api/order'));
router.use('/v1', require('./api/users'));


module.exports = router;