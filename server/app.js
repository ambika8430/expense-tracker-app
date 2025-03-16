const path = require('path');
const cors = require('cors');
const fs = require('fs');

const morgan = require('morgan');
require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');

const sequelize = require('./utils/database');

const { User, Expense } = require('./models/association')

const logStream = fs.createWriteStream(path.join(__dirname, 'access.log'), { flags: 'a' });

const app = express();
app.use(morgan('combined', { stream: logStream }));
app.use(express.json());
app.use(cors({ 
  origin: 'http://localhost:3001',
  credentials: true 
}));

const adminRoutes = require('./routes/admin');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.use(adminRoutes);

// Before adding the foreign key constraint, ensure data consistency

// Call ensureDataConsistency before syncing models

sequelize
.sync()
.then(result => {
  app.listen(process.env.PORT);
})
.catch(err => {
  console.log(err);
});