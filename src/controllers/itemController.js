const { Item, List, ListMember, User } = require('../models');
const { getIO } = require('../config/socket');
const { sendSuccess, sendCreated, sendBadRequest, sendNotFound } = require('../utils/responseHandler');

// Helper: Check if user is member of list
const checkListMembership = async (userId, listId) => {
  const membership = await ListMember.findOne({
    where: { userId, listId },
  });
  return membership;
};

// @desc    Add item to list
// @route   POST /api/lists/:listId/items
const addItem = async (req, res) => {
  try {
    const { listId } = req.params;
    const { name, quantity, unit } = req.body;
    const userId = req.user.id;

    const membership = await checkListMembership(userId, listId);
    if (!membership) {
      return sendNotFound(res, 'List not found or access denied');
    }

    const item = await Item.create({
      name,
      quantity: quantity || 1,
      unit: unit || null,
      listId,
      addedBy: userId,
    });

    const itemWithUser = await Item.findByPk(item.id, {
      include: [
        { model: User, as: 'addedByUser', attributes: ['id', 'name'] },
      ],
    });

    // Real-time broadcast
    const io = getIO();
    io.to(`list-${listId}`).emit('item-added', {
      listId,
      item: itemWithUser,
    });

    return sendCreated(res, { item: itemWithUser }, 'Item added successfully');
  } catch (error) {
    console.error('Add item error:', error);
    return sendBadRequest(res, error.message);
  }
};

// @desc    Toggle item checked status
// @route   PATCH /api/lists/:listId/items/:itemId/toggle
const toggleItem = async (req, res) => {
  try {
    const { listId, itemId } = req.params;
    const userId = req.user.id;

    const membership = await checkListMembership(userId, listId);
    if (!membership) {
      return sendNotFound(res, 'List not found or access denied');
    }

    const item = await Item.findOne({
      where: { id: itemId, listId },
    });

    if (!item) {
      return sendNotFound(res, 'Item not found');
    }

    // Toggle the checked status
    item.isChecked = !item.isChecked;
    item.checkedBy = item.isChecked ? userId : null;
    await item.save();

    const itemWithUser = await Item.findByPk(item.id, {
      include: [
        { model: User, as: 'addedByUser', attributes: ['id', 'name'] },
        { model: User, as: 'checkedByUser', attributes: ['id', 'name'] },
      ],
    });

    // Real-time broadcast
    const io = getIO();
    io.to(`list-${listId}`).emit('item-toggled', {
      listId,
      item: itemWithUser,
    });

    return sendSuccess(res, { item: itemWithUser }, 'Item toggled successfully');
  } catch (error) {
    console.error('Toggle item error:', error);
    return sendBadRequest(res, error.message);
  }
};

// @desc    Update item
// @route   PUT /api/lists/:listId/items/:itemId
const updateItem = async (req, res) => {
  try {
    const { listId, itemId } = req.params;
    const { name, quantity, unit, isChecked } = req.body;
    const userId = req.user.id;

    const membership = await checkListMembership(userId, listId);
    if (!membership) {
      return sendNotFound(res, 'List not found or access denied');
    }

    const item = await Item.findOne({
      where: { id: itemId, listId },
    });

    if (!item) {
      return sendNotFound(res, 'Item not found');
    }

    // Update fields
    if (name !== undefined) item.name = name;
    if (quantity !== undefined) item.quantity = quantity;
    if (unit !== undefined) item.unit = unit;
    if (isChecked !== undefined) {
      item.isChecked = isChecked;
      item.checkedBy = isChecked ? userId : null;
    }

    await item.save();

    const itemWithUser = await Item.findByPk(item.id, {
      include: [
        { model: User, as: 'addedByUser', attributes: ['id', 'name'] },
        { model: User, as: 'checkedByUser', attributes: ['id', 'name'] },
      ],
    });

    // Real-time broadcast
    const io = getIO();
    io.to(`list-${listId}`).emit('item-updated', {
      listId,
      item: itemWithUser,
    });

    return sendSuccess(res, { item: itemWithUser }, 'Item updated successfully');
  } catch (error) {
    console.error('Update item error:', error);
    return sendBadRequest(res, error.message);
  }
};

// @desc    Delete item
// @route   DELETE /api/lists/:listId/items/:itemId
const deleteItem = async (req, res) => {
  try {
    const { listId, itemId } = req.params;
    const userId = req.user.id;

    const membership = await checkListMembership(userId, listId);
    if (!membership) {
      return sendNotFound(res, 'List not found or access denied');
    }

    const item = await Item.findOne({
      where: { id: itemId, listId },
    });

    if (!item) {
      return sendNotFound(res, 'Item not found');
    }

    await item.destroy();

    // Real-time broadcast
    const io = getIO();
    io.to(`list-${listId}`).emit('item-deleted', {
      listId,
      itemId,
    });

    return sendSuccess(res, null, 'Item deleted successfully');
  } catch (error) {
    console.error('Delete item error:', error);
    return sendBadRequest(res, error.message);
  }
};

module.exports = {
  addItem,
  toggleItem,
  updateItem,
  deleteItem,
};