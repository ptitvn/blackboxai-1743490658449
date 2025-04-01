// User data storage
let users = JSON.parse(localStorage.getItem('users')) || [];
let currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;
let budgets = JSON.parse(localStorage.getItem('budgets')) || {};

// DOM Elements
const registerForm = document.getElementById('registerForm');
const loginForm = document.getElementById('loginForm');
const logoutBtn = document.getElementById('logoutBtn');
const monthSelect = document.getElementById('month');
const budgetInput = document.getElementById('budget');
const setBudgetBtn = document.getElementById('setBudgetBtn');
const expenseNameInput = document.getElementById('expenseName');
const expenseAmountInput = document.getElementById('expenseAmount');
const addExpenseBtn = document.getElementById('addExpenseBtn');
const budgetAmountDisplay = document.getElementById('budgetAmount');
const spentAmountDisplay = document.getElementById('spentAmount');
const remainingAmountDisplay = document.getElementById('remainingAmount');
const expensesList = document.getElementById('expenses');

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    // Check if user is logged in
    if (currentUser && window.location.pathname.includes('login.html')) {
        window.location.href = 'home.html';
    } else if (!currentUser && window.location.pathname.includes('home.html')) {
        window.location.href = 'login.html';
    }

    // Load budget data if on home page
    if (window.location.pathname.includes('home.html') && currentUser) {
        loadBudgetData();
    }
});

// Registration Form
if (registerForm) {
    registerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        
        // Validation
        if (!email) {
            showError('emailError', 'Email không được để trống');
            return;
        }
        
        if (!validateEmail(email)) {
            showError('emailError', 'Email không đúng định dạng');
            return;
        }
        
        if (!password) {
            showError('passwordError', 'Mật khẩu không được để trống');
            return;
        }
        
        if (password.length < 6) {
            showError('passwordError', 'Mật khẩu phải có ít nhất 6 ký tự');
            return;
        }
        
        if (!confirmPassword) {
            showError('confirmPasswordError', 'Xác nhận mật khẩu không được để trống');
            return;
        }
        
        if (password !== confirmPassword) {
            showError('confirmPasswordError', 'Mật khẩu xác nhận không khớp');
            return;
        }
        
        // Check if user already exists
        if (users.some(user => user.email === email)) {
            showError('emailError', 'Email đã được đăng ký');
            return;
        }
        
        // Add new user
        users.push({ email, password });
        localStorage.setItem('users', JSON.stringify(users));
        
        // Redirect to login page
        window.location.href = 'login.html';
    });
}

// Login Form
if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        
        // Validation
        if (!email) {
            showError('loginEmailError', 'Email không được để trống');
            return;
        }
        
        if (!password) {
            showError('loginPasswordError', 'Mật khẩu không được để trống');
            return;
        }
        
        // Check credentials
        const user = users.find(user => user.email === email && user.password === password);
        
        if (!user) {
            showError('loginPasswordError', 'Email hoặc mật khẩu không đúng');
            return;
        }
        
        // Set current user
        currentUser = { email: user.email };
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        
        // Redirect to home page
        window.location.href = 'home.html';
    });
}

// Logout
if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
        if (confirm('Bạn có chắc chắn muốn đăng xuất?')) {
            currentUser = null;
            localStorage.removeItem('currentUser');
            window.location.href = 'login.html';
        }
    });
}

// Budget Management
if (setBudgetBtn) {
    setBudgetBtn.addEventListener('click', () => {
        const month = monthSelect.value;
        const budget = parseFloat(budgetInput.value);
        
        if (!budget || isNaN(budget)) {
            showError('budgetError', 'Vui lòng nhập số tiền');
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
                expenses: [],
                spent: 0
            };
        }
        
        // Update budget
        budgets[currentUser.email][month].budget = budget;
        localStorage.setItem('budgets', JSON.stringify(budgets));
        
        // Update display
        loadBudgetData();
        budgetInput.value = '';
    });
}

// Expense Management
if (addExpenseBtn) {
    addExpenseBtn.addEventListener('click', () => {
        const month = monthSelect.value;
        const name = expenseNameInput.value;
        const amount = parseFloat(expenseAmountInput.value);
        
        if (!name) {
            showError('expenseError', 'Vui lòng nhập tên khoản chi');
            return;
        }
        
        if (!amount || isNaN(amount)) {
            showError('expenseError', 'Vui lòng nhập số tiền');
            return;
        }
        
        // Add expense
        budgets[currentUser.email][month].expenses.push({
            name,
            amount,
            date: new Date().toLocaleDateString()
        });
        
        // Update spent amount
        budgets[currentUser.email][month].spent += amount;
        localStorage.setItem('budgets', JSON.stringify(budgets));
        
        // Update display
        loadBudgetData();
        expenseNameInput.value = '';
        expenseAmountInput.value = '';
    });
}

// Month Change
if (monthSelect) {
    monthSelect.addEventListener('change', loadBudgetData);
}

// Helper Functions
function loadBudgetData() {
    const month = monthSelect.value;
    
    if (!currentUser || !budgets[currentUser.email] || !budgets[currentUser.email][month]) {
        budgetAmountDisplay.textContent = 0;
        spentAmountDisplay.textContent = 0;
        remainingAmountDisplay.textContent = 0;
        expensesList.innerHTML = '';
        return;
    }
    
    const monthData = budgets[currentUser.email][month];
    
    // Update budget display
    budgetAmountDisplay.textContent = monthData.budget.toLocaleString();
    spentAmountDisplay.textContent = monthData.spent.toLocaleString();
    remainingAmountDisplay.textContent = (monthData.budget - monthData.spent).toLocaleString();
    
    // Update expenses list
    expensesList.innerHTML = monthData.expenses.map(expense => `
        <li>
            <span>${expense.name} - ${expense.date}</span>
            <span>${expense.amount.toLocaleString()} VND</span>
        </li>
    `).join('');
}

function showError(elementId, message) {
    const element = document.getElementById(elementId);
    if (element) {
        element.textContent = message;
    }
}

function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}