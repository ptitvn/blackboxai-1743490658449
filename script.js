// Data storage
let users = JSON.parse(localStorage.getItem('users')) || [];
let currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;
let budgets = JSON.parse(localStorage.getItem('budgets')) || {};

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

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    // Check authentication
    if (!currentUser && window.location.pathname.includes('index.html')) {
        window.location.href = 'login.html';
    }

    // Set current month as default
    const today = new Date();
    const currentMonth = today.toISOString().substring(0, 7);
    monthSelect.value = currentMonth + '-01';

    // Load data for current month
    loadMonthData();
});

// Logout functionality
if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
        // Create custom confirmation modal
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
    });
}

// Month selection change
if (monthSelect) {
    monthSelect.addEventListener('change', loadMonthData);
}

// Save budget
if (saveBudgetBtn) {
    saveBudgetBtn.addEventListener('click', () => {
        const month = monthSelect.value.substring(0, 7);
        const budget = parseFloat(budgetInput.value);

        if (!budget || isNaN(budget)) {
            alert('Vui lòng nhập số tiền ngân sách');
            return;
        }

        // Initialize user data if not exists
        if (!budgets[currentUser.email]) {
            budgets[currentUser.email] = {};
        }

        // Initialize month data if not exists
        if (!budgets[currentUser.email][month]) {
            budgets[currentUser.email][month] = {
                budget: 0,
                categories: [],
                expenses: [],
                spent: 0
            };
        }

        // Update budget
        budgets[currentUser.email][month].budget = budget;
        localStorage.setItem('budgets', JSON.stringify(budgets));

        // Update display
        loadMonthData();
        budgetInput.value = '';
    });
}

// Add category
if (addCategoryBtn) {
    addCategoryBtn.addEventListener('click', () => {
        const month = monthSelect.value.substring(0, 7);
        const name = categoryName.value;
        const limit = parseFloat(categoryLimit.value);

        if (!name) {
            alert('Vui lòng nhập tên danh mục');
            return;
        }

        if (!limit || isNaN(limit)) {
            alert('Vui lòng nhập giới hạn chi tiêu');
            return;
        }

        // Add category
        budgets[currentUser.email][month].categories.push({
            name,
            limit,
            spent: 0
        });
        localStorage.setItem('budgets', JSON.stringify(budgets));

        // Update display
        loadMonthData();
        categoryName.value = '';
        categoryLimit.value = '';
    });
}

// Add expense
if (addExpenseBtn) {
    addExpenseBtn.addEventListener('click', () => {
        const month = monthSelect.value.substring(0, 7);
        const amount = parseFloat(expenseAmount.value);
        const note = expenseNote.value;

        if (!amount || isNaN(amount)) {
            alert('Vui lòng nhập số tiền');
            return;
        }

        if (!note) {
            alert('Vui lòng nhập ghi chú');
            return;
        }

        // Add expense
        budgets[currentUser.email][month].expenses.push({
            amount,
            note,
            date: new Date().toLocaleDateString(),
            category: 'Khác' // Default category
        });

        // Update spent amount
        budgets[currentUser.email][month].spent += amount;
        localStorage.setItem('budgets', JSON.stringify(budgets));

        // Update display
        loadMonthData();
        expenseAmount.value = '';
        expenseNote.value = '';
    });
}

// Load data for selected month
function loadMonthData() {
    const month = monthSelect.value.substring(0, 7);
    
    if (!currentUser || !budgets[currentUser.email] || !budgets[currentUser.email][month]) {
        // Initialize empty month data
        remainingAmount.textContent = '0 VND';
        categoriesList.innerHTML = '';
        expensesHistory.innerHTML = '';
        budgetWarning.textContent = '';
        monthlyStats.innerHTML = '';
        return;
    }

    const monthData = budgets[currentUser.email][month];

    // Update budget display
    remainingAmount.textContent = (monthData.budget - monthData.spent).toLocaleString() + ' VND';

    // Update categories list
    categoriesList.innerHTML = monthData.categories.map(category => `
        <div class="content2">
            <div class="item">${category.name} - Giới hạn: ${category.limit.toLocaleString()}</div>
            <div class="item_button">
                <button>Sửa</button>
                <button>Xóa</button>
            </div>
        </div>
    `).join('');

    // Update expenses history
    expensesHistory.innerHTML = monthData.expenses.map(expense => `
        <div class="content2">
            <div class="item">${expense.note}: ${expense.amount.toLocaleString()} VND</div>
            <div class="item_button">
                <button>Xóa</button>
            </div>
        </div>
    `).join('');

    // Check for budget warnings
    if (monthData.spent > monthData.budget) {
        budgetWarning.textContent = `Cảnh báo: Bạn đã vượt quá ngân sách! Đã chi ${monthData.spent.toLocaleString()} / ${monthData.budget.toLocaleString()} VND`;
    } else {
        budgetWarning.textContent = '';
    }

    // Update monthly stats
    updateMonthlyStats();
}

// Update monthly statistics
function updateMonthlyStats() {
    if (!currentUser || !budgets[currentUser.email]) {
        monthlyStats.innerHTML = '';
        return;
    }

    const userData = budgets[currentUser.email];
    const months = Object.keys(userData).sort().reverse().slice(0, 3); // Show last 3 months

    monthlyStats.innerHTML = months.map(month => {
        const data = userData[month];
        const status = data.spent > data.budget ? '❌ Vượt' : '✅ Đạt';
        return `
            <div class="item">
                <span>${month}</span>
                <span>${data.spent.toLocaleString()} VND</span>
                <span>${data.budget.toLocaleString()}</span>
                <span>${status}</span>
            </div>
        `;
    }).join('');
}

// Login form validation (in login.html)
if (document.getElementById('loginForm')) {
    document.getElementById('loginForm').addEventListener('submit', function(e) {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;

        // Simple validation
        if (!email || !password) {
            alert('Vui lòng nhập đầy đủ email và mật khẩu');
            return;
        }

        // Check credentials
        const user = users.find(u => u.email === email && u.password === password);
        if (!user) {
            alert('Email hoặc mật khẩu không đúng');
            return;
        }

        // Login success
        currentUser = { email: user.email };
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        window.location.href = 'index.html';
    });
}

// Registration form validation (in register.html)
if (document.getElementById('registerForm')) {
    document.getElementById('registerForm').addEventListener('submit', function(e) {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        // Validation
        if (!email || !password || !confirmPassword) {
            alert('Vui lòng điền đầy đủ thông tin');
            return;
        }

        if (password !== confirmPassword) {
            alert('Mật khẩu xác nhận không khớp');
            return;
        }

        if (password.length < 6) {
            alert('Mật khẩu phải có ít nhất 6 ký tự');
            return;
        }

        // Check if user exists
        if (users.some(u => u.email === email)) {
            alert('Email đã được đăng ký');
            return;
        }

        // Register new user
        users.push({ email, password });
        localStorage.setItem('users', JSON.stringify(users));
        alert('Đăng ký thành công! Vui lòng đăng nhập');
        window.location.href = 'login.html';
    });
}