const mongoose = require('mongoose');
// have to tell mongoose that we're using ES6 async/await
mongoose.Promise = global.Promise;
const slug = require('slug');

const itemSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true
  },
  variant: {
    type: String,
    trim: true
  },
  area: Number,
  slug: String
});

module.exports = mongoose.model('Item', itemSchema);
