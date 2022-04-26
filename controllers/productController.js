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
  // Get all authors and categories, which we can use for adding to our product.
  async.parallel({
    categories(callback) {
      Category.find(callback);
    },
  }, (err, results) => {
    if (err) { return next(err); }
    res.render('product_form', { title: 'Create Product', categories: results.categories });
  });
};

exports.product_create_post = [
  // Convert the category to an array.
  (req, res, next) => {
    if (!(req.body.category instanceof Array)) {
      if (typeof req.body.category === 'undefined') { req.body.category = []; } else { req.body.category = new Array(req.body.category); }
    }
    next();
  },

  // Validate and sanitize fields.
  body('name', 'Name must not be empty.').trim().isLength({ min: 1 }).escape(),
  body('description', 'Description must not be empty.').trim().isLength({ min: 1 }).escape(),
  body('price', 'Price must not be empty.').trim().isLength({ min: 1 }).escape(),
  body('number_in_stock', 'Stock must not be empty').trim().isLength({ min: 1 }).escape(),
  body('category.*').escape(),

  // Process request after validation and sanitization.
  (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    // Create a Product object with escaped and trimmed data.
    const product = new Product(
      {
        name: req.body.name,
        description: req.body.description,
        price: req.body.price,
        number_in_stock: req.body.number_in_stock,
        category: req.body.category,
      },
    );

    if (!errors.isEmpty()) {
      // There are errors. Render form again with sanitized values/error messages.

      // Get all categories for form.
      async.parallel({
        categories(callback) {
          Product.find(callback);
        },
      }, (err, results) => {
        if (err) { return next(err); }

        // Mark our selected categories as checked.
        for (let i = 0; i < results.categories.length; i++) {
          if (product.category.indexOf(results.categories[i]._id) > -1) {
            results.categories[i].checked = 'true';
          }
        }
        res.render('product_form', {
          title: 'Create Product', categories: results.categories, product, errors: errors.array(),
        });
      });
    } else {
      // Data from form is valid. Save product.
      product.save((err) => {
        if (err) { return next(err); }
        // successful - redirect to new product record.
        res.redirect(product.url);
      });
    }
  },
];

exports.product_delete_get = function (req, res) {
  async.parallel({
    product(callback) {
      Product.findById(req.params.id).exec(callback);
    },
  }, (err, results) => {
    if (err) { return next(err); }
    if (results.product == null) { // No results.
      res.redirect('/catalog/products');
    }
    // Successful, so render.
    res.render('product_delete', { title: 'Delete Product', product: results.product });
  });
};

exports.product_delete_post = function (req, res) {
  async.parallel({
    product(callback) {
      Product.findById(req.body.productid).exec(callback);
    },
  }, (err, results) => {
    if (err) { return next(err); }
    // Success
    // Product has no productinstances. Delete object and redirect to the list of products.
    Product.findByIdAndRemove(req.body.productid, (err) => {
      if (err) { return next(err); }
      // Success - go to product list
      res.redirect('/catalog/products');
    });
  });
};

exports.product_update_get = function (req, res, next) {
  // Get product, authors and categories for form.
  async.parallel({
    product(callback) {
      Product.findById(req.params.id).populate('category').exec(callback);
    },
    categories(callback) {
      Category.find(callback);
    },
  }, (err, results) => {
    if (err) { return next(err); }
    if (results.product == null) { // No results.
      var err = new Error('Product not found');
      err.status = 404;
      return next(err);
    }
    // Success.
    // Mark our selected categories as checked.
    for (let all_g_iter = 0; all_g_iter < results.categories.length; all_g_iter++) {
      for (let product_g_iter = 0; product_g_iter < results.product.category.length; product_g_iter++) {
        if (results.categories[all_g_iter]._id.toString() === results.product.category[product_g_iter]._id.toString()) {
          results.categories[all_g_iter].checked = 'true';
        }
      }
    }
    res.render('product_form', { title: 'Update Product', categories: results.categories, product: results.product });
  });
};

exports.product_update_post = [
  // Convert the category to an array.
  (req, res, next) => {
    if (!(req.body.category instanceof Array)) {
      if (typeof req.body.category === 'undefined') { req.body.category = []; } else { req.body.category = new Array(req.body.category); }
    }
    next();
  },

  // Validate and sanitize fields.
  body('name', 'Name must not be empty.').trim().isLength({ min: 1 }).escape(),
  body('description', 'Description must not be empty.').trim().isLength({ min: 1 }).escape(),
  body('price', 'Price must not be empty.').trim().isLength({ min: 1 }).escape(),
  body('number_in_stock', 'Stock must not be empty').trim().isLength({ min: 1 }).escape(),
  body('category.*').escape(),

  // Process request after validation and sanitization.
  (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    // Create a Product object with escaped and trimmed data.
    const product = new Product(
      {
        name: req.body.name,
        description: req.body.description,
        price: req.body.price,
        number_in_stock: req.body.number_in_stock,
        category: req.body.category,
        _id: req.params.id,
      },
    );

    if (!errors.isEmpty()) {
      // There are errors. Render form again with sanitized values/error messages.

      // Get all categories for form.
      async.parallel({
        categories(callback) {
          Product.find(callback);
        },
      }, (err, results) => {
        if (err) { return next(err); }

        // Mark our selected categories as checked.
        for (let i = 0; i < results.categories.length; i++) {
          if (product.category.indexOf(results.categories[i]._id) > -1) {
            results.categories[i].checked = 'true';
          }
        }
        res.render('product_form', {
          title: 'Create Product', categories: results.categories, product, errors: errors.array(),
        });
      });
    } else {
      // Data from form is valid. Save product.
      Product.findByIdAndUpdate(req.params.id, product, {}, (err, newproduct) => {
        if (err) { return next(err); }
        // Successful - redirect to new record.
        res.redirect(newproduct.url);
      });
    }
  },
];
