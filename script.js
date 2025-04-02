// Data Storage
let categories = JSON.parse(localStorage.getItem('categories')) || [];
let transactions = JSON.parse(localStorage.getItem('transactions')) || [];
let currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;
let currentEditingCategoryIndex = null;

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    // Check authentication
    if (!currentUser) {
        window.location.href = 'login.html';
        return;
    }

    renderCategories();
    renderTransactions();
    setupEventListeners();
});

// Render Functions
function renderCategories() {
    const categoriesList = document.getElementById('categories');
    categoriesList.innerHTML = '';
    
    categories.forEach((category, index) => {
        const li = document.createElement('li');
        li.innerHTML = `
            <span>${category.name} - ${category.budget.toLocaleString()} VND</span>
            <div>
                <button onclick="editCategory(${index})">Sửa</button>
                <button onclick="deleteCategory(${index})">Xóa</button>
            </div>
        `;
        categoriesList.appendChild(li);
    });
    
    updateCategoryDropdown();
}

function updateCategoryDropdown() {
    const select = document.getElementById('expenseCategory');
    select.innerHTML = '<option value="">Chọn danh mục</option>';
    
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category.name;
        option.textContent = category.name;
        select.appendChild(option);
    });
}

function renderTransactions() {
    const tbody = document.querySelector('#transactions tbody');
    tbody.innerHTML = '';
    
    transactions.forEach((transaction, index) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${transaction.category}</td>
            <td>${transaction.amount.toLocaleString()} VND</td>
            <td>${transaction.note}</td>
            <td>${new Date(transaction.date).toLocaleDateString()}</td>
            <td><button onclick="deleteTransaction(${index})">Xóa</button></td>
        `;
        tbody.appendChild(tr);
    });
}

// Event Listeners
function setupEventListeners() {
    // Add Category
    document.getElementById('addCategory').addEventListener('click', addCategory);
    
    // Add Expense
    document.getElementById('addExpense').addEventListener('click', addExpense);
    
    // Logout
    document.querySelector('.logout-button').addEventListener('click', () => {
        if (confirm('Bạn có chắc chắn muốn đăng xuất?')) {
            currentUser = null;
            localStorage.removeItem('currentUser');
            window.location.href = 'login.html';
        }
    });
    
    // Account Menu Hover
    document.querySelector('.account-menu').addEventListener('mouseenter', () => {
        document.querySelector('.dropdown-content').style.display = 'block';
    });
    
    document.querySelector('.account-menu').addEventListener('mouseleave', () => {
        document.querySelector('.dropdown-content').style.display = 'none';
    });
    
    // Modal Close
    document.querySelector('.close').addEventListener('click', () => {
        document.getElementById('editModal').style.display = 'none';
    });
    
    // Save Edit
    document.getElementById('saveEdit').addEventListener('click', saveCategoryEdit);
}

// Category Functions
function addCategory() {
    const name = document.getElementById('categoryName').value;
    const budget = parseFloat(document.getElementById('categoryBudget').value);
    
    if (!name || !budget) {
        alert('Vui lòng nhập đầy đủ thông tin');
        return;
    }
    
    categories.push({ name, budget });
    localStorage.setItem('categories', JSON.stringify(categories));
    
    document.getElementById('categoryName').value = '';
    document.getElementById('categoryBudget').value = '';
    renderCategories();
}

function editCategory(index) {
    currentEditingCategoryIndex = index;
    const category = categories[index];
    document.getElementById('editCategoryName').value = category.name;
    document.getElementById('editCategoryBudget').value = category.budget;
    document.getElementById('editModal').style.display = 'block';
}

function saveCategoryEdit() {
    const name = document.getElementById('editCategoryName').value;
    const budget = parseFloat(document.getElementById('editCategoryBudget').value);
    
    if (!name || !budget) {
        alert('Vui lòng nhập đầy đủ thông tin');
        return;
    }
    
    categories[currentEditingCategoryIndex] = { name, budget };
    localStorage.setItem('categories', JSON.stringify(categories));
    
    document.getElementById('editModal').style.display = 'none';
    renderCategories();
}

function deleteCategory(index) {
    if (confirm('Bạn có chắc chắn muốn xóa danh mục này?')) {
        categories.splice(index, 1);
        localStorage.setItem('categories', JSON.stringify(categories));
        renderCategories();
    }
}

// Expense Functions
function addExpense() {
    const category = document.getElementById('expenseCategory').value;
    const amount = parseFloat(document.getElementById('expenseAmount').value);
    const note = document.getElementById('expenseNote').value;
    
    if (!category || !amount || !note) {
        alert('Vui lòng nhập đầy đủ thông tin');
        return;
    }
    
    transactions.push({
        category,
        amount,
        note,
        date: new Date().toISOString()
    });
    localStorage.setItem('transactions', JSON.stringify(transactions));
    
    document.getElementById('expenseAmount').value = '';
    document.getElementById('expenseNote').value = '';
    renderTransactions();
}

function deleteTransaction(index) {
    if (confirm('Bạn có chắc chắn muốn xóa giao dịch này?')) {
        transactions.splice(index, 1);
        localStorage.setItem('transactions', JSON.stringify(transactions));
        renderTransactions();
    }
}

// Initialize the app
window.onload = function() {
    if (!currentUser) {
        window.location.href = 'login.html';
    }
};