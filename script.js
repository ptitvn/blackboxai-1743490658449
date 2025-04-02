// Financial Management System - Complete Implementation

// ========== DATA STORAGE ==========
let categories = JSON.parse(localStorage.getItem('categories')) || [];
let transactions = JSON.parse(localStorage.getItem('transactions')) || [];
let currentPage = 1;
const itemsPerPage = 5;
let sortDirection = 'desc';
let editingCategoryId = null;

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
    renderCategories();
    renderTransactions();
    setupEventListeners();
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
    
    categories.push({ name, limit });
    saveData();
    clearCategoryInputs();
    renderCategories();
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
    transactions.push({
        category: category.name,
        amount,
        note,
        date: new Date().toISOString()
    });
    
    saveData();
    clearExpenseInputs();
    renderTransactions();
}

function handleTransactionActions(e) {
    if (e.target.classList.contains('delete-transaction')) {
        deleteTransaction(e.target.dataset.id);
    }
}

function handleSearch() {
    currentPage = 1;
    renderTransactions(elements.searchInput.value);
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
    
    categories[editingCategoryId] = { name, limit };
    saveData();
    closeEditModal();
    renderCategories();
}

function deleteCategory(id) {
    if (!confirm('Bạn có chắc chắn muốn xóa danh mục này?')) return;
    
    categories.splice(id, 1);
    saveData();
    renderCategories();
}

// ========== TRANSACTION OPERATIONS ==========
function deleteTransaction(id) {
    if (!confirm('Bạn có chắc chắn muốn xóa giao dịch này?')) return;
    
    transactions.splice(id, 1);
    saveData();
    renderTransactions();
}

// ========== UTILITY FUNCTIONS ==========
function toggleSortDirection() {
    sortDirection = sortDirection === 'desc' ? 'asc' : 'desc';
    elements.sortBtn.textContent = `Sắp xếp: ${sortDirection === 'desc' ? 'Giảm dần ▼' : 'Tăng dần ▲'}`;
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
    localStorage.setItem('categories', JSON.stringify(categories));
    localStorage.setItem('transactions', JSON.stringify(transactions));
}

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

function validateExpenseInput(categoryId, amount, note) {
    if (!categoryId || isNaN(amount) || !note) {
        alert('Vui lòng nhập đầy đủ thông tin giao dịch');
        return false;
    }
    return true;
}