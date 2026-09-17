const Booking = require('../models/bookingModel');
const Equipment = require('../models/equipmentModel');
const AppError = require('../utils/appError');

// 1. പുതിയ ബുക്കിംഗ് ക്രിയേറ്റ് ചെയ്യുക (Buyers/Farmers ലേക്ക് അനുവാദം)
exports.createBooking = async (req, res, next) => {
  try {
    const { equipmentId, startDate, endDate } = req.body;

    const equipment = await Equipment.findById(equipmentId);
    if (!equipment) {
      return next(new AppError('No equipment found with that ID', 404));
    }

    if (!equipment.isAvailable) {
      return next(
        new AppError('Equipment is currently not available for rent', 400),
      );
    }

    // സ്വന്തം ഇക്വിപ്മെന്റ് സ്വന്തമായി ബുക്ക് ചെയ്യുന്നത് തടയാൻ
    if (equipment.owner.toString() === req.user.id) {
      return next(new AppError('You cannot book your own equipment', 400));
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
      renter: req.user.id, // Buyer-ുടെ ID ഇവിടെ റന്ററായി സേവ് ആകും
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

// 2. ലോഗിൻ ചെയ്ത യൂസർ (Buyer/Farmer) നടത്തിയ ബുക്കിംഗുകൾ കാണുക
exports.getMyBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find({ renter: req.user.id })
      .populate('equipment', 'name category rentalRatePerDay location images')
      .sort('-createdAt');

    res.status(200).json({
      status: 'success',
      results: bookings.length,
      data: { bookings },
    });
  } catch (error) {
    next(error);
  }
};

// 3. യന്ത്രത്തിന്റെ ഉടമയ്ക്ക് (Farmer) തനിക്ക് വന്ന ബുക്കിംഗ് റിക്വസ്റ്റുകൾ കാണാൻ
exports.getOwnerBookings = async (req, res, next) => {
  try {
    // ആദ്യം ഈ ഫാർമറുടെ എല്ലാ യന്ത്രങ്ങളും കണ്ടെത്തുക
    const myEquipment = await Equipment.find({ owner: req.user.id });
    const equipmentIds = myEquipment.map((item) => item._id);

    // ആ യന്ത്രങ്ങൾക്കായി വന്ന ബുക്കിംഗുകൾ അഗ്രിഗേറ്റ് ചെയ്യുക
    const requests = await Booking.find({ equipment: { $in: equipmentIds } })
      .populate('renter', 'name email phone')
      .populate('equipment', 'name category');

    res.status(200).json({
      status: 'success',
      results: requests.length,
      data: { requests },
    });
  } catch (error) {
    next(error);
  }
};

// 4. ബുക്കിംഗ് സ്റ്റാറ്റസ് മാറ്റാൻ (Owner Update: Approved/Rejected)
exports.updateBookingStatus = async (req, res, next) => {
  try {
    const { status } = req.body; // 'approved' or 'rejected'
    const booking = await Booking.findById(req.params.id).populate('equipment');

    if (!booking) {
      return next(new AppError('No booking found with that ID', 404));
    }

    // ഇക്വിപ്മെന്റിന്റെ ഉടമയ്ക്ക് മാത്രമേ സ്റ്റാറ്റസ് മാറ്റാൻ അധികാരമുള്ളൂ
    if (
      booking.equipment.owner.toString() !== req.user.id &&
      req.user.role !== 'admin'
    ) {
      return next(
        new AppError('You are not authorized to manage this booking', 403),
      );
    }

    booking.status = status;
    await booking.save();

    res.status(200).json({
      status: 'success',
      data: { booking },
    });
  } catch (error) {
    next(error);
  }
};
