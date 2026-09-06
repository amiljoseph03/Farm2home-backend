const Product = require('../models/productModel');
const AppError = require('../utils/appError');

// 1. പുതിയ പ്രോഡക്റ്റ് ഉണ്ടാക്കുക (Farmers & Admin only)
exports.createProduct = async (req, res, next) => {
  try {
    // പ്രോഡക്റ്റ് ഉണ്ടാക്കുന്ന ആളുടെ ID (JWT Protect Middleware വഴി ലഭിക്കുന്നത്)
    req.body.seller = req.user.id;

    const newProduct = await Product.create(req.body);

    res.status(201).json({
      status: 'success',
      data: {
        product: newProduct,
      },
    });
  } catch (error) {
    next(error);
  }
};

// 2. എല്ലാ പ്രോഡക്റ്റുകളും എടുക്കുക (Public Endpoint)
exports.getAllProducts = async (req, res, next) => {
  try {
    const products = await Product.find({ isAvailable: true }).populate(
      'seller',
      'name phone email',
    );

    res.status(200).json({
      status: 'success',
      results: products.length,
      data: {
        products,
      },
    });
  } catch (error) {
    next(error);
  }
};

// 3. ഒറ്റ പ്രോഡക്റ്റിന്റെ വിവരങ്ങൾ എടുക്കുക (Public Endpoint)
exports.getProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id).populate(
      'seller',
      'name phone email',
    );

    if (!product) {
      return next(new AppError('No product found with that ID', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        product,
      },
    });
  } catch (error) {
    next(error);
  }
};

// 4. പ്രോഡക്റ്റ് അപ്‌ഡേറ്റ് ചെയ്യുക (Owner Seller / Admin only)
exports.updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return next(new AppError('No product found with that ID', 404));
    }

    // കർഷകന് സ്വന്തം പ്രോഡക്റ്റ് മാത്രമേ മാറ്റാൻ അനുവാദമുള്ളൂ (Admin-ന് എല്ലാം മാറ്റാം)
    if (
      product.seller.toString() !== req.user.id &&
      req.user.role !== 'admin'
    ) {
      return next(
        new AppError('You do not have permission to edit this product', 403),
      );
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      },
    );

    res.status(200).json({
      status: 'success',
      data: {
        product: updatedProduct,
      },
    });
  } catch (error) {
    next(error);
  }
};

// 5. പ്രോഡക്റ്റ് ഡിലീറ്റ് ചെയ്യുക (Owner Seller / Admin only)
exports.deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return next(new AppError('No product found with that ID', 404));
    }

    if (
      product.seller.toString() !== req.user.id &&
      req.user.role !== 'admin'
    ) {
      return next(
        new AppError('You do not have permission to delete this product', 403),
      );
    }

    await Product.findByIdAndDelete(req.params.id);

    res.status(204).json({
      status: 'success',
      data: null,
    });
  } catch (error) {
    next(error);
  }
};
