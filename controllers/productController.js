const async = require('async');
const { body, validationResult } = require('express-validator');
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
  Product.find({}, 'name')
    .sort({ name: 1 })
    .exec((err, list_products) => {
      if (err) { return next(err); }
      // Successful, so render
      res.render('product_list', { title: 'Product List', product_list: list_products });
    });
};

exports.product_detail = function (req, res) {
  async.parallel({
    product(callback) {
      Product.findById(req.params.id)
        .populate('category')
        .exec(callback);
    },
  }, (err, results) => {
    if (err) { return next(err); }
    if (results.product == null) { // No results.
      var err = new Error('Product not found');
      err.status = 404;
      return next(err);
    }
    // Successful, so render.
    res.render('product_detail', { title: 'Product Details', product: results.product });
  });
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
