const express = require('express');
const router = express.Router();
const {
  getAllItems,
  getItemById,
  searchItems,
  createItem,
  updateDutchPrice,
} = require('../controllers/catalogueController');

router.get('/items', getAllItems); // UC2.2
router.get('/items/:id', getItemById); // UC2.3
router.get('/search', searchItems); // UC2.1
router.post('/items', createItem); // UC7
router.put('/items/:id/price', updateDutchPrice); // UC8

module.exports = router;
