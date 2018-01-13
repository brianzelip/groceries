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

exports.processFormData = (req, res, next) => {
  // we have the list of items to get
  // for each item in the items list array,
  // make a selectedItems object in middleware
  // selectedItems looks like:
  // selectedItems = { `${item.slug}`: {qty: `${qty}`, store: [`${store}`]}};
  //   1. check if there is a item-qty value
  //     1a. if yes,
  //   2. check if there is a item-store value
  const selectedItems = req.body.items;
  Object.defineProperty(req.body, 'outputObj', { value: {} });

  function hasQty(item) {
    req.body.hasOwnProperty(`${item}-qty`) ? true : false;
  }
  function hasStore(item) {
    req.body.hasOwnProperty(`${item}-store`) ? true : false;
  }

  function getSelectorDataFromItem(str, suffix) {
    if (req.body.hasOwnProperty(`${str}-${suffix}`)) {
      return req.body[`${str}-${suffix}`];
    } else {
      return undefined;
    }
  }

  function getSelectorDataFromItem(str, suffix) {
    if (req.body.hasOwnProperty(`${str}-${suffix}`)) {
      console.log(reqBody[`${str}-${suffix}`]);
      return reqBody[`${str}-${suffix}`];
    }
  }

  function itemHasSelectorData(item, selector) {
    if (req.body.hasOwnProperty(`${item}-${selector}`)) {
      return true;
    } else {
      return false;
    }
  }

  function createOutputObj(arr) {
    const result = {};

    arr.forEach(item => {
      const [qty, store] = ['qty', 'store'];
      result[item] = {};

      if (itemHasSelectorData(item, qty)) {
        result[item].qty = req.body[`${item}-${qty}`];
      }
      if (itemHasSelectorData(item, store)) {
        result[item].store = req.body[`${item}-${store}`];
      }
    });

    console.log('createOutputObj() >>>>>>>>>>>>>>', result);
    return result;
  }

  // selectedItems.forEach(item => {
  //   if (itemHasSelectorData(item, 'qty')) {
  //     Object.defineProperty(req.body.outputObj, 'qty', {
  //       value: req.body[`${item}-qty`]
  //     });
  //   }
  //   console.log('qty DATA::::::::::', req.body.outputObj);
  //   if (itemHasSelectorData(item, 'store')) {
  //     Object.defineProperty(req.body.outputObj, 'store', {
  //       value: req.body[`${item}-qty`]
  //     });
  //   }
  //   console.log('store DATA::::::::::', req.body.outputObj);
  // });

  // console.log(
  //   'via processFormData() >> req.body.outputObj = ',
  //   req.body.outputObj
  // );

  req.body.outputObj = createOutputObj(selectedItems);

  next();
};

exports.outputGroceryList = (req, res) => {
  // pass an array of objects to the rendered GroceryList view,
  // where each object in the array represents an item selected by the user
  // with the following data per selected item:
  // 1. COMPLETE item name
  // 2. COMPLETE the number of items to get from the store
  // 3. COMPLETE item's area from the input value string
  // 4. the store to get the item at

  // const sortedItems = req.body.outputObj.sort((a, b) => a.area - b.area);
  const sortedItems = req.body.outputObj;

  // let emailOutput = `
  //   <ol>
  //     ${sortedItems
  //       .map(
  //         item => `<li>${item.name} (x${item.qty}) in area ${item.area}</li>`
  //       )
  //       .join('')}
  //   </ol>`;
  let emailOutput = `
    <ol>
      ${Object.keys(sortedItems)
        .map(
          item =>
            `<li>${item} (x${sortedItems[item].qty}) from ${
              sortedItems[item].store
            }</li>`
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
    outputObj: req.body.outputObj,
    emailOutput,
    items: req.body.items,
    formData: req.body
  });
};
