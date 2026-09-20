const Equipment = require('../models/equipmentModel');
const AppError = require('../utils/appError');
const APIFeatures = require('../utils/apiFeatures');

// 1. പുതിയ ഇക്വിപ്മെന്റ് വാടകയ്ക്ക് ലിസ്റ്റ് ചെയ്യുക
exports.createEquipment = async (req, res, next) => {
  try {
    req.body.owner = req.user.id;

    const newEquipment = await Equipment.create(req.body);

    res.status(201).json({
      status: 'success',
      data: {
        equipment: newEquipment,
      },
    });
  } catch (error) {
    next(error);
  }
};

// 2. ലഭ്യമായ എല്ലാ യന്ത്രങ്ങളും കാണുക
// exports.getAllEquipment = async (req, res, next) => {
//   try {
//     const equipment = await Equipment.find({ isAvailable: true }).populate(
//       'owner',
//       'name phone email',
//     );

//     res.status(200).json({
//       status: 'success',
//       results: equipment.length,
//       data: {
//         equipment,
//       },
//     });
//   } catch (error) {
//     next(error);
//   }
// };
exports.getAllEquipment = async (req, res, next) => {
  try {
    const features = new APIFeatures(
      Equipment.find({ isAvailable: true }),
      req.query,
    )
      .filter()
      .sort()
      .limitFields()
      .paginate();

    const equipment = await features.query.populate(
      'owner',
      'name email phone',
    );

    res.status(200).json({
      status: 'success',
      results: equipment.length,
      data: { equipment },
    });
  } catch (error) {
    next(error);
  }
};

// 3. ഒറ്റ ഇക്വിപ്മെന്റിന്റെ വിവരങ്ങൾ എടുക്കുക
exports.getEquipment = async (req, res, next) => {
  try {
    const equipment = await Equipment.findById(req.params.id).populate(
      'owner',
      'name phone email',
    );

    if (!equipment) {
      return next(new AppError('No equipment found with that ID', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        equipment,
      },
    });
  } catch (error) {
    next(error);
  }
};

// 4. ഇക്വിപ്മെന്റ് വിവരങ്ങൾ മാറ്റുക (Owner / Admin only)
exports.updateEquipment = async (req, res, next) => {
  try {
    const equipment = await Equipment.findById(req.params.id);

    if (!equipment) {
      return next(new AppError('No equipment found with that ID', 404));
    }

    if (
      equipment.owner.toString() !== req.user.id &&
      req.user.role !== 'admin'
    ) {
      return next(
        new AppError(
          'You do not have permission to update this equipment',
          403,
        ),
      );
    }

    const updatedEquipment = await Equipment.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      },
    );

    res.status(200).json({
      status: 'success',
      data: {
        equipment: updatedEquipment,
      },
    });
  } catch (error) {
    next(error);
  }
};

// 5. ഇക്വിപ്മെന്റ് ഡിലീറ്റ് ചെയ്യുക (Owner / Admin only)
exports.deleteEquipment = async (req, res, next) => {
  try {
    const equipment = await Equipment.findById(req.params.id);

    if (!equipment) {
      return next(new AppError('No equipment found with that ID', 404));
    }

    if (
      equipment.owner.toString() !== req.user.id &&
      req.user.role !== 'admin'
    ) {
      return next(
        new AppError(
          'You do not have permission to delete this equipment',
          403,
        ),
      );
    }

    await Equipment.findByIdAndDelete(req.params.id);

    res.status(204).json({
      status: 'success',
      data: null,
    });
  } catch (error) {
    next(error);
  }
};
