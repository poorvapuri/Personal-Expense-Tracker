"use strict";

const STORAGE_KEY = "spendwise-expenses";
const CATEGORIES = ["Food", "Travel", "Shopping", "Education", "Bills", "Entertainment", "Other"];
const currencyFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  minimumFractionDigits: 2
});

const form = document.querySelector("#expense-form");
const amountInput = document.querySelector("#amount");
const descriptionInput = document.querySelector("#description");
const categoryInput = document.querySelector("#category");
const dateInput = document.querySelector("#date");
const categoryFilter = document.querySelector("#category-filter");
const dateSort = document.querySelector("#date-sort");
const expenseList = document.querySelector("#expense-list");
const emptyState = document.querySelector("#empty-state");
const tableWrap = document.querySelector("#table-wrap");
const filterEmptyState = document.querySelector("#filter-empty-state");
const appMessage = document.querySelector("#app-message");

let expenses = loadExpenses();

// Use a local calendar date rather than UTC so the default date is correct in every timezone.
function getLocalDateString(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// Load saved expenses safely and report storage problems in the page.
function loadExpenses() {
  try {
    const savedValue = localStorage.getItem(STORAGE_KEY);
    if (!savedValue) {
      return [];
    }

    const parsedValue = JSON.parse(savedValue);
    if (!Array.isArray(parsedValue)) {
      throw new Error("Saved expense data is not in the expected format.");
    }

    return parsedValue.filter(isValidExpense);
  } catch (error) {
    showMessage("We couldn't read saved expenses. Your browser storage may be unavailable or the saved data may be invalid.");
    console.error("SpendWise could not load expenses:", error);
    return [];
  }
}

function isValidExpense(expense) {
  return expense
    && typeof expense.id === "string"
    && typeof expense.amount === "number"
    && Number.isFinite(expense.amount)
    && expense.amount > 0
    && typeof expense.description === "string"
    && typeof expense.category === "string"
    && CATEGORIES.includes(expense.category)
    && typeof expense.date === "string"
    && /^\d{4}-\d{2}-\d{2}$/.test(expense.date);
}

// Persist every change immediately so it remains after the page is reopened.
function saveExpenses() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(expenses));
    return true;
  } catch (error) {
    showMessage("Your change is visible for now, but couldn't be saved in this browser. Check that browser storage is enabled.");
    console.error("SpendWise could not save expenses:", error);
    return false;
  }
}

function showMessage(message) {
  appMessage.textContent = message;
  appMessage.hidden = false;
}

function clearMessage() {
  appMessage.textContent = "";
  appMessage.hidden = true;
}

function formatCurrency(amount) {
  return currencyFormatter.format(amount);
}

function formatDate(dateString) {
  const [year, month, day] = dateString.split("-").map(Number);
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric"
  }).format(new Date(year, month - 1, day));
}

// Update the four dashboard cards from the same expense list used by the history.
function renderSummary() {
  const total = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const highest = expenses.reduce((currentHighest, expense) => (
    expense.amount > currentHighest.amount ? expense : currentHighest
  ), { amount: 0, description: "" });
  const now = new Date();
  const monthTotal = expenses
    .filter((expense) => {
      const [year, month] = expense.date.split("-").map(Number);
      return year === now.getFullYear() && month === now.getMonth() + 1;
    })
    .reduce((sum, expense) => sum + expense.amount, 0);

  document.querySelector("#total-spent").textContent = formatCurrency(total);
  document.querySelector("#transaction-count").textContent = String(expenses.length);
  document.querySelector("#highest-expense").textContent = formatCurrency(highest.amount);
  document.querySelector("#highest-description").textContent = highest.description
    ? `“${highest.description}”`
    : "Your biggest transaction";
  document.querySelector("#month-total").textContent = formatCurrency(monthTotal);
  document.querySelector("#month-label").textContent = new Intl.DateTimeFormat("en", {
    month: "long",
    year: "numeric"
  }).format(now);
}

function renderCategory(category) {
  const categoryEmojis = {
    Food: "🍔",
    Travel: "🚕",
    Shopping: "🛍️",
    Education: "📚",
    Bills: "🧾",
    Entertainment: "🎬",
    Other: "📦"
  };
  const categoryColors = {
    Food: { background: "#fff0e8", text: "#a84322" },
    Travel: { background: "#eaf3ff", text: "#285a91" },
    Shopping: { background: "#f3edff", text: "#6841a5" },
    Education: { background: "#e9f5ec", text: "#347346" },
    Bills: { background: "#fff7db", text: "#85620d" },
    Entertainment: { background: "#fdebf2", text: "#a03d68" },
    Other: { background: "#eef0f2", text: "#58616a" }
  };
  const colors = categoryColors[category] || categoryColors.Other;
  const badge = document.createElement("span");
  badge.className = `category-badge category-${category.toLowerCase()}`;
  badge.dataset.category = category;
  badge.style.backgroundColor = colors.background;
  badge.style.color = colors.text;

  const emoji = document.createElement("span");
  emoji.setAttribute("aria-hidden", "true");
  emoji.textContent = categoryEmojis[category] || categoryEmojis.Other;
  badge.append(emoji, document.createTextNode(category));

  return badge;
}

