var Item = require('../models/item');
var Category = require('../models/category');
const { body,validationResult } = require('express-validator');
var multer = require('multer');
var async = require('async');

const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, './public/images/');
  },
  filename: function(req, file, cb) {
    cb(null, new Date().toISOString() + file.originalname);
  }
});

const fileFilter = (req, file, cb) => {
  // reject a file
  if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 5
  },
  fileFilter: fileFilter
});

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

  Item.find()
  .sort([['pattern', 'ascending']])
  .exec(function(err, list_items) {
    if (err) { return next(err); }
    //Successful, so render
    res.render('item_list', { title: 'Pattern List', item_list: list_items });
  });
}

// Display detail page for a specific item.
exports.item_detail = function(req, res, next) {
  async.parallel({
    item: function(callback) {
      Item.findById(req.params.id)
          .populate('category')
          .exec(callback);
    },

    item_patterns: function(callback) {
      Item.find({ item: req.params.id })
        .exec(callback);
    },

  }, function(err, results) {
    if (err) { return next(err); }
    if (results.item==null) { // No results.
        var err = new Error('Pattern not found');
        err.status = 404;
        return next(err);
    }
    // Successful, so render
    res.render('item_detail', { 
      title: 'Pattern Detail', 
      item: results.item, 
      item_patterns: results.item_patterns,
    } );
  });
};

exports.item_create_get = function(req, res, next) {
  async.parallel({
    categories: function(callback) {
      Category.find(callback);
    },
  }, function(err, results) {
      if (err) { return next(err); }
      res.render('item_form', { title: 'Create Pattern', categories: results.categories });
  });

};

exports.item_create_post = [
  // Adds product image to the req object
  upload.single('pattern_image'), (req, res, next) => {

    // Validate and sanitise fields.
    body('pattern', 'Pattern name must not be empty.').trim().isLength({ min: 1 }).escape(),
    body('description', 'Description must not be empty.').trim().isLength({ min: 1 }).escape(),
    body('price', 'Price must not be empty').trim().isLength({ min: 1 }).escape(),
    body('category', 'Category must not be empty').trim().escape(),

    // Process request after validation and sanitization.
    (req, res, next) => {

        // Extract the validation errors from a request.
        const errors = validationResult(req);

        // Create a Book object with escaped and trimmed data.
        var item = new Item(
          { pattern: req.body.pattern,
            author: req.body.author,
            description: req.body.description,
            price: req.body.price,
            category: req.body.category,
            _id: req.params.id,
          });

        if (!errors.isEmpty()) {

            async.parallel({
              categories: function(callback) {
                Category.findById(req.params.id);
              },
            }, function(err, results) {
                if (err) { return next(err); }
                res.render('item_form', { 
                  title: 'Create Pattern', 
                  type: 'create', 
                  categories: results.categories, 
                  item: item, 
                  errors: errors.array(),
                });
            });
            return;
        }
        else {
            // Data from form is valid. Save pattern.
            item.save(function (err) {
                if (err) { return next(err); }
                  //successful - redirect to new item record.
                  res.redirect(item.url);
                });
        }

        item.patternImage = req.file.path.substring(7);
        item.save(function (err) {
          if (err) { return next(err); }
          res.redirect(item.url);
      })
    }
  }
];

// Display item delete form on GET.
exports.item_delete_get = function(req, res) {
  
  async.parallel({
    item: function(callback) {
        Item.findById(req.params.id).exec(callback)
    },
}, function(err, results) {
    if (err) { return next(err); }
    if (results.item==null) { // No results.
        res.redirect('/catalog/items');
    }
    // Successful, so render.
    res.render(
      'item_delete', 
      { title: 'Delete Item', 
      item: results.item, 
    } );
});
};

// Handle item delete on POST.
exports.item_delete_post = function(req, res) {
  Item.findByIdAndRemove(req.body.id, (err) => {
    if (err) {
      return next(err);
    }
    res.redirect('/catalog/items');
  });
};

// Display item update form on GET.
exports.item_update_get = function(req, res, next) {
  // Get all categories for form.
  async.parallel({
    item: function(callback) {
      Item.findById(req.params.id).exec(callback);
    },
    categories: function(callback) {
      Category.find(callback);
    },
  }, function(err, results) {
      if (err) { return next(err); }
      if (results.item == null) { 
        var err = new Error('Item not found');
        err.status = 404;
        return next(err);
    }
    console.log(results.item);

    res.render('item_form', { title: 'Update Pattern', categories: results.categories, item: results.item });
  });
}

exports.item_update_post = [

  // Validate and sanitise fields.
  body('pattern', 'Pattern name must not be empty.').trim().isLength({ min: 1 }).escape(),
  body('description', 'Description must not be empty.').trim().isLength({ min: 1 }).escape(),
  body('price', 'Price must not be empty').trim().isLength({ min: 1 }).escape(),
  body('category.*').escape(),

  (req, res, next) => {
    var item = new Item(
      { pattern: req.body.pattern,
        description: req.body.description,
        price: req.body.price,
        category: req.body.category,
        _id: req.params.id,
        });

        // Data from form is valid. Update the record.
        Item.findByIdAndUpdate(req.params.id, item, {}, function (err, item) {
            if (err) { return next(err); }
              res.redirect(item.url);
        }
    )
  }
]