const Order = require('../models/orderModel');
const Cart = require('../models/cartModel');
const AppError = require('../utils/appError');

// 1. കാർട്ടിലെ ഐറ്റങ്ങൾ വെച്ച് ഓർഡർ പ്ലേസ് ചെയ്യുക (Checkout)
exports.createOrder = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const { shippingAddress, paymentMethod } = req.body;

    if (!shippingAddress) {
      return next(new AppError('Shipping address is required', 400));
    }

    // യൂസറുടെ കാർട്ട് കണ്ടുപിടിക്കുക
    const cart = await Cart.findOne({ user: userId });
    if (!cart || cart.items.length === 0) {
      return next(new AppError('Your cart is empty', 400));
    }

    // കാർട്ടിലെ ഐറ്റങ്ങളെ ഓർഡറിലേക്ക് മാപ്പ് ചെയ്യുക
    const orderItems = cart.items.map((item) => ({
      product: item.product,
      quantity: item.quantity,
      pricePerUnit: item.pricePerUnit,
    }));

    // പുതിയ ഓർഡർ സൃഷ്ടിക്കുക
    const order = await Order.create({
      buyer: userId,
      items: orderItems,
      totalAmount: cart.totalAmount,
      shippingAddress,
      paymentMethod: paymentMethod || 'COD',
    });

    // ഓർഡർ സക്സസ് ആയാൽ കാർട്ട് ക്ലിയർ ചെയ്യുക
    cart.items = [];
    await cart.save();

    res.status(201).json({
      status: 'success',
      data: { order },
    });
  } catch (error) {
    next(error);
  }
};

// 2. ലോഗിൻ ചെയ്ത യൂസറുടെ ഓർഡറുകൾ എടുക്കുക
exports.getMyOrders = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const orders = await Order.find({ buyer: userId }).populate(
      'items.product',
      'name pricePerUnit category image',
    );

    res.status(200).json({
      status: 'success',
      results: orders.length,
      data: { orders },
    });
  } catch (error) {
    next(error);
  }
};

// 3. ഒറ്റ ഓർഡറിന്റെ വിവരങ്ങൾ മാത്രം എടുക്കുക
exports.getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id).populate(
      'items.product',
      'name pricePerUnit category image',
    );

    if (!order) {
      return next(new AppError('No order found with that ID', 404));
    }

    res.status(200).json({
      status: 'success',
      data: { order },
    });
  } catch (error) {
    next(error);
  }
};
// ----------------------------------------------------

