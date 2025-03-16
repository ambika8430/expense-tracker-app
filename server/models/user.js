const Sequelize = require('sequelize');
const sequelize = require('../utils/database');

const User = sequelize.define('User', {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  },
  username: {
    type: Sequelize.STRING,
    allowNull: false
  },
  email: {
    type: Sequelize.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  password: {
    type: Sequelize.STRING,
    allowNull: false
  },
  resetToken: {
    type: Sequelize.TEXT,
    allowNull: true,
  },
  resetTokenExpires: {
    type: Sequelize.DATE,
    allowNull: true,
  },
}, {
  timestamps: false,
  tableName: "Users"
});

module.exports = User;
