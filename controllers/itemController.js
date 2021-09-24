var Item = require('../models/item');
var Category = require('../models/category');

var async = require('async');

exports.index = function(req, res) {

  async.parallel({
    item_count: function(callback) {
      Item.countDocuments({}, callback);
    },
    category_count: function(callback) {
      Category.countDocuments({}, callback);
    }
  }, function(err, results) {
    res.render('index', { title: 'Loophaven Loft', error: err, data: results })
  })
};

// Display list of all items.
exports.item_list = function(req, res, next) {
  Item.find({}, 'pattern category')
  .populate('pattern')
  .exec(function (err, list_items) {
    if (err) { return next(err); }
    //Successful, so render
    res.render('item_list', { title: 'Pattern List', item_list: list_items });
  });
};

// Display detail page for a specific item.
exports.item_detail = function(req, res, next) {
  async.parallel({
    item: function(callback) {
        Item.findById(req.params.id)
          .exec(callback);
    },

    item_patterns: function(callback) {
        Item.find({ 'item': req.params.id })
          .exec(callback);
    },

}, function(err, results) {
    if (err) { return next(err); }
    if (results.item==null) { // No results.
        var err = new Error('Genre not found');
        err.status = 404;
        return next(err);
    }
    // Successful, so render
    res.render('item_detail', { title: 'Pattern Detail', item: results.item, item_patterns: item.item_patterns } );
});
};

// Display item create form on GET.
exports.item_create_get = function(req, res) {
    res.send('NOT IMPLEMENTED: Item create GET');
};

// Handle item create on POST.
exports.item_create_post = function(req, res) {
    res.send('NOT IMPLEMENTED: Item create POST');
};

// Display item delete form on GET.
exports.item_delete_get = function(req, res) {
    res.send('NOT IMPLEMENTED: Item delete GET');
};

// Handle item delete on POST.
exports.item_delete_post = function(req, res) {
    res.send('NOT IMPLEMENTED: Item delete POST');
};

// Display item update form on GET.
exports.item_update_get = function(req, res) {
    res.send('NOT IMPLEMENTED: Item update GET');
};

// Handle item update on POST.
exports.item_update_post = function(req, res) {
    res.send('NOT IMPLEMENTED: Item update POST');
};