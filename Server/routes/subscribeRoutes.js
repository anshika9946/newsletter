const express = require('express');
const router = express.Router();
const subscribeController = require('../controllers/subscribeController');

// Define the route for subscribing
router.post('/subscribe', subscribeController.subscribe);

module.exports = router;
