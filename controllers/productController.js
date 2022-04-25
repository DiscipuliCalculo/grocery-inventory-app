const async = require('async');
const Product = require('../models/product');
const Category = require('../models/category');

exports.index = function (req, res) {
  async.parallel({
    product_count(callback) {
      Product.countDocuments({}, callback);
    },
    category_count(callback) {
      Category.countDocuments({}, callback);
    },
  }, (err, results) => {
    res.render('index', { title: 'Grocery Inventory App', error: err, data: results });
  });
};

exports.product_list = function (req, res) {
  res.send('NOT IMPLEMENTED: Product list');
};

exports.product_detail = function (req, res) {
  res.send('NOT IMPLEMENTED: Product details');
};

exports.product_create_get = function (req, res) {
  res.render('product_form', { title: 'Create New Product' });
};

exports.product_create__post = function (req, res) {
  res.send('NOT IMPLEMENTED:');
};

exports.product_delete_get = function (req, res) {
  res.send('NOT IMPLEMENTED:');
};

exports.product_delete_post = function (req, res) {
  res.send('NOT IMPLEMENTED:');
};

exports.product_update_get = function (req, res) {
  res.send('NOT IMPLEMENTED:');
};

exports.product_update_post = function (req, res) {
  res.send('NOT IMPLEMENTED:');
};
