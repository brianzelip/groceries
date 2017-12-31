const express = require('express');
const router = express.Router();
const groceryItemController = require('../controllers/groceryItemController');

router.get('/', groceryItemController.landingPage);

module.exports = router;
