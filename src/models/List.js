const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const { generateInviteCode } = require('../utils/generateCode');

const List = sequelize.define('List', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  inviteCode: {
    type: DataTypes.STRING(10),
    unique: true,
    field: 'invite_code',
  },
  createdBy: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'created_by',
  },
}, {
  tableName: 'lists',
  timestamps: true,
});

List.beforeCreate((list) => {
  if (!list.inviteCode) {
    list.inviteCode = generateInviteCode(6);
  }
});

module.exports = List;