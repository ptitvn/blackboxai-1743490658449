// Financial Management System - Complete Implementation

// ========== DATA STORAGE ==========
let monthlyBudgets = JSON.parse(localStorage.getItem('monthlyBudgets')) || {};
let categories = JSON.parse(localStorage.getItem('categories')) || [];
let transactions = JSON.parse(localStorage.getItem('transactions')) || [];
let currentPage = 1;
const itemsPerPage = 5;
let sortDirection = 'desc';
let editingCategoryId = null;
let selectedMonth = new Date().toISOString().slice(0, 7); // YYYY-MM format

// ========== DOM ELEMENTS ==========
const elements = {
    categoryName: document.getElementById('categoryName'),
    categoryLimit: document.getElementById('categoryLimit'),
    addCategoryBtn: document.getElementById('addCategoryBtn'),
    categoriesList: document.getElementById('categoriesList'),
    expenseCategory: document.getElementById('expenseCategory'),
    expenseAmount: document.getElementById('expenseAmount'),
    expenseNote: document.getElementById('expenseNote'),
    addExpenseBtn: document.getElementById('addExpenseBtn'),
    expensesHistory: document.getElementById('expensesHistory'),
    searchInput: document.getElementById('searchInput'),
    searchBtn: document.getElementById('searchBtn'),
    sortBtn: document.getElementById('sortBtn'),
    prevBtn: document.getElementById('prevBtn'),
    nextBtn: document.getElementById('nextBtn'),
    pageNumbers: document.getElementById('pageNumbers'),
    editModal: document.getElementById('editModal'),
    editCategoryName: document.getElementById('editCategoryName'),
    editCategoryLimit: document.getElementById('editCategoryLimit'),
    saveEditBtn: document.getElementById('saveEditBtn'),
    cancelEditBtn: document.getElementById('cancelEditBtn')
};

// ========== INITIALIZATION ==========
document.addEventListener('DOMContentLoaded', initializeApp);

function initializeApp() {
    // Set up month selector
    const monthSelect = document.getElementById('monthSelect');
    const currentDate = new Date();
    monthSelect.value = currentDate.toISOString().slice(0, 7);
    selectedMonth = monthSelect.value;
    
    // Initialize budget display
    updateBudgetDisplay();
    
    renderCategories();
    renderTransactions();
    setupEventListeners();
    
    // Set up budget save button
    document.getElementById('saveBudgetBtn').addEventListener('click', setMonthlyBudget);
}

// ========== RENDER FUNCTIONS ==========
function renderCategories() {
    elements.categoriesList.innerHTML = '';
    elements.expenseCategory.innerHTML = '<option value="">Chọn danh mục</option>';
    
    categories.forEach((category, index) => {
        // Add to categories list
        const categoryItem = document.createElement('div');
        categoryItem.className = 'category-item';
        categoryItem.innerHTML = `
            <span>${category.name} - ${formatCurrency(category.limit)}</span>
            <div class="category-actions">
                <button class="edit-btn" data-id="${index}">Sửa</button>
                <button class="delete-btn" data-id="${index}">Xóa</button>
            </div>
        `;
        elements.categoriesList.appendChild(categoryItem);
        
        // Add to category dropdown
        const option = document.createElement('option');
        option.value = index;
        option.textContent = category.name;
        elements.expenseCategory.appendChild(option);
    });
}

function renderTransactions(searchTerm = '') {
    // Filter transactions
    let filteredTransactions = searchTerm 
        ? transactions.filter(t => 
            t.note.toLowerCase().includes(searchTerm.toLowerCase()) || 
            t.category.toLowerCase().includes(searchTerm.toLowerCase()))
        : [...transactions];
    
    // Sort transactions
    filteredTransactions.sort((a, b) => 
        sortDirection === 'desc' ? b.amount - a.amount : a.amount - b.amount);
    
    // Pagination
    const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedTransactions = filteredTransactions.slice(startIndex, startIndex + itemsPerPage);
    
    // Render transactions
    elements.expensesHistory.innerHTML = paginatedTransactions
        .map((transaction, index) => `
            <div class="transaction-item">
                <span>${transaction.category}: ${formatCurrency(transaction.amount)} - ${transaction.note}</span>
                <button class="delete-transaction" data-id="${startIndex + index}">Xóa</button>
            </div>
        `).join('');
    
    // Render pagination
    renderPagination(totalPages);
}

