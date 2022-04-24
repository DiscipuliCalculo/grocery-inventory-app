const mongoose = require('mongoose');

const { Schema } = mongoose;

const ProductSchema = new Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    category: [{ type: Schema.Types.ObjectId, ref: 'Category', required: true }],
    price: { type: Number, required: true },
    number_in_stock: { type: Number, required: true },
  },
);

// Virtual for product's URL
ProductSchema
  .virtual('url')
  .get(function () {
    return `/catalog/product/${this._id}`;
  });

// Export model
module.exports = mongoose.model('Product', ProductSchema);
