# SpendWise – Personal Expense Tracker

SpendWise is a small, beginner-friendly expense tracker that runs locally in your web browser. It helps you record everyday expenses, review your spending, and keep your expense history between visits using browser LocalStorage.

## Features

- Add an expense with an amount, description, category, and date.
- Choose from Food, Travel, Shopping, Education, Bills, Entertainment, or Other.
- View total spending, transaction count, highest expense, and spending for the current month.
- Browse expenses in a history table.
- Filter expenses by category and sort them by date.
- Delete an expense.
- Save expenses in LocalStorage so they remain available after refreshing or reopening the browser.
- Use a responsive layout on desktop and mobile screens.
- See input validation messages and a helpful empty state when there are no expenses.

## Technologies used

- HTML
- CSS
- Vanilla JavaScript
- Browser LocalStorage for saving expenses

No frameworks, package installation, backend, or database are required.

## How to run

1. Download or clone this project to your computer.
2. Open the project folder.
3. Open `index.html` in a modern web browser.

The app runs locally; you do not need to start a server. Expense data is stored in the browser's LocalStorage for this site. It is not synced between browsers or devices, and clearing the browser's site data may remove it.

## Project folder structure

```text
SpendWise/
├── index.html   # Page structure and form
├── style.css    # Layout, colors, and responsive styles
├── script.js    # Expense handling, dashboard, and LocalStorage
└── README.md    # Project guide
```

## Future improvements

These are ideas for later versions and are **not implemented** in the current project:

- Edit expenses, search descriptions, and add custom categories.
- Set monthly category budgets and show budget warnings.
- Add spending charts, reports, and trends.
- Add dark mode and export expense data to CSV or Excel.
- Track income and calculate savings.
- Add a backend, user accounts, cloud storage, and device syncing.
