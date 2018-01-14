/*
  This is a file of data and helper functions that we can expose and use in our templating function
*/

// FS is a built in module to node that let's us read files from the system we're running on
const fs = require('fs');

// Dump is a handy debugging function we can use to sort of "console.log" our data
exports.dump = obj => JSON.stringify(obj, null, 2);

// Some details about the site
exports.site = {
  name: 'groceries',
  css: '/css/groceries.min.css',
  author: 'Brian Zelip',
  authorUri: 'http://zelip.me',
  description: `Family groceries web app.`,
  keywords: ['Node.js', 'Express.js', 'MongoDB', 'groceries']
};

const stores = [
  'tj',
  'moms',
  'wineSource',
  'farmersMarket',
  'target',
  'riteAid'
];

const storesDict = {
  tj: 'TJ',
  moms: 'Moms',
  wineSource: 'Wine Source',
  farmersMarket: 'Mkt',
  target: 'Target',
  riteAid: 'Rite Aid'
};

exports.stores = stores;
exports.storesDict = storesDict;

exports.atStores = obj => {
  const result = [];
  stores.forEach(store => {
    typeof obj[store] === 'boolean'
      ? obj[store] ? result.push(store) : null
      : obj[store].hasItem ? result.push(store) : null;
  });
  return result;
};
