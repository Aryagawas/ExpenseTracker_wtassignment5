
const express = require("express");
const path = require("path");

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());

app.use((req, res, next) => {
  console.log(req.method, req.url);
  next();
});

// Serve frontend files
app.use(express.static(path.join(__dirname, "public")));

// Expense routes
const expenseRoutes = require("./routes/expenseRoutes");
app.use("/api/expenses", expenseRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: "Internal server error" });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
