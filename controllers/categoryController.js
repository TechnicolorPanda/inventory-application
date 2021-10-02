var Category = require('../models/category');
var Item = require('../models/item');
const { body,validationResult } = require('express-validator');
var async = require('async');

// Display list of all category.
exports.category_list = function(req, res, next) {
  Category.find({}, 'name')
  .sort([['name', 'ascending']])
  .exec(function (err, list_categories) {
    if (err) { return next(err); }
    //Successful, so render
    res.render('category_list', { title: 'Category List', category_list: list_categories });
  });
};

// Display detail page for a specific category.
  exports.category_detail = function(req, res, next) {

    async.parallel({
        category: function(callback) {
            Category.findById(req.params.id)
              .exec(callback);
        },

        category_items: function(callback) {
            Item.find({ 'category': req.params.id })
              .exec(callback);
        },

    }, function(err, results) {
        if (err) { return next(err); }
        if (results.category == null) { // No results.
            var err = new Error('Category not found');
            err.status = 404;
            return next(err);
        }
        // Successful, so render
        res.render(
          'category_detail', 
          { title: 'Category Detail', 
            category: results.category, 
            category_items: results.category_items 
          } );
    });
};

// Display category create form on GET.
exports.category_create_get = function(req, res, next) {
      
    async.parallel({
        categories: function(callback) {
            Category.find(callback);
        },
    }, function(err, results) {
        if (err) { return next(err); }
        res.render('category_form', { title: 'Create Category', categories: results.categories });
    });
};

// Handle category create on POST.
exports.category_create_post =  [

    // Validate and santize the name field.
    body('name', 'Category name required').trim().isLength({ min: 1 }).escape(),
    body('description', 'Description required').trim().isLength({ min: 1 }).escape(),
  
    // Process request after validation and sanitization.
    (req, res, next) => {
  
      // Extract the validation errors from a request.
      const errors = validationResult(req);
  
      // Create a genre object with escaped and trimmed data.
      var category = new Category(
        { name: req.body.name,
          description: req.body.description },
      );
  
      if (!errors.isEmpty()) {
        // There are errors. Render the form again with sanitized values/error messages.
        res.render('category_form', { 
          title: 'Create Category', 
          category: category, 
          errors: errors.array()
      });
      return;
      } else {
        // Data from form is valid.
        // Check if Category with same name already exists.
        Category.findOne({ 'name': req.body.name })
          .exec( function(err, found_category) {
             if (err) { return next(err); }
  
             if (found_category) {
               // Category exists, redirect to its detail page.
               res.redirect(found_category.url);
             } else {
               category.save(function (err) {
                 if (err) { return next(err); }
                 // Category saved. Redirect to category detail page.
                 res.redirect(category.url);
               });
  
             }
          });
      }
    }
  ];

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