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

exports.hasStore = obj => {
  const stores = ['tj', 'moms', 'ws', 'fm'];
  let result = false;
  stores.forEach(store => (obj[store] ? (result = true) : null));
  return result;
};
