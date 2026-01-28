const { sequelize } = require('../config/database');
const User = require('./User');
const List = require('./List');
const Item = require('./Item');
const ListMember = require('./ListMember');

// ============================================
// VERIFY MODELS LOADED
// ============================================
console.log('📦 Loading models...');
console.log('   User:', typeof User === 'function' ? '✅' : '❌');
console.log('   List:', typeof List === 'function' ? '✅' : '❌');
console.log('   Item:', typeof Item === 'function' ? '✅' : '❌');
console.log('   ListMember:', typeof ListMember === 'function' ? '✅' : '❌');

// ============================================
// ASSOCIATIONS
// ============================================

// User <-> List (Creator)
User.hasMany(List, { foreignKey: 'createdBy', as: 'ownedLists' });
List.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });

// User <-> List (Many-to-Many through ListMember)
User.belongsToMany(List, {
  through: ListMember,
  foreignKey: 'userId',
  otherKey: 'listId',
  as: 'lists',
});
List.belongsToMany(User, {
  through: ListMember,
  foreignKey: 'listId',
  otherKey: 'userId',
  as: 'members',
});

// ListMember associations
User.hasMany(ListMember, { foreignKey: 'userId', as: 'memberships' });
ListMember.belongsTo(User, { foreignKey: 'userId', as: 'user' });

List.hasMany(ListMember, { foreignKey: 'listId', as: 'listMembers' });
ListMember.belongsTo(List, { foreignKey: 'listId', as: 'list' });

// List <-> Item
List.hasMany(Item, { foreignKey: 'listId', as: 'items', onDelete: 'CASCADE' });
Item.belongsTo(List, { foreignKey: 'listId', as: 'list' });

// User <-> Item
User.hasMany(Item, { foreignKey: 'addedBy', as: 'addedItems' });
Item.belongsTo(User, { foreignKey: 'addedBy', as: 'addedByUser' });

User.hasMany(Item, { foreignKey: 'checkedBy', as: 'checkedItems' });
Item.belongsTo(User, { foreignKey: 'checkedBy', as: 'checkedByUser' });

console.log('🔗 Associations configured');

// ============================================
// SYNC DATABASE FUNCTION
// ============================================

const syncDatabase = async () => {
  try {
    await sequelize.sync({ alter: true });
    console.log('✅ Database synchronized successfully.');
    return true;
  } catch (error) {
    console.error('❌ Error synchronizing database:', error.message);
    throw error;
  }
};

// ============================================
// EXPORTS
// ============================================

module.exports = {
  sequelize,
  User,
  List,
  Item,
  ListMember,
  syncDatabase,
};