const Booking = require('../models/bookingModel');
const Equipment = require('../models/equipmentModel');
const AppError = require('../utils/appError');

// 1. പുതിയ ബുക്കിംഗ് ക്രിയേറ്റ് ചെയ്യുക
exports.createBooking = async (req, res, next) => {
  try {
    const { equipmentId, startDate, endDate } = req.body;

    const equipment = await Equipment.findById(equipmentId);
    if (!equipment || !equipment.isAvailable) {
      return next(new AppError('Equipment is not available for booking', 400));
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    const totalDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));

    if (totalDays <= 0) {
      return next(new AppError('End date must be after start date', 400));
    }

    const totalPrice = totalDays * equipment.rentalRatePerDay;

    const booking = await Booking.create({
      equipment: equipmentId,
      renter: req.user.id,
      startDate,
      endDate,
      totalDays,
      totalPrice,
    });

    res.status(201).json({
      status: 'success',
      data: { booking },
    });
  } catch (error) {
    next(error);
  }
};

// 2. ലോഗിൻ ചെയ്ത ആളുടെ ബുക്കിംഗുകൾ കാണുക
exports.getMyBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find({ renter: req.user.id }).populate(
      'equipment',
    );

    res.status(200).json({
      status: 'success',
      results: bookings.length,
      data: { bookings },
    });
  } catch (error) {
    next(error);
  }
};
