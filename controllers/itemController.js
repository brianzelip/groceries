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
      .filter(property => property.startsWith(`${itemName}-`))
      .map(property => property.split('-')[property.split('-').length - 1]);

    // if an item is available at TJ and Moms, there are possibly 2 ItemArea
    // suffixes, even though there is only 1 possible main store to get the
    // item from on any given trip. So we want to include only the ItemArea
    // suffix for the main store if it exists. This way we create
    // a groceryListData object only with needed info, nothing more.
    itemSuffixes.forEach(suffix => {
      if (!suffix.includes('ItemArea')) {
        objectToAddTo[suffix] = objectToFilter[`${itemName}-${suffix}`];
      } else if (
        // if there's a store for this item, AND a ${store}ItemArea suffix
        // create a storeArea property for this info
        objectToFilter[`${itemName}-store`] &&
        suffix.includes(objectToFilter[`${itemName}-store`])
      ) {
        objectToAddTo.storeArea = objectToFilter[`${itemName}-${suffix}`];
      }
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
      }, [])
      .sort((a, b) => h.stores[a].order - h.stores[b].order);
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
  const emailTo = req.body.emailTo;

  function itemsAtAStore(obj, storeName) {
    let storeItems = Object.keys(obj).filter(
      prop => obj[prop].store === storeName
    );

    let storeItemsWithLocation = storeItems
      .filter(item => obj[item].storeArea !== undefined)
      .sort((a, b) => obj[a].storeArea - obj[b].storeArea);

    let storeItemsWithNoLocation = storeItems
      .filter(item => obj[item].storeArea === undefined)
      .sort();

    let sortedStoreItems = storeItemsWithLocation.concat(
      storeItemsWithNoLocation
    );

    return sortedStoreItems;
  }

  function itemsWithOutAStore(obj) {
    return Object.keys(obj).filter(prop => obj[prop].store === undefined);
  }

  let storesHTML =
    stores.length > 0
      ? stores
          .map(
            store =>
              `${createStoreListHtml(
                store,
                itemsAtAStore(items, store),
                items
              )}`
          )
          .join('')
      : '';

  let noStoresHTML =
    itemsWithOutAStore(items).length > 0
      ? createNoStoreListHtml(itemsWithOutAStore(items), items)
      : '';

  function createNoStoreListHtml(arrayOfItemsWithNoStore, dataObj) {
    return `
      <h1 style="font-size: 1.25rem; font-weight: 700;">Other</h1>
      <ol style="padding-left: 0; list-style: none;">
        ${arrayOfItemsWithNoStore
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

  function createStoreListHtml(
    storeName,
    arrayOfItemNamesAtStoreName,
    dataObj
  ) {
    return `
      <h1 style="font-size: 1.25rem; font-weight: 700;">${
        h.stores[storeName].name
      }</h1>
      <ol style="padding-left: 0; list-style: none;">
        ${
          storeName === 'tj' || storeName === 'moms'
            ? arrayOfItemNamesAtStoreName
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
                .join('')
            : arrayOfItemNamesAtStoreName
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
                .join('')
        }
      </ol>
    `;
  }

  let emailOutput = storesHTML + noStoresHTML;

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
    to: emailTo,
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
