const async = require('async');
const { body, validationResult } = require('express-validator');
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

exports.category_create_post = [

  // Validate and sanitize fields.
  body('name', 'Name must be specified').trim().isLength({ min: 1 }).escape(),
  body('description', 'Description must be specified').trim().isLength({ min: 1 }).escape(),

  // Process request after validation and sanitization.
  (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    // Create a Category object with escaped and trimmed data.
    const category = new Category(
      {
        name: req.body.name,
        description: req.body.description,
      },
    );

    if (!errors.isEmpty()) {
      // There are errors. Render form again with sanitized values and error messages.
      Book.find({}, 'title')
        .exec((err, names) => {
          if (err) { return next(err); }
          // Successful, so render.
          res.render('category_form', { title: 'Create Category', errors: errors.array(), category });
        });
    } else {
      // Data from form is valid.
      category.save((err) => {
        if (err) { return next(err); }
        // Successful - redirect to new record.
        res.redirect(category.url);
      });
    }
  },
];

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

exports.category_delete_post = function (req, res, next) {
  async.parallel({
    category(callback) {
      Category.findById(req.body.categoryid).exec(callback);
    },
    categories_products(callback) {
      Product.find({ category: req.body.categoryid }).exec(callback);
    },
  }, (err, results) => {
    if (err) { return next(err); }
    // Success
    if (results.categories_products.length > 0) {
      // Category has products. Render in same way as for GET route.
      res.render('category_delete', { title: 'Delete Category', category: results.category, category_products: results.categories_products });
    } else {
      // Category has no products. Delete object and redirect to the list of categories.
      Category.findByIdAndRemove(req.body.categoryid, (err) => {
        if (err) { return next(err); }
        // Success - go to category list
        res.redirect('/catalog/categories');
      });
    }
  });
};

exports.category_update_get = function (req, res, next) {
  Category.findById(req.params.id, (err, category) => {
    if (err) { return next(err); }
    if (category == null) { // No results.
      var err = new Error('Category not found');
      err.status = 404;
      return next(err);
    }
    // Success.
    res.render('category_form', { title: 'Update Category', category });
  });
};

exports.category_update_post = [

  // Validate and sanitize fields.
  body('name', 'Name must be specified').trim().isLength({ min: 1 }).escape(),
  body('description', 'Description must be specified').trim().isLength({ min: 1 }).escape(),

  // Process request after validation and sanitization.
  (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    // Create a Category object with escaped and trimmed data.
    const category = new Category(
      {
        name: req.body.name,
        description: req.body.description,
        _id: req.params.id,
      },
    );

    if (!errors.isEmpty()) {
      // There are errors. Render form again with sanitized values and error messages.
      Book.find({}, 'title')
        .exec((err, names) => {
          if (err) { return next(err); }
          // Successful, so render.
          res.render('category_form', { title: 'Create Category', errors: errors.array(), category });
        });
    } else {
      // Data from form is valid.
      Category.findByIdAndUpdate(req.params.id, category, {}, (err, newcategory) => {
        if (err) { return next(err); }
        // Successful - redirect to new record.
        res.redirect(newcategory.url);
      });
    }
  },
];
