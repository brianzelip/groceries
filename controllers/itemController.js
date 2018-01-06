const mongoose = require('mongoose');
const Item = mongoose.model('Item');

exports.app = async (req, res) => {
  // 1 .query the database for a list of all items
  const items = await Item.find();
  res.render('app', { items });
};

exports.getItem = (req, res) => {
  res.send(`passed param: ${req.params.item}`);
};

exports.postAdd = (req, res) => {
  res.json(req.body);
};

exports.createItem = async (req, res) => {
  const item = new Item(req.body);
  await item.save();
  req.flash(
    'success',
    `Successfully added <strong>${item.name}${
      item.variant ? `-${item.variant}` : ``
    }</strong> to the list!`
  );
  res.redirect('/');
};

exports.postSubmit = (req, res) => {
  const selectedItems = req.body.items;
  const slugs = Object;

  // pass an array of objects to the rendered GroceryList view,
  // where each object in the array represents an item selected by the user
  // with the following data per selected item:
  // 1. COMPLETE item name
  // 2. COMPLETE the number of items to get from the store
  // 3. get the item's area from the database
  // ?. the store to get the item at
  // ?. the area where the item is located in the store

  const outputObj = [];

  function getName(str) {
    return str.replace(/-/g, ' ').split('+')[0];
  }

  function getSlug(str) {
    return str.split('+')[0];
  }

  function getArea(str) {
    return str.split('+')[1];
  }

  function getQty(str) {
    return req.body.hasOwnProperty(`${getSlug(str)}-qty`)
      ? req.body[`${getSlug(str)}-qty`]
      : 1;
  }

  selectedItems.forEach(item => {
    const itemObj = {};
    itemObj.name = getName(item);
    itemObj.area = getArea(item);
    itemObj.qty = getQty(item);
    outputObj.push(itemObj);
  });

  // res.render('groceryList', {
  //   selectedItems,
  //   all: req.body,
  //   keys: Object.keys(req.body)
  // });

  // res.json(outputObj);

  res.render('groceryList', { items: outputObj });
};
