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
  'howl',
  'target',
  'riteAid'
];

const storesDict = {
  tj: 'TJ',
  moms: 'Moms',
  wineSource: 'Wine Source',
  farmersMarket: 'Mkt',
  howl: 'Howl',
  target: 'Target',
  riteAid: 'Rite Aid'
};

exports.stores = stores;
exports.storesDict = storesDict;

exports.storesWithThisItem = obj => {
  const result = [];
  stores.forEach(store => {
    console.log(`${obj.name.toUpperCase()}start :: results = ${result}`);
    typeof obj.stores[store] === 'boolean'
      ? obj.stores[store] ? result.push(store) : null
      : obj.stores[store].hasItem ? result.push(store) : null;
    console.log(`end :: results = ${result}`);
  });
  return result;
};
