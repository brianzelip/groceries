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
