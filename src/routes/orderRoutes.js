const express = require('express');
const orderController = require('../controllers/orderController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect); // ഓർഡർ ചെയ്യാനും കാണാനും ലോഗിൻ നിർബന്ധമാണ്

router
  .route('/')
  .post(orderController.createOrder)
  .get(orderController.getMyOrders);

  // phase 11 
  // Farmer Specific Routes
router.get(
  '/farmer-orders',
  restrictTo('farmer'),
  orderController.getFarmerOrders
);

router.patch(
  '/:id/status',
  restrictTo('farmer'),
  orderController.updateOrderStatus
);


router.route('/:id').get(orderController.getOrderById);

module.exports = router;
