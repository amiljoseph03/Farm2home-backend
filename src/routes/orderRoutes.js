const express = require('express');
const orderController = require('../controllers/orderController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect); // ഓർഡർ ചെയ്യാനും കാണാനും ലോഗിൻ നിർബന്ധമാണ്

router
  .route('/')
  .post(orderController.createOrder)
  .get(orderController.getMyOrders);

router.route('/:id').get(orderController.getOrderById);

module.exports = router;
