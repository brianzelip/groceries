const mongoose = require('mongoose');
// have to tell mongoose that we're using ES6 async/await
mongoose.Promise = global.Promise;

const groceryItemSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true
  },
  type: {
    type: String,
    trim: true
  },
  area: Number
});

module.exports = mongoose.model('GroceryItem', groceryItemSchema);
