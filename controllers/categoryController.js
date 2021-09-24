var Category = require('../models/category');

// Display list of all category.
exports.category_list = function(req, res, next) {
  Category.find({}, 'name')
  .populate('name')
  .exec(function (err, list_categories) {
    if (err) { return next(err); }
    //Successful, so render
    res.render('category_list', { title: 'Category List', category_list: list_categories });
  });
};

// Display detail page for a specific category.
exports.category_detail = function(req, res) {
    res.send('NOT IMPLEMENTED: category detail: ' + req.params.id);
};

// Display category create form on GET.
exports.category_create_get = function(req, res) {
    res.send('NOT IMPLEMENTED: category create GET');
};

// Handle category create on POST.
exports.category_create_post = function(req, res) {
    res.send('NOT IMPLEMENTED: category create POST');
};

// Display category delete form on GET.
exports.category_delete_get = function(req, res) {
    res.send('NOT IMPLEMENTED: category delete GET');
};

// Handle category delete on POST.
exports.category_delete_post = function(req, res) {
    res.send('NOT IMPLEMENTED: category delete POST');
};

// Display category update form on GET.
exports.category_update_get = function(req, res) {
    res.send('NOT IMPLEMENTED: category update GET');
};

// Handle category update on POST.
exports.category_update_post = function(req, res) {
    res.send('NOT IMPLEMENTED: category update POST');
};