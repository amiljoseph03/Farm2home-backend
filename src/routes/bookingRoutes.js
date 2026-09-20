const express = require('express');
const bookingController = require('../controllers/bookingController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect); // എല്ലാ ബുക്കിംഗ് റൂട്ടുകൾക്കും ലോഗിൻ നിർബന്ധമാണ്

// Buyer/Farmer ആർക്കും യന്ത്രങ്ങൾ ബുക്ക് ചെയ്യാം
router.post(
  '/',
  restrictTo('buyer', 'farmer', 'admin'),
  bookingController.createBooking,
);

// എന്റെ ബുക്കിംഗുകൾ ലിസ്റ്റ് ചെയ്യുക
router.get('/my-bookings', bookingController.getMyBookings);

// Farmer-മാർക്ക് തങ്ങളുടെ യന്ത്രങ്ങൾക്ക് വന്ന റിക്വസ്റ്റുകൾ കാണാൻ
router.get(
  '/owner-requests',
  restrictTo('farmer', 'admin'),
  bookingController.getOwnerBookings,
);

// Farmer-മാർക്ക് ബുക്കിംഗ് approve / reject ചെയ്യാൻ
// router.patch(
//   '/:id/status',
//   restrictTo('farmer', 'admin'),
//   bookingController.updateBookingStatus,
// );

router.patch(
  '/:id/status',
  restrictTo('farmer', 'admin'),
  bookingController.updateBookingStatus,
);

module.exports = router;
