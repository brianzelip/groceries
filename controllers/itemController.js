const mongoose = require('mongoose');
const Item = mongoose.model('Item');
const nodemailer = require('nodemailer');

exports.app = async (req, res) => {
  // 1 .query the database for a list of all items
  const items = await Item.find();
  res.render('app', { items });
};

exports.getItem = (req, res) => {
  res.send(`passed param: ${req.params.item}`);
};

exports.addItem = (req, res) => {
  res.render('addItem', { title: 'Add item' });
};

exports.postAdd = (req, res) => {
  res.json(req.body);
};

exports.createItem = async (req, res) => {
  const item = new Item(req.body);
  await item.save();
  req.flash(
    'success',
    `Successfully added <strong>${item.name}</strong> to the list!`
  );
  res.redirect('/');
};

exports.processUserInput = (req, res, next) => {
  const selectedItems = req.body.items;
  req.body.outputObj = [];

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
    req.body.outputObj.push(itemObj);
  });

  // once we have processed the user input, keep going!
  next();
}; // this is middleware, we will get the user submitted data, generate the email html, then pass it to the outputGroceryList controller

exports.outputGroceryList = (req, res) => {
  // pass an array of objects to the rendered GroceryList view,
  // where each object in the array represents an item selected by the user
  // with the following data per selected item:
  // 1. COMPLETE item name
  // 2. COMPLETE the number of items to get from the store
  // 3. COMPLETE item's area from the input value string
  // 4. the store to get the item at

  const sortedItems = req.body.outputObj.sort((a, b) => a.area - b.area);

  let emailOutput = `
    <ol>
      ${sortedItems
        .map(
          item => `<li>${item.name} (x${item.qty}) in area ${item.area}</li>`
        )
        .join('')}
    </ol>`;

  const transporter = nodemailer.createTransport({
    host: 'smtpout.secureserver.net',
    port: 3535,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  let mailOptions = {
    from: '"🧀 A&B Groceries 🍼" <holler@abbieandbrian.us>',
    to: 'bzelip@gmail.com',
    subject: 'grocery list',
    text:
      'Sorry, at the moment there is nothing to see here in the plain text version :(JSON.stringify(outputObj, null, 2)',
    html: emailOutput
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      return console.log(error);
    }
    console.log('Message sent: %s', info.messageId);
  });

  res.render('groceryList', {
    items: req.body.outputObj,
    emailOutput
  });
};
