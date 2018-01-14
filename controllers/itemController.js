const mongoose = require('mongoose');
const Item = mongoose.model('Item');
const nodemailer = require('nodemailer');
const h = require('../helpers');

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
  const userSelectedItems = req.body.items;

  req.body.groceryListData = {
    items: {},
    stores: []
  };

  function addSelectorDataToItemObject(
    itemName,
    objectToFilter,
    objectToAddTo
  ) {
    let itemSuffixes = Object.keys(objectToFilter)
      .filter(property => property.includes(`${itemName}-`))
      .map(property => property.split('-')[property.split('-').length - 1]);

    itemSuffixes.forEach(suffix => {
      objectToAddTo[suffix] = objectToFilter[`${itemName}-${suffix}`];
    });
    return;
  }

  function getSelectedStores(obj) {
    return Object.keys(obj)
      .filter(key => key.endsWith('store'))
      .reduce((acc, key) => {
        if (acc.indexOf(obj[key]) === -1) {
          acc.push(obj[key]);
        }
        return acc;
      }, []);
  }

  userSelectedItems.forEach(item => {
    req.body.groceryListData.items[item] = {};
    addSelectorDataToItemObject(
      item,
      req.body,
      req.body.groceryListData.items[item]
    );
  });

  req.body.groceryListData.stores = getSelectedStores(req.body);

  next();
};

exports.outputGroceryList = (req, res) => {
  const items = req.body.groceryListData.items;
  const stores = req.body.groceryListData.stores;

  function itemsAtAStore(obj, storeName) {
    return Object.keys(obj).filter(prop => obj[prop].store === storeName);
  }

  function itemsWithOutAStore(obj) {
    return Object.keys(obj).filter(prop => obj[prop].store === undefined);
  }

  let storesHTML = stores
    .map(
      store =>
        `${createStoreListHtml(store, itemsAtAStore(items, store), items)}`
    )
    .join('');

  function createStoreListHtml(
    storeName,
    arrayOfItemNamesAtStoreName,
    dataObj
  ) {
    return `
      <h1>${storeName}</h1>
      <ol class="list-reset">
        ${arrayOfItemNamesAtStoreName
          .map(
            itemName => `
            <li>
              <input type="checkbox" value="${itemName}" id="${itemName}" name="item">
              <label for="${itemName}">${itemName}${
              dataObj[itemName].qty ? ` (x${dataObj[itemName].qty})` : ''
            }</label>
            </li>
          `
          )
          .join('')}
      </ol>
    `;
  }

  let emailOutput = storesHTML;

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
    formData: req.body,
    emailOutput
  });
};
