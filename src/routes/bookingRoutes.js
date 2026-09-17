const express = require('express');
const bookingController = require('../controllers/bookingController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.post('/', bookingController.createBooking);
router.get('/my-bookings', bookingController.getMyBookings);

module.exports = router;
