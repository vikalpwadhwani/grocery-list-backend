const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Item = sequelize.define('Item', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  quantity: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
  },
  unit: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
  isChecked: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'is_checked',
  },
  listId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'list_id',
  },
  addedBy: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'added_by',
  },
  checkedBy: {
    type: DataTypes.UUID,
    allowNull: true,
    field: 'checked_by',
  },
}, {
  tableName: 'items',
  timestamps: true,
});

module.exports = Item;