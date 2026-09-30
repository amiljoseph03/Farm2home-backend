const Cart = require('../models/cartModel');
const Product = require('../models/productModel');
const AppError = require('../utils/appError');

// 1. ലോഗിൻ ചെയ്ത യൂസറുടെ കാർട്ട് വിവരങ്ങൾ എടുക്കാൻ
exports.getCart = async (req, res, next) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id }).populate(
      'items.product',
      'name pricePerUnit category image',
    );

    if (!cart) {
      cart = await Cart.create({
        user: req.user._id,
        items: [],
        totalAmount: 0,
      });
    }

    res.status(200).json({
      status: 'success',
      data: { cart },
    });
  } catch (error) {
    next(error);
  }
};

// 2. പ്രൊഡക്റ്റ് കാർട്ടിലേക്ക് ചേർക്കാൻ (അല്ലെങ്കിൽ Quantity കൂട്ടാൻ)
exports.addToCart = async (req, res, next) => {
  try {
    const { productId, quantity } = req.body;
    const qty = Number(quantity) || 1;

    // പ്രൊഡക്റ്റ് നിലവിലുണ്ടോ എന്ന് പരിശോധിക്കുക
    const product = await Product.findById(productId);
    if (!product) {
      return next(new AppError('No product found with that ID', 404));
    }

    let cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      cart = new Cart({ user: req.user._id, items: [] });
    }

    // പ്രൊഡക്റ്റ് മുൻപേ കാർട്ടിൽ ഉണ്ടോ എന്ന് നോക്കുക
    const itemIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId,
    );

    if (itemIndex > -1) {
      cart.items[itemIndex].quantity += qty;
    } else {
      cart.items.push({
        product: productId,
        quantity: qty,
        pricePerUnit: product.pricePerUnit,
      });
    }

    await cart.save();
    await cart.populate('items.product', 'name pricePerUnit category image');

    res.status(200).json({
      status: 'success',
      data: { cart },
    });
  } catch (error) {
    next(error);
  }
};

// 3. ഒറ്റ പ്രൊഡക്റ്റ് കാർട്ടിൽ നിന്ന് നീക്കം ചെയ്യാൻ
exports.removeFromCart = async (req, res, next) => {
  try {
    const { productId } = req.params;

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return next(new AppError('Cart not found', 404));
    }

    cart.items = cart.items.filter(
      (item) => item.product.toString() !== productId,
    );

    await cart.save();
    await cart.populate('items.product', 'name pricePerUnit category image');

    res.status(200).json({
      status: 'success',
      data: { cart },
    });
  } catch (error) {
    next(error);
  }
};

// 4. കാർട്ട് പൂർണ്ണമായും ക്ലിയർ ചെയ്യാൻ
exports.clearCart = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (cart) {
      cart.items = [];
      await cart.save();
    }

    res.status(200).json({
      status: 'success',
      message: 'Cart cleared successfully',
      data: { cart },
    });
  } catch (error) {
    next(error);
  }
};
