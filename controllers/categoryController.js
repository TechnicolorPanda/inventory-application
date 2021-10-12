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
        Item.find({ category: req.params.id })
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
          res.redirect('/catalog/categories');
      }

    }
  ];

// Display category delete form on GET.
exports.category_delete_get = function(req, res, next) {
    
  async.parallel({
    category: function(callback) {
      Category.findById(req.params.id).exec(callback)
    },
    category_items: function(callback) {
      Item.find({ category: req.params.id }).exec(callback)
  },
    
  }, function(err, results) {
    if (err) { return next(err); }
    if (results.category==null) { // No results.
      let err = new Error("Category not found");
      err.status = 404;
      res.redirect('/catalog/categories');
    }
    // Successful, so render.
    res.render(
      'category_delete', { 
        title: 'Delete Category', 
        category: results.category, 
        category_items: results.category_items,
      });
  });
}


// Handle category delete on POST.
exports.category_delete_post = function(req, res) {
  async.parallel(
    {
      category: function (callback) {
        Category.findById(req.params.id).exec(callback);
      },
      category_items: function (callback) {
        Item.find({ category: req.params.id }).exec(callback);
      },
    },
    function (err, results) {
      if (err) return next(err);

      if (results.category_items.length > 0) {
        res.render("category_delete", {
          title: "Delete Category: " + results.category.name,
          category: results.category,
          category_items: results.category_items,
        });
        return;
      } else {
        Category.findByIdAndRemove(req.body.id, (err) => {
          if (err) {
            return next(err);
          }
        res.redirect('/catalog/categories');
        });
      };
    }
  )
};


exports.category_update_get = function(req, res, next) {
  async.parallel({
    categories: function(callback) {
      Category.findById(req.params.id).exec(callback);
        },
  }, function(err, results) {
      if (err) { return next(err); }
      if (results.item == null) { 
          var err = new Error('Category not found');
          err.status = 404;
          return next(err);
      } 
      
      res.render('category_form', { title: 'Update Category', categories: results.categories });
  });
};

exports.category_update_post = [
   (req, res, next) => {
    if(!(req.body.category instanceof Array)){
        if(typeof req.body.genre ==='undefined')
        req.body.category = [];
        else
        req.body.category = new Array(req.body.category);
    }
    next();
},

// Validate and sanitise fields.
body('category.*').escape(),
body('description', 'Description must not be empty.').trim().isLength({ min: 1 }).escape(),

// Process request after validation and sanitization.
(req, res, next) => {

    // Extract the validation errors from a request.
    const errors = validationResult(req);

    // Create a Book object with escaped and trimmed data.
    var category = new Category(
      { category: req.body.category,
        description: req.body.description
       });

    if (!errors.isEmpty()) {
        // There are errors. Render form again with sanitized values/error messages.

        // Get all categories for form.
        async.parallel({
          categories: function(callback) {
            Category.find(callback);
            },
        }, function(err, results) {
            if (err) { return next(err); }

        res.render('category_form', { title: 'Update Category', category: results.category, errors: errors.array() });
        });
        return;
    }
    else {
        // Data from form is valid. Update the record.
        Item.findByIdAndUpdate(req.params.id, item, {}, function (err, item) {
            if (err) { return next(err); }
              res.redirect(category.url);
            });
    }
  }
]