function createExpenseRow(expense) {
  const row = document.createElement("tr");

  const dateCell = document.createElement("td");
  dateCell.className = "date-cell";
  dateCell.textContent = formatDate(expense.date);

  const descriptionCell = document.createElement("td");
  descriptionCell.className = "expense-description";
  descriptionCell.textContent = expense.description;

  const categoryCell = document.createElement("td");
  categoryCell.className = "category-cell";
  categoryCell.append(renderCategory(expense.category));

  const amountCell = document.createElement("td");
  amountCell.className = "amount-cell";
  amountCell.textContent = formatCurrency(expense.amount);

  const actionCell = document.createElement("td");
  const deleteButton = document.createElement("button");
  deleteButton.className = "delete-button";
  deleteButton.type = "button";
  deleteButton.dataset.expenseId = expense.id;
  deleteButton.setAttribute("aria-label", `Delete ${expense.description}`);
  deleteButton.title = "Delete expense";
  deleteButton.textContent = "×";
  actionCell.append(deleteButton);

  row.append(dateCell, descriptionCell, categoryCell, amountCell, actionCell);
  return row;
}

// Apply the selected category and date order before drawing the history table.
function renderExpenses() {
  const selectedCategory = categoryFilter.value;
  const sortOrder = dateSort.value;
  const visibleExpenses = expenses
    .filter((expense) => selectedCategory === "all" || expense.category === selectedCategory)
    .sort((first, second) => {
      const dateDifference = first.date.localeCompare(second.date);
      return sortOrder === "oldest" ? dateDifference : -dateDifference;
    });

  expenseList.replaceChildren(...visibleExpenses.map(createExpenseRow));

  const hasExpenses = expenses.length > 0;
  emptyState.hidden = hasExpenses;
  tableWrap.hidden = !hasExpenses;
  filterEmptyState.hidden = visibleExpenses.length > 0 || !hasExpenses;
}

function renderApp() {
  renderSummary();
  renderExpenses();
}

function clearFieldErrors() {
  document.querySelectorAll(".field-error").forEach((errorElement) => {
    errorElement.textContent = "";
  });
  [amountInput, descriptionInput, categoryInput, dateInput].forEach((input) => {
    input.removeAttribute("aria-invalid");
  });
}

function validateForm() {
  clearFieldErrors();
  let isValid = true;

  if (!Number.isFinite(Number(amountInput.value)) || Number(amountInput.value) <= 0) {
    document.querySelector("#amount-error").textContent = "Enter an amount greater than zero.";
    amountInput.setAttribute("aria-invalid", "true");
    isValid = false;
  }

  if (!descriptionInput.value.trim()) {
    document.querySelector("#description-error").textContent = "Add a short description.";
    descriptionInput.setAttribute("aria-invalid", "true");
    isValid = false;
  }

  if (!CATEGORIES.includes(categoryInput.value)) {
    document.querySelector("#category-error").textContent = "Choose an expense category.";
    categoryInput.setAttribute("aria-invalid", "true");
    isValid = false;
  }

  if (!dateInput.value || Number.isNaN(Date.parse(`${dateInput.value}T00:00:00`))) {
    document.querySelector("#date-error").textContent = "Choose a valid date.";
    dateInput.setAttribute("aria-invalid", "true");
    isValid = false;
  }

  return isValid;
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  clearMessage();

  if (!validateForm()) {
    return;
  }

  const expense = {
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    amount: Number(Number(amountInput.value).toFixed(2)),
    description: descriptionInput.value.trim(),
    category: categoryInput.value,
    date: dateInput.value
  };

  expenses.push(expense);
  saveExpenses();
  form.reset();
  dateInput.value = getLocalDateString();
  categoryFilter.value = "all";
  renderApp();
  descriptionInput.focus();
});

expenseList.addEventListener("click", (event) => {
  const deleteButton = event.target.closest("[data-expense-id]");
  if (!deleteButton) {
    return;
  }

  clearMessage();
  expenses = expenses.filter((expense) => expense.id !== deleteButton.dataset.expenseId);
  saveExpenses();
  renderApp();
});

categoryFilter.addEventListener("change", renderExpenses);
dateSort.addEventListener("change", renderExpenses);

document.querySelector("#today-label").textContent = new Intl.DateTimeFormat("en", {
  weekday: "short",
  day: "numeric",
  month: "short",
  year: "numeric"
}).format(new Date());
dateInput.value = getLocalDateString();
renderApp();
