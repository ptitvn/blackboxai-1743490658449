// Authentication check
const currentUser = JSON.parse(localStorage.getItem('currentUser'));
if (!currentUser) {
    window.location.href = 'login.html';
}

// Initialize data structure
let financeData = JSON.parse(localStorage.getItem('financeData')) || {
    monthlyBudgets: {},
    categories: [],
    transactions: []
};

// DOM Elements
const logoutBtn = document.querySelector('.logout-button');
const monthSelect = document.getElementById('monthSelect');
const budgetInput = document.getElementById('budgetInput');
const saveBudgetBtn = document.getElementById('saveBudgetBtn');
const remainingAmount = document.getElementById('remainingAmount');
const categoryName = document.getElementById('categoryName');
const categoryLimit = document.getElementById('categoryLimit');
const addCategoryBtn = document.getElementById('addCategoryBtn');
const categoriesList = document.getElementById('categoriesList');
const expenseAmount = document.getElementById('expenseAmount');
const expenseNote = document.getElementById('expenseNote');
const addExpenseBtn = document.getElementById('addExpenseBtn');
const expensesHistory = document.getElementById('expensesHistory');
const budgetWarning = document.getElementById('budgetWarning');
const monthlyStats = document.getElementById('monthlyStats');
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    // Set current month
    const currentDate = new Date();
    monthSelect.value = currentDate.toISOString().slice(0, 7);
    
    // Load data
    loadMonthData();
    
    // Setup event listeners
    setupEventListeners();
});

// Event listeners
function setupEventListeners() {
    // Logout
    logoutBtn.addEventListener('click', () => {
        if (confirm('Bạn có chắc muốn đăng xuất?')) {
            localStorage.removeItem('currentUser');
            window.location.href = 'login.html';
        }
    });

    // Month selection
    monthSelect.addEventListener('change', loadMonthData);

    // Save budget
    saveBudgetBtn.addEventListener('click', () => {
        const amount = parseFloat(budgetInput.value);
        if (isNaN(amount) || amount <= 0) {
            alert('Vui lòng nhập số tiền hợp lệ');
            return;
        }

        const month = monthSelect.value;
        financeData.monthlyBudgets[month] = {
            budget: amount,
            spent: 0,
            remaining: amount
        };

        saveData();
        updateUI();
    });

    // Add category
    addCategoryBtn.addEventListener('click', () => {
        const name = categoryName.value.trim();
        const limit = parseFloat(categoryLimit.value);

        if (!name || isNaN(limit) || limit <= 0) {
            alert('Vui lòng nhập đầy đủ thông tin');
            return;
        }

        financeData.categories.push({
            id: Date.now(),
            name,
            limit,
            spent: 0
        });

        saveData();
        renderCategories();
    });

    // Add expense
    addExpenseBtn.addEventListener('click', () => {
        const amount = parseFloat(expenseAmount.value);
        const note = expenseNote.value.trim();
        const categoryId = /* Get selected category */;

        if (isNaN(amount) || amount <= 0 || !note) {
            alert('Vui lòng nhập đầy đủ thông tin');
            return;
        }

        // Add transaction logic
        // Update category spending
        // Update monthly budget
        // Save and update UI
    });

    // Search transactions
    searchBtn.addEventListener('click', () => {
        const term = searchInput.value.trim();
        searchTransactions(term);
    });
}

// Load data for selected month
function loadMonthData() {
    const month = monthSelect.value;
    if (!financeData.monthlyBudgets[month]) {
        financeData.monthlyBudgets[month] = {
            budget: 0,
            spent: 0,
            remaining: 0
        };
    }
    updateUI();
}

// Update all UI components
function updateUI() {
    updateBudgetDisplay();
    renderCategories();
    renderTransactions();
    updateMonthlyStats();
}

// Render categories
function renderCategories() {
    categoriesList.innerHTML = financeData.categories.map(category => `
        <div class="content2">
            <div class="item">${category.name} - Giới hạn: ${category.limit.toLocaleString()}</div>
            <div class="item_button">
                <button class="edit-category" data-id="${category.id}">Sửa</button>
                <button class="delete-category" data-id="${category.id}">Xóa</button>
            </div>
        </div>
    `).join('');
}

// Render transactions
function renderTransactions() {
    const month = monthSelect.value;
    const monthlyTransactions = financeData.transactions
        .filter(t => t.date.startsWith(month));
        
    expensesHistory.innerHTML = monthlyTransactions.map(transaction => `
        <div class="content2">
            <div class="item">${transaction.category} - ${transaction.note}: ${transaction.amount.toLocaleString()}</div>
            <div class="item_button">
                <button class="delete-transaction" data-id="${transaction.id}">Xóa</button>
            </div>
        </div>
    `).join('');
}

// Update budget display
function updateBudgetDisplay() {
    const month = monthSelect.value;
    const budget = financeData.monthlyBudgets[month];
    
    remainingAmount.textContent = `${budget.remaining.toLocaleString()} VND`;
    
    if (budget.remaining < 0) {
        budgetWarning.textContent = `⚠️ Cảnh báo: Bạn đã vượt quá ngân sách tháng!`;
        budgetWarning.style.display = 'block';
    } else {
        budgetWarning.style.display = 'none';
    }
}

// Save data to localStorage
function saveData() {
    localStorage.setItem('financeData', JSON.stringify(financeData));
}