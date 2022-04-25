#! /usr/bin/env node

console.log('This script populates some test products, and categories to your database. Specified database as argument - e.g.: populatedb mongodb+srv://cooluser:coolpassword@cluster0.a9azn.mongodb.net/local_library?retryWrites=true');

// Get arguments passed on command line
const userArgs = process.argv.slice(2);
/*
if (!userArgs[0].startsWith('mongodb')) {
    console.log('ERROR: You need to specify a valid mongodb URL as the first argument');
    return
}
*/
const async = require('async');
const mongoose = require('mongoose');
const Product = require('./models/product');
const Category = require('./models/category');

const mongoDB = userArgs[0];
mongoose.connect(mongoDB, { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.Promise = global.Promise;
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

const categories = [];
const products = [];

function categoryCreate(name, description, cb) {
  const category = new Category({ name, description });

  category.save((err) => {
    if (err) {
      cb(err, null);
      return;
    }
    console.log(`New Category: ${category}`);
    categories.push(category);
    cb(null, category);
  });
}

function productCreate(name, description, price, number_in_stock, category, cb) {
  const productdetail = {
    name,
    description,
    number_in_stock,
    price,
  };
  if (category !== false) productdetail.category = category;

  const product = new Product(productdetail);
  product.save((err) => {
    if (err) {
      cb(err, null);
      return;
    }
    console.log(`New Product: ${product}`);
    products.push(product);
    cb(null, product);
  });
}

function createCategory(cb) {
  async.series(
    [
      function (callback) {
        categoryCreate('Produce', 'Farm-produced crops, including fruits and vegetables.', callback);
      },
      function (callback) {
        categoryCreate('Meat', 'Animal flesh that is eaten as food', callback);
      },
      function (callback) {
        categoryCreate('Baked Goods', 'Foods made from dough or batter and cooked by baking', callback);
      },
    ],
    // optional callback
    cb,
  );
}

function createProducts(cb) {
  async.parallel(
    [
      function (callback) {
        productCreate('Bread', 'Freshly baked bread', 1.50, 40, [categories[2]], callback);
      },
      function (callback) {
        productCreate('Empanada', 'Empanadas made fresh by Abuella', 3.00, 12, [categories[1], categories[2]], callback);
      },
      function (callback) {
        productCreate('Apple Pie', 'Pie made with tart apples and the sweetest sugar', 5, 15, [categories[0], categories[2]], callback);
      },
      function (callback) {
        productCreate('A5 Wagyu', 'The best steak from Japan', 135, 0, [categories[1]], callback);
      },
      function (callback) {
        productCreate('Romaine', 'This stuff always has some CDC warning', 2.99, 12, [categories[0]], callback);
      },
      function (callback) {
        productCreate('Test Product 1', 'Generic Text', 1, 100, [categories[2]], callback);
      },
      function (callback) {
        productCreate('Test Product 2', 'Generic Text', 4, 0, [categories[1]], callback);
      },
    ],
    // optional callback
    cb,
  );
}

async.series(
  [
    createCategory,
    createProducts,
  ],
  // Optional callback
  (err, results) => {
    if (err) {
      console.log(`FINAL ERR: ${err}`);
    }
    // All done, disconnect from database
    mongoose.connection.close();
  },
);
