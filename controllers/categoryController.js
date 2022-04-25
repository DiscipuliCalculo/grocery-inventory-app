const async = require('async');
const Category = require('../models/category');
const Product = require('../models/product');

exports.category_list = function (req, res) {
  Category.find({})
    .sort([['name', 'ascending']])
    .exec((err, list_categories) => {
      if (err) { return next(err); }
      // Successful, so render

      res.render('category_list', { title: 'Category List', category_list: list_categories });
    });
};

exports.category_detail = function (req, res, next) {
  async.parallel({
    category(callback) {
      Category.findById(req.params.id)
        .exec(callback);
    },

    category_products(callback) {
      Product.find({ category: req.params.id })
        .exec(callback);
    },

  }, (err, results) => {
    if (err) { return next(err); }
    if (results.category == null) { // No results.
      var err = new Error('Category not found');
      err.status = 404;
      return next(err);
    }
    // Successful, so render
    res.render('category_detail', { title: 'Category Detail', category: results.category, category_products: results.category_products });
  });
};

exports.category_create_get = function (req, res) {
  res.render('category_form', { title: 'Create New Category' });
};

exports.category_create__post = function (req, res, next) {
  res.send('NOT IMPLEMENTED:');
};

exports.category_delete_get = function (req, res, next) {
  async.parallel({
    category(callback) {
      Category.findById(req.params.id).exec(callback);
    },
    category_products(callback) {
      Product.find({ category: req.params.id }).exec(callback);
    },
  }, (err, results) => {
    if (err) { return next(err); }
    if (results.category === null) {
      res.redirect('/catalog/catagories');
    }
    res.render('category_delete', { title: 'Delete Category', category: results.category, category_products: results.category_products });
  });
};

exports.category_delete_post = function (req, res) {
  res.send('NOT IMPLEMENTED:');
};

exports.category_update_get = function (req, res) {
  res.send('NOT IMPLEMENTED:');
};

exports.category_update_post = function (req, res) {
  res.send('NOT IMPLEMENTED:');
};
