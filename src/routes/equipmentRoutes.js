const express = require('express');
const equipmentController = require('../controllers/equipmentController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', equipmentController.getAllEquipment);
router.get('/:id', equipmentController.getEquipment);

router.use(protect);

router.post(
  '/',
  restrictTo('farmer', 'admin'),
  equipmentController.createEquipment,
);
router.patch(
  '/:id',
  restrictTo('farmer', 'admin'),
  equipmentController.updateEquipment,
);
router.delete(
  '/:id',
  restrictTo('farmer', 'admin'),
  equipmentController.deleteEquipment,
);

module.exports = router;
