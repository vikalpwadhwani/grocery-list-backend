console.log('🚀 Debug script starting...');

// Load environment variables manually
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

console.log('📁 Current directory:', __dirname);
console.log('🔧 DB_NAME:', process.env.DB_NAME);
console.log('🔧 DB_USER:', process.env.DB_USER);
console.log('');

// Step 1: Test Sequelize
console.log('1️⃣ Testing Sequelize import...');
const { Sequelize } = require('sequelize');
console.log('   Sequelize:', typeof Sequelize);

// Step 2: Create sequelize instance directly
console.log('');
console.log('2️⃣ Creating Sequelize instance...');
const sequelize = new Sequelize(
  process.env.DB_NAME || 'shared_grocery',
  process.env.DB_USER || 'shared_grocery_user',
  process.env.DB_PASSWORD || 'shared_grocery_pass',
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    logging: false,
  }
);
console.log('   sequelize.define:', typeof sequelize.define);

// Step 3: Test creating a model
console.log('');
console.log('3️⃣ Testing model creation...');
const { DataTypes } = require('sequelize');

const TestUser = sequelize.define('TestUser', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
});

console.log('   TestUser type:', typeof TestUser);
console.log('   TestUser.hasMany:', typeof TestUser.hasMany);
console.log('   TestUser.belongsTo:', typeof TestUser.belongsTo);

// Step 4: Check database.js file
console.log('');
console.log('4️⃣ Testing config/database.js...');
try {
  const dbConfig = require('./config/database');
  console.log('   Exports:', Object.keys(dbConfig));
  console.log('   sequelize:', typeof dbConfig.sequelize);
  console.log('   sequelize.define:', typeof dbConfig.sequelize?.define);
} catch (err) {
  console.log('   ❌ Error:', err.message);
}

// Step 5: Check User.js file
console.log('');
console.log('5️⃣ Testing models/User.js...');
try {
  const User = require('./models/User');
  console.log('   User type:', typeof User);
  console.log('   User.hasMany:', typeof User.hasMany);
  
  if (typeof User === 'object' && User !== null) {
    console.log('   User keys:', Object.keys(User));
  }
} catch (err) {
  console.log('   ❌ Error:', err.message);
}

console.log('');
console.log('🏁 Debug complete!');