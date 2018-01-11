const mongoose = require('mongoose');
// have to tell mongoose that we're using ES6 async/await
mongoose.Promise = global.Promise;
const slug = require('slugs');

const itemSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
    required: 'Please enter an item name!'
  },
  slug: String,
  stores: {
    tj: {
      hasItem: Boolean,
      itemArea: Number
    },
    moms: {
      hasItem: Boolean,
      itemArea: Number
    },
    wineSource: Boolean,
    farmersMarket: Boolean,
    target: Boolean,
    riteAid: Boolean,
    default: String
  }
});

itemSchema.pre('save', function(next) {
  if (!this.isModified('name')) {
    next(); // go to next middleware or route function
    return; // terminate this function
  }
  this.slug = slug(`${this.name}`);
  next();
  // TODO make more resiliant so slugs are unique (in case two items have the same name)
}); // needs to be a long-form function because we need `this`, so arrow func won't do

module.exports = mongoose.model('Item', itemSchema);
