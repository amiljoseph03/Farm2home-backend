const mongoose = require('mongoose');

const equipmentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'An equipment must have a name'],
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Please specify equipment category'],
      enum: [
        'Tractor',
        'Harvester',
        'Tiller',
        'Irrigation Pump',
        'Sprayer',
        'Drone',
        'Other Tools',
      ],
    },
    description: {
      type: String,
      required: [true, 'Please provide a description of the equipment'],
      trim: true,
    },
    rentalRatePerDay: {
      type: Number,
      required: [true, 'Please specify rental rate per day'],
    },
    depositAmount: {
      type: Number,
      default: 0,
    },
    images: [
      {
        type: String,
        default: 'default-equipment.jpg',
      },
    ],
    location: {
      type: String,
      required: [true, 'Please specify location where equipment is available'],
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Equipment must belong to an owner'],
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

const Equipment = mongoose.model('Equipment', equipmentSchema);
module.exports = Equipment;