function renderPagination(totalPages) {
    elements.pageNumbers.innerHTML = '';
    
    for (let i = 1; i <= totalPages; i++) {
        const pageBtn = document.createElement('button');
        pageBtn.textContent = i;
        pageBtn.className = currentPage === i ? 'active' : '';
        pageBtn.addEventListener('click', () => {
            currentPage = i;
            renderTransactions();
        });
        elements.pageNumbers.appendChild(pageBtn);
    }
    
    elements.prevBtn.disabled = currentPage === 1;
    elements.nextBtn.disabled = currentPage === totalPages || totalPages === 0;
}

// ========== EVENT HANDLERS ==========
function setupEventListeners() {
    // Category management
    elements.addCategoryBtn.addEventListener('click', handleAddCategory);
    elements.categoriesList.addEventListener('click', handleCategoryActions);
    
    // Expense management
    elements.addExpenseBtn.addEventListener('click', handleAddExpense);
    elements.expensesHistory.addEventListener('click', handleTransactionActions);
    
    // Search and sort
    elements.searchBtn.addEventListener('click', handleSearch);
    elements.sortBtn.addEventListener('click', toggleSortDirection);
    
    // Pagination
    elements.prevBtn.addEventListener('click', () => changePage(-1));
    elements.nextBtn.addEventListener('click', () => changePage(1));
    
    // Modal actions
    elements.saveEditBtn.addEventListener('click', saveCategoryEdit);
    elements.cancelEditBtn.addEventListener('click', closeEditModal);
}

function handleAddCategory() {
    const name = elements.categoryName.value.trim();
    const limit = parseFloat(elements.categoryLimit.value);
    
    if (!validateCategoryInput(name, limit)) return;
    
    // Check for duplicate category name
    if (categories.some(cat => cat.name.toLowerCase() === name.toLowerCase())) {
        alert('Danh mục này đã tồn tại!');
        return;
    }
    
    categories.push({ 
        name, 
        limit,
        spent: 0,
        remaining: limit
    });
    saveData();
    clearCategoryInputs();
    renderCategories();
    
    // Update category dropdown
    const option = document.createElement('option');
    option.value = categories.length - 1;
    option.textContent = name;
    elements.expenseCategory.appendChild(option);
}

function handleCategoryActions(e) {
    if (e.target.classList.contains('edit-btn')) {
        editCategory(e.target.dataset.id);
    } else if (e.target.classList.contains('delete-btn')) {
        deleteCategory(e.target.dataset.id);
    }
}

function handleAddExpense() {
    const categoryId = elements.expenseCategory.value;
    const amount = parseFloat(elements.expenseAmount.value);
    const note = elements.expenseNote.value.trim();
    
    if (!validateExpenseInput(categoryId, amount, note)) return;
    
    const category = categories[categoryId];
    
    // Check if expense exceeds category limit
    if (category.spent + amount > category.limit) {
        if (!confirm(`Cảnh báo: Chi tiêu này sẽ vượt quá giới hạn danh mục ${category.name}! Tiếp tục?`)) {
            return;
        }
    }
    
    // Add transaction
    transactions.push({
        category: category.name,
        categoryId: parseInt(categoryId),
        amount,
        note,
        date: new Date().toISOString(),
        month: selectedMonth
    });
    
    // Update category spending
    category.spent += amount;
    category.remaining = category.limit - category.spent;
    
    // Update monthly budget
    const monthlyBudget = monthlyBudgets[selectedMonth];
    monthlyBudget.spent += amount;
    monthlyBudget.remaining = monthlyBudget.budget - monthlyBudget.spent;
    
    // Check if exceeds monthly budget
    if (monthlyBudget.remaining < 0) {
        alert(`Cảnh báo: Bạn đã vượt quá ngân sách tháng!`);
    }
    
    saveData();
    clearExpenseInputs();
    renderCategories();
    renderTransactions();
    showBudgetStatus();
    updateBudgetDisplay();
}

function handleTransactionActions(e) {
    if (e.target.classList.contains('delete-transaction')) {
        deleteTransaction(e.target.dataset.id);
    }
}

function handleSearch() {
    currentPage = 1;
    const searchTerm = elements.searchInput.value.trim();
    if (searchTerm === '') {
        renderTransactions();
        return;
    }
    renderTransactions(searchTerm);
    
    // Show search results count
    const filteredCount = transactions.filter(t => 
        t.note.toLowerCase().includes(searchTerm.toLowerCase()) || 
        t.category.toLowerCase().includes(searchTerm.toLowerCase())).length;
        
    alert(`Tìm thấy ${filteredCount} giao dịch phù hợp`);
}

