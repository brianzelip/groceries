const express = require('express');
const router = express.Router();
const itemController = require('../controllers/itemController');
const { catchErrors } = require('../handlers/errorHandlers');

router.get('/', catchErrors(itemController.app));

router.get('/groceries/:item', itemController.getItem);

router.get('/add', itemController.addItem);

router.get('/edit/:id', catchErrors(itemController.editItem));

router.post('/add', catchErrors(itemController.createItem));

router.post(
  '/submit',
  itemController.processFormData,
  itemController.outputGroceryList
);

module.exports = router;
