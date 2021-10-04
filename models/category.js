var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var CategorySchema = new Schema(
  {
    name: { type: String, required: true, minLength: 3, maxLength: 100 },
    description: { type: String, maxlength: 200 },
  }
);

CategorySchema
  .virtual('url')
  .get(function() {
    return '/catalog/category/' + this._id;
});

//Export model
module.exports = mongoose.model('Category', CategorySchema);