const Product = require('../models/productModel');
const AppError = require('../utils/appError');
const APIFeatures = require('../utils/apiFeatures');

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
// exports.getAllProducts = async (req, res, next) => {
//   try {
//     const products = await Product.find({ isAvailable: true }).populate(
//       'seller',
//       'name phone email',
//     );

//     res.status(200).json({
//       status: 'success',
//       results: products.length,
//       data: {
//         products,
//       },
//     });
//   } catch (error) {
//     next(error);
//   }
// };
//....
// exports.getAllProducts = async (req, res, next) => {
//   try {
//     // APIFeatures ഉപയോഗിച്ച് query chain ചെയ്യുന്നു
//     const features = new APIFeatures(Product.find(), req.query)
//       .filter()
//       .sort()
//       .limitFields()
//       .paginate();

//     const products = await features.query.populate(
//       'farmer',
//       'name email phone',
//     );

//     res.status(200).json({
//       status: 'success',
//       results: products.length,
//       data: { products },
//     });
//   } catch (error) {
//     next(error);
//   }
// };
//.............

// exports.getAllProducts = async (req, res, next) => {
//   try {
//     const queryObj = { ...req.query };

//     // 1) Category പ്രത്യേകം ഫിൽട്ടർ ചെയ്യാൻ വേണ്ടി queryObj-യിൽ നിന്ന് മാറ്റിനിർത്തുക
//     const category = queryObj.category;
//     delete queryObj.category;

//     // 2) Advanced filtering (gte, gt, lte, lt)
//     let queryStr = JSON.stringify(queryObj);
//     queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
//     let filter = JSON.parse(queryStr);

//     // 3) Case-insensitive category filter ചേർക്കുക
//     if (category) {
//       filter.category = { $regex: category, $options: 'i' };
//     }

//     const products = await Product.find(filter);

//     res.status(200).json({
//       status: 'success',
//       results: products.length,
//       data: { products },
//     });
//   } catch (error) {
//     next(error);
//   }
// };

exports.getAllProducts = async (req, res, next) => {
  try {
    const queryObj = { ...req.query };

    // 1. Excluded fields for basic query
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach((el) => delete queryObj[el]);

    // 2. Extract Category (for case-insensitive regex)
    const category = queryObj.category;
    delete queryObj.category;

    // 3. Map 'price' to 'pricePerUnit' if passed
    if (queryObj.price) {
      queryObj.pricePerUnit = queryObj.price;
      delete queryObj.price;
    }

    // 4. Advanced Filtering (gte, gt, lte, lt)
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

    let filter = JSON.parse(queryStr);

    // 5. Add Category Regex filter if present
    if (category) {
      filter.category = { $regex: category, $options: 'i' };
    }

    // 🔍 Debugging log to see the exact MongoDB filter
    console.log('MongoDB Filter Applied:', filter);

    const products = await Product.find(filter);

    res.status(200).json({
      status: 'success',
      results: products.length,
      data: { products },
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
