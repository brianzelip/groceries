const mongoose = require('mongoose');
const Item = mongoose.model('Item');

exports.landingPage = (req, res) => {
  res.render('index');
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
