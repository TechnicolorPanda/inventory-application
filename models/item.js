var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ItemSchema = new Schema(
  {
    pattern: {type: String, required: true},
    description: {type: String, required: true},
    price: {type: String, required: true},
    category: {type: Schema.Types.ObjectId, ref: 'Category', required: true},
  }
);

// Virtual for book's URL
ItemSchema
  .virtual('url')
  .get(function() {
    return '/catalog/item/' + this._id;
});

//Export model
module.exports = mongoose.model('Item', ItemSchema);