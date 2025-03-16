const express = require('express');
const router = express.Router();
const expenseController = require('../controllers/expense');
const userController = require('../controllers/user');
const transactionController = require('../controllers/transaction');
const orderController = require('../controllers/orders')
const auth = require("../middleware/auth");
const authController = require("../controllers/auth")
const reportController = require('../controllers/report')

router.get("/expense", auth, expenseController.getAllExpenses)
router.post("/expense", auth, expenseController.addExpense);
router.get("/expense", auth, expenseController.getExpenses);
router.put("/expense/:id", auth, expenseController.updateExpense);
router.delete("/expense/:id", auth, expenseController.deleteExpense);

router.get('/user/:id', auth, userController.getUser);
router.get('/user', auth, userController.getAllUsers);
router.post('/user/sign-up', userController.createUser);
router.post('/user/sign-in', userController.verifyUser);
router.put('/user/:id', userController.updateUser);
router.delete('/user/:id', userController.deleteUser);

router.post("/pay", auth, transactionController.createTransaction);
router.get("/payment-status/:id", transactionController.getPaymentStatus);

router.get('/premium', auth, orderController.isPremium);
router.get('/leaderboard', auth, expenseController.getExpenseByUser);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);
router.post('/expense/filter', auth, expenseController.getCustomExpense);
router.get('/download-report', auth, reportController.getReport);

module.exports = router;
