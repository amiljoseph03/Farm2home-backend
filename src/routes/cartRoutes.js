const express = require('express');
const cartController = require('../controllers/cartController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect); // കാർട്ട് ഉപയോഗിക്കാൻ ലോഗിൻ നിർബന്ധമാണ്

router
  .route('/')
  .get(cartController.getCart)
  .post(cartController.addToCart)
  .delete(cartController.clearCart);

router.delete('/:productId', cartController.removeFromCart);

module.exports = router;
