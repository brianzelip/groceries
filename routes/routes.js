const express = require('express');
const router = express.Router();
const itemController = require('../controllers/itemController');
const { catchErrors } = require('../handlers/errorHandlers');

router.get('/', catchErrors(itemController.app));

router.get('/groceries/:item', itemController.getItem);

router.post('/add', catchErrors(itemController.createItem));

router.get('/add', itemController.addItem);

router.post(
  '/submit',
  itemController.processUserInput,
  itemController.outputGroceryList
);

module.exports = router;
