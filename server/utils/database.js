const Sequelize = require('sequelize');

const sequelize = new Sequelize('node-complete', process.env.DATABASE_USERNAME, process.env.DATABASE_SECRET, {
  dialect: 'mysql',
  host: 'localhost'
});

module.exports = sequelize;
