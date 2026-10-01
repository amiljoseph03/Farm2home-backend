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
// ---------------phase 11-------------------------------------

// 4. Farmer-ന്റെ പ്രൊഡക്റ്റുകൾ ഉള്ള ഓർഡറുകൾ മാത്രം എടുക്കുക
exports.getFarmerOrders = async (req, res, next) => {
  try {
    const farmerId = req.user._id || req.user.id;

    // ആദ്യം ഈ ഫാർമറുടെ എല്ലാ പ്രൊഡക്റ്റ് ID-കളും കണ്ടെത്തുക
    const Product = require('../models/productModel');
    const farmerProducts = await Product.find({ seller: farmerId }).select('_id');
    const productIds = farmerProducts.map((p) => p._id);

    // ആ പ്രൊഡക്റ്റ് ID-കൾ അടങ്ങിയ ഓർഡറുകൾ ഫിൽട്ടർ ചെയ്യുക
    const orders = await Order.find({ 'items.product': { $in: productIds } })
      .populate('buyer', 'name email phone')
      .populate('items.product', 'name pricePerUnit category');

    res.status(200).json({
      status: 'success',
      results: orders.length,
      data: { orders },
    });
  } catch (error) {
    next(error);
  }
};

// 5. Order Status അപ്‌ഡേറ്റ് ചെയ്യുക (Farmer Action)
exports.updateOrderStatus = async (req, res, next) => {
  try {

    console.log('--- UPDATE ORDER STATUS HIT ---'); // 👈 ഈ ലോഗ് ചേർക്കുക
    console.log('Params ID:', req.params.id);
    console.log('Body:', req.body); 
    
    const { orderStatus } = req.body;
    const allowedStatuses = ['Placed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

    if (!allowedStatuses.includes(orderStatus)) {
      return next(new AppError('Invalid order status', 400));
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { orderStatus },
      { new: true, runValidators: true }
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