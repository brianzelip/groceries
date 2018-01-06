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

  // pass an array of objects to the rendered GroceryList view,
  // where each object in the array represents an item selected by the user
  // with the following data per selected item:
  // 1. item name
  // 2. the number of items to get from the store
  // [once the above two steps are complete, then work on the next two steps]
  // 3. the store to get the item at
  // 4. the area where the item is located in the store

  const outputObj = [];

  function rmHyphens(slug) {
    return slug.replace(/-/g, ' ');
  }

  selectedItems.forEach(item => {
    const itemObj = {};
    itemObj.name = rmHyphens(item);
    outputObj.push(itemObj);
  });

  // res.render('groceryList', {
  //   selectedItems,
  //   all: req.body,
  //   keys: Object.keys(req.body)
  // });
  res.json(outputObj);
};
