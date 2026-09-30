const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: [true, 'Cart item must belong to a product'],
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: [1, 'Quantity cannot be less than 1'],
    default: 1,
  },
  pricePerUnit: {
    type: Number,
    required: true,
  },
});

const cartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Cart must belong to a user'],
      unique: true,
    },
    items: [cartItemSchema],
    totalAmount: {
      type: Number,
      required: true,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
);

// Mongoose-ൽ 'next' ഇല്ലാതെ synchronous ആയി totalAmount കണക്കാക്കാം
cartSchema.pre('save', function () {
  if (this.items && this.items.length > 0) {
    this.totalAmount = this.items.reduce(
      (total, item) => total + item.quantity * item.pricePerUnit,
      0,
    );
  } else {
    this.totalAmount = 0;
  }
});

const Cart = mongoose.model('Cart', cartSchema);
module.exports = Cart;
