const { List, ListMember, User, Item } = require('../models');
const { getIO } = require('../config/socket');
const { sendSuccess, sendCreated, sendBadRequest, sendNotFound } = require('../utils/responseHandler');

// @desc    Create a new list
// @route   POST /api/lists
const createList = async (req, res) => {
  try {
    const { name } = req.body;
    const userId = req.user.id;

    const list = await List.create({
      name,
      createdBy: userId,
    });

    await ListMember.create({
      userId,
      listId: list.id,
      role: 'owner',
    });

    const listWithDetails = await List.findByPk(list.id, {
      include: [
        { model: User, as: 'creator', attributes: ['id', 'name', 'email'] },
      ],
    });

    return sendCreated(res, { list: listWithDetails }, 'List created successfully');
  } catch (error) {
    console.error('Create list error:', error);
    return sendBadRequest(res, error.message);
  }
};

// @desc    Get all lists for current user
// @route   GET /api/lists
const getMyLists = async (req, res) => {
  try {
    const userId = req.user.id;

    const memberships = await ListMember.findAll({
      where: { userId },
      include: [
        {
          model: List,
          as: 'list',
          include: [
            { model: User, as: 'creator', attributes: ['id', 'name', 'email'] },
            { model: Item, as: 'items' },
          ],
        },
      ],
    });

    const lists = memberships.map((m) => ({
      ...m.list.toJSON(),
      role: m.role,
      itemCount: m.list.items ? m.list.items.length : 0,
      checkedCount: m.list.items ? m.list.items.filter((i) => i.isChecked).length : 0,
    }));

    return sendSuccess(res, { lists }, 'Lists fetched successfully');
  } catch (error) {
    console.error('Get lists error:', error);
    return sendBadRequest(res, error.message);
  }
};

// @desc    Get single list with items
// @route   GET /api/lists/:id
const getListById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const membership = await ListMember.findOne({
      where: { userId, listId: id },
    });

    if (!membership) {
      return sendNotFound(res, 'List not found or access denied');
    }

    const list = await List.findByPk(id, {
      include: [
        { model: User, as: 'creator', attributes: ['id', 'name', 'email'] },
        {
          model: Item,
          as: 'items',
          include: [
            { model: User, as: 'addedByUser', attributes: ['id', 'name'] },
            { model: User, as: 'checkedByUser', attributes: ['id', 'name'] },
          ],
          order: [['createdAt', 'DESC']],
        },
        {
          model: ListMember,
          as: 'listMembers',
          include: [{ model: User, as: 'user', attributes: ['id', 'name', 'email'] }],
        },
      ],
    });

    return sendSuccess(res, { list, role: membership.role }, 'List fetched successfully');
  } catch (error) {
    console.error('Get list error:', error);
    return sendBadRequest(res, error.message);
  }
};

// @desc    Join a list using invite code
// @route   POST /api/lists/join
const joinList = async (req, res) => {
  try {
    const { inviteCode } = req.body;
    const userId = req.user.id;

    const list = await List.findOne({ where: { inviteCode: inviteCode.toUpperCase() } });
    if (!list) {
      return sendNotFound(res, 'Invalid invite code');
    }

    const existingMember = await ListMember.findOne({
      where: { userId, listId: list.id },
    });

    if (existingMember) {
      return sendBadRequest(res, 'You are already a member of this list');
    }

    await ListMember.create({
      userId,
      listId: list.id,
      role: 'member',
    });

    const listWithDetails = await List.findByPk(list.id, {
      include: [
        { model: User, as: 'creator', attributes: ['id', 'name', 'email'] },
      ],
    });

    // Notify other members
    const io = getIO();
    io.to(`list-${list.id}`).emit('member-joined', {
      listId: list.id,
      user: req.user.toJSON(),
    });

    return sendSuccess(res, { list: listWithDetails }, 'Joined list successfully');
  } catch (error) {
    console.error('Join list error:', error);
    return sendBadRequest(res, error.message);
  }
};

// @desc    Delete a list (owner only)
// @route   DELETE /api/lists/:id
const deleteList = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const membership = await ListMember.findOne({
      where: { userId, listId: id, role: 'owner' },
    });

    if (!membership) {
      return sendNotFound(res, 'List not found or you are not the owner');
    }

    await Item.destroy({ where: { listId: id } });
    await ListMember.destroy({ where: { listId: id } });
    await List.destroy({ where: { id } });

    // Notify members
    const io = getIO();
    io.to(`list-${id}`).emit('list-deleted', { listId: id });

    return sendSuccess(res, null, 'List deleted successfully');
  } catch (error) {
    console.error('Delete list error:', error);
    return sendBadRequest(res, error.message);
  }
};

module.exports = {
  createList,
  getMyLists,
  getListById,
  joinList,
  deleteList,
};