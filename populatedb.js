#! /usr/bin/env node

console.log('This script populates some test items and categories to your database. Specified database as argument - e.g.: populatedb mongodb+srv://cooluser:coolpassword@cluster0.a9azn.mongodb.net/local_library?retryWrites=true');

// Get arguments passed on command line
var userArgs = process.argv.slice(2);
var async = require('async')
var Item = require('./models/item')
var Category = require('./models/category')

var mongoose = require('mongoose');
var mongoDB = userArgs[0];
mongoose.connect(mongoDB, {useNewUrlParser: true, useUnifiedTopology: true});
mongoose.Promise = global.Promise;
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

var categories = []
var items = []

function categoryCreate(name, cb) {
  var category = new Category({ name: name });
       
  category.save(function (err) {
    if (err) {
      cb(err, null);
      return;
    }
    console.log('New Category: ' + category);
    categories.push(category)
    cb(null, category);
  }   );
}

function itemCreate(pattern, description, price, category) {
  itemdetail = { 
    pattern: pattern,
    description: description,
    price: price,
  }
  if (category != false) itemdetail.category = category
    
  var item = new Item(itemdetail);    
  item.save(function (err) {
    if (err) {
      cb(err, null)
      return
    }
    console.log('New Pattern: ' + item);
    items.push(item)
    cb(null, item)
  }  );
}

function createItems(cb) {
    async.parallel([
        function(callback) {
          itemCreate(
            '3212 Socks', 
            'Simple ribbed socks knit from cotton yarn.', 
            'Free', 
            [categories[0],],
            callback
          );
        },
        function(callback) {
          itemCreate(
            'Except for a Mouse Ornament', 
            'A Christmas ornament of a mouse in a tea cup.', 
            '$1.99',
            [categories[0],], 
            callback
          );
        },
        function(callback) {
          itemCreate(
            'Bohemian Afghan', 
            'A heavy scrap afghan knit in the round with no purling necessary.',
            '$3.99', 
            [categories[0],], 
            callback);
        }
        ],
        // optional callback
        cb);
}

