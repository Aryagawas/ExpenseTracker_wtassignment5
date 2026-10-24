
const API_URL = "/api/expenses";

const form = document.getElementById("expenseForm");
const expenseList = document.getElementById("expenseList");
const message = document.getElementById("message");

let editingId = null;

// Set today's date
document.getElementById("date").value =
  new Date().toLocaleDateString("en-CA");

function formatCurrency(amount) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(amount);
}

function showMessage(text, type = "success") {
  message.textContent = text;
  message.className = type;
}

async function apiRequest(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Request failed");
  }

  return data;
}

async function loadExpenses() {
  const params = new URLSearchParams();
  const search = document.getElementById("search").value.trim();
  const category = document.getElementById("filterCategory").value;

  if (search) params.set("search", search);
  if (category) params.set("category", category);

  try {
    const query = params.toString();
    const url = query ? `${API_URL}?${query}` : API_URL;
    const data = await apiRequest(url);

    renderExpenses(data.expenses);
    updateSummary(data.expenses);
  } catch (error) {
    showMessage(error.message, "error");
  }
}

function renderExpenses(expenses) {
  expenseList.innerHTML = "";

  if (expenses.length === 0) {
    expenseList.innerHTML =
      '<tr><td colspan="5">No expenses found.</td></tr>';
    return;
  }

  expenses.forEach((expense) => {
    const row = document.createElement("tr");

    [expense.title, formatCurrency(expense.amount),
      expense.category, expense.date].forEach((value) => {
      const cell = document.createElement("td");
      cell.textContent = value;
      row.appendChild(cell);
    });

    const actions = document.createElement("td");

    const editButton = document.createElement("button");
    editButton.textContent = "Edit";
    editButton.type = "button";
    editButton.addEventListener("click", () => editExpense(expense));

    const deleteButton = document.createElement("button");
    deleteButton.textContent = "Delete";
    deleteButton.type = "button";
    deleteButton.addEventListener("click", () => deleteExpense(expense.id));

    actions.append(editButton, deleteButton);
    row.appendChild(actions);
    expenseList.appendChild(row);
  });
}

function updateSummary(expenses) {
  const total = expenses.reduce(
    (sum, expense) => sum + Number(expense.amount),
    0
  );

  document.getElementById("total").textContent = formatCurrency(total);
  document.getElementById("count").textContent = expenses.length;
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const expense = {
    title: document.getElementById("title").value.trim(),
    amount: document.getElementById("amount").value,
    category: document.getElementById("category").value,
    date: document.getElementById("date").value,
  };

  try {
    if (editingId === null) {
      await apiRequest(API_URL, {
        method: "POST",
        body: JSON.stringify(expense),
      });
      showMessage("Expense added successfully.");
    } else {
      await apiRequest(`${API_URL}/${editingId}`, {
        method: "PUT",
        body: JSON.stringify(expense),
      });
      showMessage("Expense updated successfully.");
    }

    resetForm();
    await loadExpenses();
  } catch (error) {
    showMessage(error.message, "error");
  }
});

function editExpense(expense) {
  editingId = expense.id;

  document.getElementById("title").value = expense.title;
  document.getElementById("amount").value = expense.amount;
  document.getElementById("category").value = expense.category;
  document.getElementById("date").value = expense.date;

  document.getElementById("formTitle").textContent = "Edit Expense";
  document.getElementById("submitButton").textContent = "Update Expense";
  document.getElementById("cancelButton").hidden = false;

  form.scrollIntoView({ behavior: "smooth" });
}

async function deleteExpense(id) {
  if (!confirm("Do you want to delete this expense?")) return;

  try {
    await apiRequest(`${API_URL}/${id}`, { method: "DELETE" });
    showMessage("Expense deleted successfully.");
    await loadExpenses();
  } catch (error) {
    showMessage(error.message, "error");
  }
}

function resetForm() {
  form.reset();
  editingId = null;

  document.getElementById("formTitle").textContent = "Add Expense";
  document.getElementById("submitButton").textContent = "Add Expense";
  document.getElementById("cancelButton").hidden = true;

  document.getElementById("date").value =
    new Date().toLocaleDateString("en-CA");
}

document.getElementById("cancelButton").addEventListener("click", resetForm);
document.getElementById("refreshButton").addEventListener("click", loadExpenses);
document.getElementById("search").addEventListener("input", loadExpenses);
document.getElementById("filterCategory").addEventListener("change", loadExpenses);

loadExpenses();
