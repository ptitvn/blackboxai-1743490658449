// Data storage
let users = JSON.parse(localStorage.getItem('users')) || [];
let currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;
let budgets = JSON.parse(localStorage.getItem('budgets')) || {};
let editingCategoryIndex = -1;
let currentPage = 1;
const itemsPerPage = 5;
let sortDirection = 'desc';

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
const expenseCategory = document.getElementById('expenseCategory');
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const sortBtn = document.querySelector('.select div:last-child');
const prevBtn = document.querySelector('.move .item');
const nextBtn = document.querySelector('.move .item2');
const pageBtns = document.querySelectorAll('.move .button');

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    if (!currentUser && window.location.pathname.includes('index.html')) {
        window.location.href = 'login.html';
        return;
    }

    const today = new Date();
    const currentMonth = today.toISOString().substring(0, 7);
    monthSelect.value = currentMonth + '-01';

    loadMonthData();
});

// Event Listeners
if (logoutBtn) {
    logoutBtn.addEventListener('click', showLogoutModal);
}

if (monthSelect) {
    monthSelect.addEventListener('change', loadMonthData);
}

if (saveBudgetBtn) {
    saveBudgetBtn.addEventListener('click', saveBudget);
}

if (addCategoryBtn) {
    addCategoryBtn.addEventListener('click', handleCategoryAction);
}

if (addExpenseBtn) {
    addExpenseBtn.addEventListener('click', addExpense);
}

if (searchBtn) {
    searchBtn.addEventListener('click', searchTransactions);
}

if (sortBtn) {
    sortBtn.addEventListener('click', toggleSortDirection);
}

if (prevBtn) {
    prevBtn.addEventListener('click', () => changePage(-1));
}

if (nextBtn) {
    nextBtn.addEventListener('click', () => changePage(1));
}

pageBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        currentPage = parseInt(btn.textContent);
        loadMonthData();
    });
});

