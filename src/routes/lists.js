const express = require('express');
const router = express.Router();
const {
  createList,
  getMyLists,
  getListById,
  joinList,
  deleteList,
} = require('../controllers/listController');
const { protect } = require('../middleware/auth');
const { validate, schemas } = require('../middleware/validate');

router.use(protect); // All routes require authentication

router.post('/', validate(schemas.createList), createList);
router.get('/', getMyLists);
router.get('/:id', getListById);
router.post('/join', validate(schemas.joinList), joinList);
router.delete('/:id', deleteList);

module.exports = router;