const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A product must have a name'],
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'A product must belong to a category'],
      enum: [
        'Vegetables',
        'Fruits',
        'Grains',
        'Pulses',
        'Spices',
        'Organic Fertilizers',
        'Seeds',
        'Other',
      ],
    },
    description: {
      type: String,
      required: [true, 'Please provide a product description'],
      trim: true,
    },
    pricePerUnit: {
      type: Number,
      required: [true, 'Please specify the price per unit'],
    },
    unit: {
      type: String,
      required: [true, 'Specify unit (e.g., kg, gram, quintal, piece, liter)'],
      default: 'kg',
    },
    quantityAvailable: {
      type: Number,
      required: [true, 'Please specify available stock quantity'],
      min: [0, 'Quantity cannot be negative'],
    },
    images: [
      {
        type: String,
        default: 'default-product.jpg',
      },
    ],
    location: {
      type: String,
      required: [true, 'Please specify the harvest/storage location'],
    },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Product must belong to a farmer/seller'],
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

const Product = mongoose.model('Product', productSchema);
module.exports = Product;
