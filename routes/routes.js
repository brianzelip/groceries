const express = require('express');
const router = express.Router();
const itemController = require('../controllers/itemController');

router.get('/', itemController.landingPage);

router.get('/groceries/:item', itemController.getItem);

router.post('/add', itemController.createItem);

module.exports = router;