// ========== CATEGORY OPERATIONS ==========
function editCategory(id) {
    const category = categories[id];
    editingCategoryId = id;
    elements.editCategoryName.value = category.name;
    elements.editCategoryLimit.value = category.limit;
    elements.editModal.style.display = 'block';
}

function saveCategoryEdit() {
    const name = elements.editCategoryName.value.trim();
    const limit = parseFloat(elements.editCategoryLimit.value);
    
    if (!validateCategoryInput(name, limit)) return;
    
    // Check for duplicate name (excluding current category)
    if (categories.some((cat, index) => 
        index !== editingCategoryId && cat.name.toLowerCase() === name.toLowerCase())) {
        alert('Tên danh mục này đã tồn tại!');
        return;
    }
    
    // Update category and adjust spending data
    const category = categories[editingCategoryId];
    const limitChange = limit - category.limit;
    category.name = name;
    category.limit = limit;
    category.remaining += limitChange;
    
    // Update any transactions with this category
    transactions.forEach(t => {
        if (t.categoryId === editingCategoryId) {
            t.category = name;
        }
    });
    
    saveData();
    closeEditModal();
    renderCategories();
    renderTransactions();
    showBudgetStatus();
}

function deleteCategory(id) {
    if (!confirm('Bạn có chắc chắn muốn xóa danh mục này?\nTất cả giao dịch thuộc danh mục này sẽ bị xóa!')) return;
    
    // Remove all transactions for this category
    transactions = transactions.filter(t => t.categoryId !== id);
    
    // Update category IDs for remaining transactions
    transactions.forEach(t => {
        if (t.categoryId > id) {
            t.categoryId--;
        }
    });
    
    categories.splice(id, 1);
    saveData();
    renderCategories();
    renderTransactions();
    showBudgetStatus();
}

// ========== TRANSACTION OPERATIONS ==========
function deleteTransaction(id) {
    if (!confirm('Bạn có chắc chắn muốn xóa giao dịch này?')) return;
    
    const transaction = transactions[id];
    
    // Update category spending
    if (transaction.categoryId !== undefined) {
        const category = categories[transaction.categoryId];
        category.spent -= transaction.amount;
        category.remaining = category.limit - category.spent;
    }
    
    // Update monthly budget
    if (monthlyBudgets[transaction.month]) {
        monthlyBudgets[transaction.month].spent -= transaction.amount;
        monthlyBudgets[transaction.month].remaining += transaction.amount;
    }
    
    transactions.splice(id, 1);
    saveData();
    renderCategories();
    renderTransactions();
    showBudgetStatus();
    updateBudgetDisplay();
}

function showBudgetStatus() {
    // Calculate monthly budget status
    const monthlyBudget = monthlyBudgets[selectedMonth] || { budget: 0, spent: 0, remaining: 0 };
    
    // Calculate category spending
    const totalBudget = categories.reduce((sum, cat) => sum + cat.limit, 0);
    const totalSpent = categories.reduce((sum, cat) => sum + cat.spent, 0);
    const remaining = totalBudget - totalSpent;
    
    // Calculate monthly statistics
    const monthlyStats = calculateMonthlyStats();
    
    // Add monthly statistics to display
    const monthlyStatsHTML = `
        <div class="monthly-stats">
            <h4>Thống kê theo tháng:</h4>
            ${Object.entries(monthlyStats).map(([month, data]) => `
                <div class="month-stat">
                    <strong>${month}:</strong> ${formatCurrency(data.total)} chi tiêu
                    ${data.total > (monthlyBudgets[month]?.budget || 0) ? '⚠️' : ''}
                </div>
            `).join('')}
        </div>
    `;
    
    // Update UI with budget status
    const statusElement = document.createElement('div');
    statusElement.className = 'budget-status';
    statusElement.innerHTML = `
        <h3>Tổng quan ngân sách</h3>
        <div class="current-month">
            <h4>Tháng hiện tại (${selectedMonth}):</h4>
            <p>Ngân sách: ${formatCurrency(monthlyBudget.budget)}</p>
            <p>Đã chi: ${formatCurrency(monthlyBudget.spent)}</p>
            <p>Còn lại: ${formatCurrency(monthlyBudget.remaining)}</p>
        </div>
        <div class="overall-stats">
            <h4>Tổng quan:</h4>
            <p>Tổng ngân sách: ${formatCurrency(totalBudget)}</p>
            <p>Tổng chi tiêu: ${formatCurrency(totalSpent)}</p>
            <p>Tổng còn lại: ${formatCurrency(remaining)}</p>
        </div>
        <div class="category-stats">
            <h4>Chi tiết theo danh mục:</h4>
            ${categories.map(cat => `
                <p>${cat.name}: ${formatCurrency(cat.spent)} / ${formatCurrency(cat.limit)}</p>
            `).join('')}
        </div>
    `;
    
    // Show warning if over budget
    if (totalSpent > totalBudget) {
        const warningElement = document.createElement('div');
        warningElement.className = 'budget-warning';
        warningElement.innerHTML = `⚠️ Cảnh báo: Bạn đã vượt quá ngân sách!`;
        statusElement.prepend(warningElement);
    }
    
    // Remove previous status if exists
    const oldStatus = document.querySelector('.budget-status');
    if (oldStatus) oldStatus.remove();
    
    // Insert after categories section
    document.querySelector('.category-section').after(statusElement);
}