// Functions
function showLogoutModal() {
    const modal = document.createElement('div');
    modal.style.position = 'fixed';
    modal.style.top = '0';
    modal.style.left = '0';
    modal.style.width = '100%';
    modal.style.height = '100%';
    modal.style.backgroundColor = 'rgba(0,0,0,0.5)';
    modal.style.display = 'flex';
    modal.style.justifyContent = 'center';
    modal.style.alignItems = 'center';
    modal.style.zIndex = '1000';
    
    modal.innerHTML = `
        <div style="background: white; padding: 20px; border-radius: 8px; width: 300px;">
            <h3>Xác nhận đăng xuất</h3>
            <p>Bạn có chắc chắn muốn đăng xuất?</p>
            <div style="display: flex; justify-content: space-between; margin-top: 20px;">
                <button id="confirmLogout" style="padding: 8px 16px; background: #4F46E5; color: white; border: none; border-radius: 4px;">Đăng xuất</button>
                <button id="cancelLogout" style="padding: 8px 16px; background: #f0f0f0; border: none; border-radius: 4px;">Hủy</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    document.getElementById('confirmLogout').addEventListener('click', () => {
        currentUser = null;
        localStorage.removeItem('currentUser');
        window.location.href = 'login.html';
    });
    
    document.getElementById('cancelLogout').addEventListener('click', () => {
        document.body.removeChild(modal);
    });
}

function saveBudget() {
    const month = monthSelect.value.substring(0, 7);
    const budget = parseFloat(budgetInput.value);

    if (!budget || isNaN(budget)) {
        alert('Vui lòng nhập số tiền ngân sách');
        return;
    }

    if (!budgets[currentUser.email]) {
        budgets[currentUser.email] = {};
    }

    if (!budgets[currentUser.email][month]) {
        budgets[currentUser.email][month] = {
            budget: 0,
            categories: [],
            expenses: [],
            spent: 0
        };
    }

    budgets[currentUser.email][month].budget = budget;
    localStorage.setItem('budgets', JSON.stringify(budgets));

    loadMonthData();
    budgetInput.value = '';
}

function handleCategoryAction() {
    const month = monthSelect.value.substring(0, 7);
    const name = categoryName.value.trim();
    const limit = parseFloat(categoryLimit.value);

    if (!name) {
        alert('Vui lòng nhập tên danh mục');
        return;
    }

    if (!limit || isNaN(limit)) {
        alert('Vui lòng nhập giới hạn chi tiêu');
        return;
    }

    if (editingCategoryIndex >= 0) {
        budgets[currentUser.email][month].categories[editingCategoryIndex] = {
            name,
            limit,
            spent: budgets[currentUser.email][month].categories[editingCategoryIndex].spent
        };
        editingCategoryIndex = -1;
        addCategoryBtn.textContent = 'Thêm danh mục';
    } else {
        budgets[currentUser.email][month].categories.push({
            name,
            limit,
            spent: 0
        });
    }

    localStorage.setItem('budgets', JSON.stringify(budgets));
    loadMonthData();
    categoryName.value = '';
    categoryLimit.value = '';
}

function editCategory(index) {
    const month = monthSelect.value.substring(0, 7);
    const category = budgets[currentUser.email][month].categories[index];
    
    categoryName.value = category.name;
    categoryLimit.value = category.limit;
    editingCategoryIndex = index;
    addCategoryBtn.textContent = 'Lưu thay đổi';
    categoryName.focus();
}

function deleteCategory(index) {
    if (confirm('Bạn có chắc chắn muốn xóa danh mục này?')) {
        const month = monthSelect.value.substring(0, 7);
        budgets[currentUser.email][month].categories.splice(index, 1);
        localStorage.setItem('budgets', JSON.stringify(budgets));
        loadMonthData();
    }
}

function addExpense() {
    const month = monthSelect.value.substring(0, 7);
    const amount = parseFloat(expenseAmount.value);
    const note = expenseNote.value.trim();
    const category = expenseCategory.value;

    if (!amount || isNaN(amount)) {
        alert('Vui lòng nhập số tiền');
        return;
    }

    if (!category) {
        alert('Vui lòng chọn danh mục');
        return;
    }

    const expense = {
        amount,
        note,
        date: new Date().toISOString(),
        category
    };

    budgets[currentUser.email][month].expenses.push(expense);
    budgets[currentUser.email][month].spent += amount;

    const categoryIndex = budgets[currentUser.email][month].categories.findIndex(
        cat => cat.name === category
    );
    if (categoryIndex >= 0) {
        budgets[currentUser.email][month].categories[categoryIndex].spent += amount;
    }

    localStorage.setItem('budgets', JSON.stringify(budgets));
    loadMonthData();
    expenseAmount.value = '';
    expenseNote.value = '';
}

function deleteExpense(index) {
    if (confirm('Bạn có chắc chắn muốn xóa giao dịch này?')) {
        const month = monthSelect.value.substring(0, 7);
        const expense = budgets[currentUser.email][month].expenses[index];
        
        budgets[currentUser.email][month].spent -= expense.amount;
        
        const categoryIndex = budgets[currentUser.email][month].categories.findIndex(
            cat => cat.name === expense.category
        );
        if (categoryIndex >= 0) {
            budgets[currentUser.email][month].categories[categoryIndex].spent -= expense.amount;
        }
        
        budgets[currentUser.email][month].expenses.splice(index, 1);
        
        localStorage.setItem('budgets', JSON.stringify(budgets));
        loadMonthData();
    }
}

function searchTransactions() {
    const searchTerm = searchInput.value.toLowerCase();
    currentPage = 1;
    loadMonthData(searchTerm);
}

function toggleSortDirection() {
    sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
    sortBtn.textContent = `sắp xếp theo giá (${sortDirection === 'asc' ? 'tăng dần' : 'giảm dần'})`;
    loadMonthData();
}

function changePage(direction) {
    const month = monthSelect.value.substring(0, 7);
    const expenses = budgets[currentUser.email]?.[month]?.expenses || [];
    const totalPages = Math.ceil(expenses.length / itemsPerPage);
    
    if (direction === 1 && currentPage < totalPages) {
        currentPage++;
    } else if (direction === -1 && currentPage > 1) {
        currentPage--;
    }
    
    loadMonthData();
}

function loadMonthData(searchTerm = '') {
    const month = monthSelect.value.substring(0, 7);
    
    if (!currentUser || !budgets[currentUser.email] || !budgets[currentUser.email][month]) {
        if (currentUser) {
            if (!budgets[currentUser.email]) {
                budgets[currentUser.email] = {};
            }
            budgets[currentUser.email][month] = {
                budget: 0,
                categories: [],
                expenses: [],
                spent: 0
            };
            localStorage.setItem('budgets', JSON.stringify(budgets));
        }
    }

    const monthData = budgets[currentUser.email][month];
    remainingAmount.textContent = (monthData.budget - monthData.spent).toLocaleString() + ' VND';

    // Update categories list
    categoriesList.innerHTML = monthData.categories.map((category, index) => `
        <div class="content2">
            <div class="item">${category.name} - Giới hạn: ${category.limit.toLocaleString()} VND (Đã chi: ${category.spent.toLocaleString()} VND)</div>
            <div class="item_button">
                <button onclick="editCategory(${index})">Sửa</button>
                <button onclick="deleteCategory(${index})">Xóa</button>
            </div>
        </div>
    `).join('');

    // Update category dropdown
    expenseCategory.innerHTML = '<option value="">Chọn danh mục</option>' + 
        monthData.categories.map(category => `
            <option value="${category.name}">${category.name}</option>
        `).join('');

    // Filter and sort expenses
    let filteredExpenses = monthData.expenses;
    if (searchTerm) {
        filteredExpenses = filteredExpenses.filter(e => 
            e.note.toLowerCase().includes(searchTerm) || 
            e.category.toLowerCase().includes(searchTerm)
        );
    }
    
    filteredExpenses.sort((a, b) => 
        sortDirection === 'asc' ? a.amount - b.amount : b.amount - a.amount
    );

    // Pagination
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedExpenses = filteredExpenses.slice(startIndex, startIndex + itemsPerPage);
    const totalPages = Math.ceil(filteredExpenses.length / itemsPerPage);

    // Update expenses history
    expensesHistory.innerHTML = paginatedExpenses.map((expense, index) => `
        <div class="content2">
            <div class="item">${expense.category}: ${expense.amount.toLocaleString()} VND - ${expense.note}</div>
            <div class="item_button">
                <button onclick="deleteExpense(${startIndex + index})">Xóa</button>
            </div>
        </div>
    `).join('');

    // Update pagination controls
    prevBtn.disabled = currentPage === 1;
    nextBtn.disabled = currentPage === totalPages;
    
    pageBtns.forEach((btn, i) => {
        const pageNum = i + 1;
        btn.style.display = pageNum <= totalPages ? 'block' : 'none';
        btn.disabled = currentPage === pageNum;
    });

    // Budget warning
    if (monthData.spent > monthData.budget) {
        budgetWarning.textContent = `Cảnh báo: Bạn đã vượt quá ngân sách! Đã chi ${monthData.spent.toLocaleString()} / ${monthData.budget.toLocaleString()} VND`;
    } else {
        budgetWarning.textContent = '';
    }

    // Update monthly stats
    updateMonthlyStats();
}

function updateMonthlyStats() {
    if (!currentUser || !budgets[currentUser.email]) {
        monthlyStats.innerHTML = '';
        return;
    }

    const userData = budgets[currentUser.email];
    const months = Object.keys(userData).sort().reverse().slice(0, 3);

    monthlyStats.innerHTML = months.map(month => {
        const data = userData[month];
        const status = data.spent > data.budget ? '❌ Vượt' : '✅ Đạt';
        return `
            <div class="item">
                <span>${month}</span>
                <span>${data.spent.toLocaleString()} VND</span>
                <span>${data.budget.toLocaleString()} VND</span>
                <span>${status}</span>
            </div>
        `;
    }).join('');
}