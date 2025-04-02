// Authentication check
const currentUser = JSON.parse(localStorage.getItem('currentUser'));
if (!currentUser) {
    window.location.href = 'login.html';
}

// Initialize data structure
let financeData = JSON.parse(localStorage.getItem('financeData')) || {
    monthlyBudgets: {},
    categories: [],
    transactions: [],
    currentPage: 1,
    itemsPerPage: 5,
    sortOrder: 'desc'
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
    const categorySelect = document.getElementById('categorySelect');
    const categoryId = parseInt(categorySelect.value);

    if (isNaN(amount) || amount <= 0 || !note || !categoryId) {
        alert('Vui lòng nhập đầy đủ thông tin');
        return;
    }

    const month = monthSelect.value;
    const transaction = {
        id: Date.now(),
        date: new Date().toISOString(),
        amount,
        note,
        categoryId,
        category: financeData.categories.find(c => c.id === categoryId)?.name || 'Khác'
    };

    financeData.transactions.push(transaction);
    
    // Update category spending
    const category = financeData.categories.find(c => c.id === categoryId);
    if (category) {
        category.spent += amount;
    }
    
    // Update monthly budget
    financeData.monthlyBudgets[month].spent += amount;
    financeData.monthlyBudgets[month].remaining -= amount;
    
    saveData();
    updateUI();
});

    // Search transactions
    searchBtn.addEventListener('click', () => {
        const term = searchInput.value.trim();
        searchTransactions(term);
    });

    // Sort transactions
    document.getElementById('sortOrder').addEventListener('change', (e) => {
        financeData.sortOrder = e.target.value;
        saveData();
        renderTransactions();
    });

    // Pagination
    document.addEventListener('click', (e) => {
        if (e.target.id === 'prevPage') {
            financeData.currentPage--;
            saveData();
            renderTransactions();
        } else if (e.target.id === 'nextPage') {
            financeData.currentPage++;
            saveData();
            renderTransactions();
        }
    });

    // Category actions
    categoriesList.addEventListener('click', (e) => {
        if (e.target.classList.contains('edit-category')) {
            const id = parseInt(e.target.dataset.id);
            editCategory(id);
        } else if (e.target.classList.contains('delete-category')) {
            const id = parseInt(e.target.dataset.id);
            deleteCategory(id);
        }
    });

    // Transaction actions
    expensesHistory.addEventListener('click', (e) => {
        if (e.target.classList.contains('delete-transaction')) {
            const id = parseInt(e.target.dataset.id);
            deleteTransaction(id);
        }
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

// Render transactions with pagination and sorting
function renderTransactions() {
    const month = monthSelect.value;
    let monthlyTransactions = financeData.transactions
        .filter(t => t.date.startsWith(month))
        .sort((a, b) => financeData.sortOrder === 'asc' 
            ? a.amount - b.amount 
            : b.amount - a.amount);

    // Pagination
    const startIndex = (financeData.currentPage - 1) * financeData.itemsPerPage;
    const paginatedTransactions = monthlyTransactions.slice(
        startIndex, 
        startIndex + financeData.itemsPerPage
    );
    
    expensesHistory.innerHTML = paginatedTransactions.map(transaction => `
        <div class="content2">
            <div class="item">${transaction.category} - ${transaction.note}: ${transaction.amount.toLocaleString()}</div>
            <div class="item_button">
                <button class="delete-transaction" data-id="${transaction.id}">Xóa</button>
            </div>
        </div>
    `).join('');

    // Render pagination controls
    const totalPages = Math.ceil(monthlyTransactions.length / financeData.itemsPerPage);
    document.getElementById('paginationControls').innerHTML = `
        <button ${financeData.currentPage <= 1 ? 'disabled' : ''} id="prevPage">←</button>
        <span>Trang ${financeData.currentPage}/${totalPages}</span>
        <button ${financeData.currentPage >= totalPages ? 'disabled' : ''} id="nextPage">→</button>
    `;
}

// Search transactions
function searchTransactions(term) {
    const month = monthSelect.value;
    const results = financeData.transactions
        .filter(t => t.date.startsWith(month) && 
               (t.note.toLowerCase().includes(term.toLowerCase()) || 
                t.category.toLowerCase().includes(term.toLowerCase())));
    
    expensesHistory.innerHTML = results.map(transaction => `
        <div class="content2">
            <div class="item">${transaction.category} - ${transaction.note}: ${transaction.amount.toLocaleString()}</div>
            <div class="item_button">
                <button class="delete-transaction" data-id="${transaction.id}">Xóa</button>
            </div>
        </div>
    `).join('');
}

// Delete transaction
function deleteTransaction(id) {
    const transaction = financeData.transactions.find(t => t.id === id);
    if (!transaction) return;

    const month = transaction.date.slice(0, 7);
    
    // Update category spending
    const category = financeData.categories.find(c => c.id === transaction.categoryId);
    if (category) {
        category.spent -= transaction.amount;
    }
    
    // Update monthly budget
    financeData.monthlyBudgets[month].spent -= transaction.amount;
    financeData.monthlyBudgets[month].remaining += transaction.amount;
    
    // Remove transaction
    financeData.transactions = financeData.transactions.filter(t => t.id !== id);
    
    saveData();
    updateUI();
}

// Edit category
function editCategory(id) {
    const category = financeData.categories.find(c => c.id === id);
    if (!category) return;

    const newName = prompt('Tên mới:', category.name);
    if (!newName) return;

    const newLimit = parseFloat(prompt('Giới hạn mới:', category.limit));
    if (isNaN(newLimit) || newLimit <= 0) {
        alert('Giới hạn không hợp lệ');
        return;
    }

    category.name = newName;
    category.limit = newLimit;
    
    saveData();
    renderCategories();
}

// Delete category
function deleteCategory(id) {
    if (!confirm('Xóa danh mục này sẽ xóa tất cả giao dịch liên quan. Tiếp tục?')) {
        return;
    }

    // Delete related transactions
    financeData.transactions = financeData.transactions.filter(t => t.categoryId !== id);
    
    // Delete category
    financeData.categories = financeData.categories.filter(c => c.id !== id);
    
    saveData();
    updateUI();
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