// ========== UTILITY FUNCTIONS ==========
function toggleSortDirection() {
    sortDirection = sortDirection === 'desc' ? 'asc' : 'desc';
    elements.sortBtn.textContent = `Sắp xếp: ${sortDirection === 'desc' ? 'Giảm dần ▼' : 'Tăng dần ▲'}`;
    currentPage = 1; // Reset to first page when changing sort
    renderTransactions();
}

function changePage(direction) {
    const totalPages = Math.ceil(transactions.length / itemsPerPage);
    const newPage = currentPage + direction;
    
    if (newPage > 0 && newPage <= totalPages) {
        currentPage = newPage;
        renderTransactions();
    }
}

function closeEditModal() {
    elements.editModal.style.display = 'none';
    editingCategoryId = null;
}

function saveData() {
    localStorage.setItem('monthlyBudgets', JSON.stringify(monthlyBudgets));
    localStorage.setItem('categories', JSON.stringify(categories));
    localStorage.setItem('transactions', JSON.stringify(transactions));
}

function setMonthlyBudget() {
    const budget = parseFloat(document.getElementById('budgetInput').value);
    
    if (isNaN(budget) || budget <= 0) {
        alert('Vui lòng nhập số tiền ngân sách hợp lệ');
        return;
    }
    
    monthlyBudgets[selectedMonth] = {
        budget: budget,
        spent: 0,
        remaining: budget
    };
    
    saveData();
    updateBudgetDisplay();
}

function updateBudgetDisplay() {
    const budgetData = monthlyBudgets[selectedMonth] || { budget: 0, spent: 0, remaining: 0 };
    document.getElementById('remainingAmount').textContent = formatCurrency(budgetData.remaining);
    
    if (budgetData.budget === 0) {
        alert('Chưa nhập ngân sách cho tháng này!');
    }
}

// Initialize month selection
document.getElementById('monthSelect').addEventListener('change', (e) => {
    selectedMonth = e.target.value;
    updateBudgetDisplay();
});

function formatCurrency(amount) {
    return new Intl.NumberFormat('vi-VN', { 
        style: 'currency', 
        currency: 'VND' 
    }).format(amount);
}

function clearCategoryInputs() {
    elements.categoryName.value = '';
    elements.categoryLimit.value = '';
}

function clearExpenseInputs() {
    elements.expenseAmount.value = '';
    elements.expenseNote.value = '';
}

function validateCategoryInput(name, limit) {
    if (!name || isNaN(limit)) {
        alert('Vui lòng nhập đầy đủ thông tin danh mục');
        return false;
    }
    return true;
}

function calculateMonthlyStats() {
    const months = {};
    const now = new Date();
    const currentMonth = now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0');
    
    transactions.forEach(transaction => {
        const date = new Date(transaction.date);
        const month = date.getFullYear() + '-' + String(date.getMonth() + 1).padStart(2, '0');
        
        if (!months[month]) {
            months[month] = {
                total: 0,
                categories: {}
            };
        }
        
        months[month].total += transaction.amount;
        
        if (!months[month].categories[transaction.category]) {
            months[month].categories[transaction.category] = 0;
        }
        months[month].categories[transaction.category] += transaction.amount;
    });
    
    return months;
}

function validateExpenseInput(categoryId, amount, note) {
    if (!categoryId || isNaN(amount) || !note) {
        alert('Vui lòng nhập đầy đủ thông tin giao dịch');
        return false;
    }
    
    if (amount <= 0) {
        alert('Số tiền phải lớn hơn 0');
        return false;
    }
    
    return true;
}
