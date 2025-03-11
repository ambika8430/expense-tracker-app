const express = require('express');
const router = express.Router();
const expenseController = require('../controllers/expense');
const userController = require('../controllers/user');
const transactionController = require('../controllers/transaction');
const orderController = require('../controllers/orders')
const auth = require("../middleware/auth");

router.post("/expense", auth, expenseController.addExpense);
router.get("/expense", auth, expenseController.getExpenses);
router.put("/expense/:id", auth, expenseController.updateExpense);
router.delete("/expense/:id", auth, expenseController.deleteExpense);

router.get('/user', userController.getUser);
router.post('/user/sign-up', userController.createUser);
router.post('/user/sign-in', userController.verifyUser);
router.put('/user/:id', userController.updateUser);
router.delete('/user/:id', userController.deleteUser);

router.post("/pay", auth, transactionController.createTransaction);
router.get("/payment-status/:id", transactionController.getPaymentStatus);

router.get('/premium', auth, orderController.getOrder);

module.exports = router;
