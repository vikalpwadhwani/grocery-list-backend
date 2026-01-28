const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const ListMember = sequelize.define('ListMember', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'user_id',
  },
  listId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'list_id',
  },
  role: {
    type: DataTypes.ENUM('owner', 'member'),
    defaultValue: 'member',
  },
}, {
  tableName: 'list_members',
  timestamps: true,
});

module.exports = ListMember;