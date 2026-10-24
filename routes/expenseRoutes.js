const express = require("express");
const router = express.Router();
const validateExpense = require("../middleware/validateExpense");

let expenses = [];
let nextId = 1;

router.get("/", (req, res) => {
  let result = [...expenses];
  const { search, category } = req.query;

  if (search) {
    result = result.filter((expense) =>
      expense.title.toLowerCase().includes(search.toLowerCase())
    );
  }

  if (category) {
    result = result.filter(
      (expense) => expense.category === category
    );
  }

  res.json({
    count: result.length,
    expenses: result,
  });
});

// GET one expense
router.get("/:id", (req, res) => {
  const expense = expenses.find(
    (item) => item.id === Number(req.params.id)
  );

  if (!expense) {
    return res.status(404).json({
      message: "Expense not found",
    });
  }

  res.json(expense);
});

// POST: Add expense
router.post("/", validateExpense, (req, res) => {
  const expense = {
    id: nextId++,
    title: req.body.title,
    amount: req.body.amount,
    category: req.body.category,
    date: req.body.date,
  };

  expenses.push(expense);

  res.status(201).json({
    message: "Expense added successfully",
    expense,
  });
});

// PUT: Update expense
router.put("/:id", validateExpense, (req, res) => {
  const expense = expenses.find(
    (item) => item.id === Number(req.params.id)
  );

  if (!expense) {
    return res.status(404).json({
      message: "Expense not found",
    });
  }

  expense.title = req.body.title;
  expense.amount = req.body.amount;
  expense.category = req.body.category;
  expense.date = req.body.date;

  res.json({
    message: "Expense updated successfully",
    expense,
  });
});

// DELETE: Remove expense
router.delete("/:id", (req, res) => {
  const index = expenses.findIndex(
    (item) => item.id === Number(req.params.id)
  );

  if (index === -1) {
    return res.status(404).json({
      message: "Expense not found",
    });
  }

  expenses.splice(index, 1);

  res.json({
    message: "Expense deleted successfully",
  });
});

module.exports = router;
