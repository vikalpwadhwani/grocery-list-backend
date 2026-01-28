const express = require('express');
const router = express.Router();
const {
  addItem,
  toggleItem,
  updateItem,
  deleteItem,
} = require('../controllers/itemController');
const { protect } = require('../middleware/auth');
const { validate, schemas } = require('../middleware/validate');

router.use(protect); // All routes require authentication

router.post('/:listId/items', validate(schemas.createItem), addItem);
router.patch('/:listId/items/:itemId/toggle', toggleItem);
router.put('/:listId/items/:itemId', validate(schemas.updateItem), updateItem);
router.delete('/:listId/items/:itemId', deleteItem);

module.exports = router;