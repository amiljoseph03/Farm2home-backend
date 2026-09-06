const express = require('express');
const productController = require('../controllers/productController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

const router = express.Router();

// Public Routes (ആര്‍ക്കും കാണാം)
router.get('/', productController.getAllProducts);
router.get('/:id', productController.getProduct);

// Protected Routes (ലോഗിൻ ചെയ്ത കർഷകർക്കും അഡ്മിനും മാത്രം)
router.use(protect);

router.post(
  '/',
  restrictTo('farmer', 'admin'),
  productController.createProduct,
);
router.patch(
  '/:id',
  restrictTo('farmer', 'admin'),
  productController.updateProduct,
);
router.delete(
  '/:id',
  restrictTo('farmer', 'admin'),
  productController.deleteProduct,
);

module.exports = router;
