const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    equipment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Equipment',
      required: [true, 'Booking must belong to an Equipment'],
    },
    renter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Booking must belong to a Renter'],
    },
    startDate: {
      type: Date,
      required: [true, 'Please provide booking start date'],
    },
    endDate: {
      type: Date,
      required: [true, 'Please provide booking end date'],
    },
    totalDays: {
      type: Number,
      required: true,
    },
    totalPrice: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'cancelled', 'completed'],
      default: 'pending',
    },
  },
  { timestamps: true },
);

const Booking = mongoose.model('Booking', bookingSchema);
module.exports = Booking;
