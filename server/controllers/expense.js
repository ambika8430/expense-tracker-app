const { Expense, User } = require('../models/association');
const sequelize = require("../utils/database");
const { QueryTypes, Op } = require('sequelize');

//get all expenses
exports.getAllExpenses = async (req, res) => {
  try {
      let { page, limit } = req.query;
      page = parseInt(page) || 1; // Default to page 1
      limit = parseInt(limit) || 10; // Default to 10 items per page
      const offset = (page - 1) * limit;

      const { count, rows: expenses } = await Expense.findAndCountAll({
          where: { userId: req.user.id },
          limit,
          offset,
          order: [['date', 'DESC']]
      });

      res.json({
          success: true,
          expenses,
          pagination: {
              totalItems: count,
              totalPages: Math.ceil(count / limit),
              currentPage: page
          }
      });

  } catch (error) {
      console.error("Error fetching expenses:", error);
      res.status(500).json({ success: false, error: "Server error" });
  }
};


// POST - Add or update an expense (linked to userId)
exports.addExpense = async (req, res) => {
  try {
    const userId = req.user.id; // Get userId from middleware
    const { item, category, amount } = req.body;

    // Ensure the amount is a valid number
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount)) {
      return res.status(400).json({ message: "Invalid amount" });
    }

    // Check if an expense with the same item exists for this user
    let existingExpense = await Expense.findOne({ where: { item, userId } });

    //console.log("exisitngExpense", existingExpense);

    if (existingExpense) {
      // Update existing expense
      existingExpense.amount = parsedAmount;
      existingExpense.category = category;
      await existingExpense.save();
      console.log("Updated Expense");
      return res.status(200).json({ message: "Expense updated successfully", expense: existingExpense });
    }

    // Create a new expense linked to userId
    const newExpense = await Expense.create({ item, category, amount: parsedAmount, userId });
    console.log("Created New Expense");

    res.status(201).json({ message: "Expense created successfully", expense: newExpense });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error creating/updating expense", error: err.message });
  }
};

// PUT - Update an existing expense by ID (linked to userId)
exports.updateExpense = async (req, res) => {
  try {
    const userId = req.user.id; // Get userId
    const expenseId = req.params.id;
    const { item, category, amount } = req.body;

    // Find the expense by ID and userId
    let expense = await Expense.findOne({ where: { id: expenseId, userId } });
    if (!expense) {
      return res.status(404).json({ message: "Expense not found or unauthorized" });
    }

    // Update fields
    expense.item = item || expense.item;
    expense.category = category || expense.category;
    if (amount !== undefined) {
      const parsedAmount = parseFloat(amount);
      if (!isNaN(parsedAmount)) {
        expense.amount = parsedAmount;
      }
    }

    await expense.save();
    console.log("Updated Expense");

    res.status(200).json({ message: "Expense updated successfully", expense });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error updating expense", error: err.message });
  }
};

// GET - Fetch all expenses for the logged-in user
exports.getExpenses = async (req, res) => {
  try {
    const userId = req.user.id; // Get userId
    const expenses = await Expense.findAll({ where: { userId } });
    
    res.status(200).json({ expenses });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching expenses", error: err.message });
  }
};

// DELETE - Delete an expense by ID (only if it belongs to the user)
exports.deleteExpense = async (req, res) => {
  try {
    const userId = req.user.id; // Get userId
    const expenseId = req.params.id;

    // Find the expense by ID and userId
    const expense = await Expense.findOne({ where: { id: expenseId, userId } });
    if (!expense) {
      return res.status(404).json({ message: "Expense not found or unauthorized" });
    }

    await expense.destroy();
    res.status(200).json({ message: "Expense deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error deleting expense", error: err.message });
  }
};

exports.getExpenseByUser = async(req, res) => {
  try {
    const leaderboardData = await sequelize.query(
        `
        SELECT Users.id, Users.username, COALESCE(SUM(Expenses.amount), 0) AS totalAmount
        FROM Users
        LEFT JOIN Expenses ON Users.id = Expenses.userId
        GROUP BY Users.id
        ORDER BY totalAmount DESC;
        `,
        { type: QueryTypes.SELECT }
    );

    console.log(leaderboardData)

    res.status(200).json({ success: true, data: leaderboardData });
  } catch (error) {
      console.error("Error fetching leaderboard:", error);
      res.status(500).json({ success: false, error: error.message });
  }
}

exports.getCustomExpense = async (req, res) => {
  try {
      const { filterType, filterValue, page = 1, limit = 10 } = req.body;
      console.log("Filter values received:", filterType, filterValue);

      let whereCondition = {};

      if (filterType === "daily") {
          whereCondition.date = filterValue; // Direct string match with DB     
      } else if (filterType === "weekly") {
          const [year, week] = filterValue.split("-W");
          const firstDayOfWeek = new Date(year, 0, 1);
          
          // Adjust to first Monday of the year
          while (firstDayOfWeek.getDay() !== 1) {
              firstDayOfWeek.setDate(firstDayOfWeek.getDate() + 1);
          }

          // Now move to the correct week
          firstDayOfWeek.setDate(firstDayOfWeek.getDate() + (week - 1) * 7);
          const lastDayOfWeek = new Date(firstDayOfWeek);
          lastDayOfWeek.setDate(lastDayOfWeek.getDate() + 6);

          whereCondition.date = {
              [Op.between]: [
                  firstDayOfWeek.toISOString().split("T")[0],
                  lastDayOfWeek.toISOString().split("T")[0]
              ]
          };

      } else if (filterType === "monthly") {
          const [year, month] = filterValue.split("-");
          const firstDayOfMonth = new Date(year, month - 1, 1);
          const lastDayOfMonth = new Date(year, month, 0);

          whereCondition.date = {
              [Op.between]: [
                  firstDayOfMonth.toISOString().split("T")[0],
                  lastDayOfMonth.toISOString().split("T")[0]
              ]
          };

      } else {
          return res.status(400).json({ success: false, error: "Invalid filter type" });
      }

      console.log("Filter Condition:", whereCondition); // Debugging

      // Pagination values
      const offset = (page - 1) * limit;

      // Fetch total count
      const totalExpenses = await Expense.count({ where: whereCondition });

      // Fetch paginated expenses
      const expenses = await Expense.findAll({ 
          where: whereCondition,
          limit: parseInt(limit), 
          offset: parseInt(offset)
      });

      res.json({ 
          success: true, 
          expenses, 
          pagination: {
              currentPage: parseInt(page),
              totalPages: Math.ceil(totalExpenses / limit),
              totalExpenses
          }
      });

  } catch (error) {
      console.error("Error filtering expenses:", error);
      res.status(500).json({ success: false, error: "Server error" });
  }
};
