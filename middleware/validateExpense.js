function validateExpense(req, res, next) {
  const { title, amount, category, date } = req.body;

  if (!title || !title.trim()) {
    return res.status(400).json({
      message: "Title is required",
    });
  }

  if (
    amount === "" ||
    amount === null ||
    amount === undefined ||
    !Number.isFinite(Number(amount)) ||
    Number(amount) <= 0
  ) {
    return res.status(400).json({
      message: "Amount must be greater than zero",
    });
  }

  if (!category || !category.trim()) {
    return res.status(400).json({
      message: "Category is required",
    });
  }

  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return res.status(400).json({
      message: "A valid date is required",
    });
  }

  const parsedDate = new Date(`${date}T00:00:00Z`);

  if (
    Number.isNaN(parsedDate.getTime()) ||
    parsedDate.toISOString().slice(0, 10) !== date
  ) {
    return res.status(400).json({
      message: "Invalid calendar date",
    });
  }

  req.body.title = title.trim();
  req.body.amount = Number(amount);
  req.body.category = category.trim();

  next();
}

module.exports = validateExpense;
