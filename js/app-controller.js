// Main application controller
class AppController {
    constructor() {
        this.dataService = {
            currentUser: JSON.parse(localStorage.getItem('currentUser')),
            financeData: JSON.parse(localStorage.getItem('financeData')) || {
                monthlyBudgets: {},
                categories: [],
                transactions: []
            },
            saveData: function() {
                localStorage.setItem('financeData', JSON.stringify(this.financeData));
            },
            getCurrentMonth: function() {
                return new Date().toISOString().slice(0, 7);
            },
            getMonthlyBudget: function(month) {
                if (!this.financeData.monthlyBudgets[month]) {
                    this.financeData.monthlyBudgets[month] = {
                        budget: 0,
                        spent: 0,
                        remaining: 0
                    };
                }
                return this.financeData.monthlyBudgets[month];
            },
            addCategory: function(name, limit) {
                this.financeData.categories.push({
                    id: Date.now(),
                    name,
                    limit,
                    spent: 0
                });
                this.saveData();
            },
            addTransaction: function(amount, note, categoryId) {
                const month = this.getCurrentMonth();
                const category = this.financeData.categories.find(c => c.id === categoryId);
                
                this.financeData.transactions.push({
                    id: Date.now(),
                    amount,
                    note,
                    category: category ? category.name : 'Khác',
                    categoryId,
                    date: new Date().toISOString()
                });

                if (category) {
                    category.spent += amount;
                }

                const budget = this.getMonthlyBudget(month);
                budget.spent += amount;
                budget.remaining -= amount;

                this.saveData();
            }
        };

        this.uiService = {
            monthSelect: document.getElementById('monthSelect'),
            budgetInput: document.getElementById('budgetInput'),
            remainingAmount: document.getElementById('remainingAmount'),
            categoriesList: document.getElementById('categoriesList'),
            expensesHistory: document.getElementById('expensesHistory'),
            budgetWarning: document.getElementById('budgetWarning'),
            monthlyStats: document.getElementById('monthlyStats'),
            updateBudgetDisplay: function(budget) {
                this.remainingAmount.textContent = `${budget.remaining.toLocaleString()} VND`;
                if (budget.remaining < 0) {
                    this.budgetWarning.textContent = `⚠️ Cảnh báo: Bạn đã vượt quá ngân sách tháng!`;
                    this.budgetWarning.style.display = 'block';
                } else {
                    this.budgetWarning.style.display = 'none';
                }
            },
            renderCategories: function(categories) {
                this.categoriesList.innerHTML = categories.map(category => `
                    <div class="content2">
                        <div class="item">${category.name} - Giới hạn: ${category.limit.toLocaleString()} VND</div>
                        <div class="item_button">
                            <button class="edit-category" data-id="${category.id}">Sửa</button>
                            <button class="delete-category" data-id="${category.id}">Xóa</button>
                        </div>
                    </div>
                `).join('');
            },
            renderTransactions: function(transactions) {
                this.expensesHistory.innerHTML = transactions.map(transaction => `
                    <div class="content2">
                        <div class="item">${transaction.category} - ${transaction.note}: ${transaction.amount.toLocaleString()} VND</div>
                        <div class="item_button">
                            <button class="delete-transaction" data-id="${transaction.id}">Xóa</button>
                        </div>
                    </div>
                `).join('');
            }
        };

        this.init();
    }

    init() {
        if (!this.dataService.currentUser) {
            window.location.href = 'login.html';
            return;
        }

        // Set current month
        const currentDate = new Date();
        this.uiService.monthSelect.value = currentDate.toISOString().slice(0, 7);
        
        this.setupEventListeners();
        this.loadMonthData();
    }

    setupEventListeners() {
        // Logout
        document.querySelector('.logout-button').addEventListener('click', () => {
            if (confirm('Bạn có chắc muốn đăng xuất?')) {
                localStorage.removeItem('currentUser');
                window.location.href = 'login.html';
            }
        });

        // Month selection
        this.uiService.monthSelect.addEventListener('change', () => this.loadMonthData());

        // Save budget
        document.getElementById('saveBudgetBtn').addEventListener('click', () => this.saveBudget());

        // Add category
        document.getElementById('addCategoryBtn').addEventListener('click', () => this.addCategory());

        // Add expense
        document.getElementById('addExpenseBtn').addEventListener('click', () => this.addExpense());
    }

    loadMonthData() {
        const month = this.uiService.monthSelect.value;
        const budget = this.dataService.getMonthlyBudget(month);
        
        this.uiService.updateBudgetDisplay(budget);
        this.uiService.renderCategories(this.dataService.financeData.categories);
        
        const monthlyTransactions = this.dataService.financeData.transactions
            .filter(t => t.date.startsWith(month));
        this.uiService.renderTransactions(monthlyTransactions);
    }

    saveBudget() {
        const amount = parseFloat(this.uiService.budgetInput.value);
        if (isNaN(amount) || amount <= 0) {
            alert('Vui lòng nhập số tiền hợp lệ');
            return;
        }

        const month = this.uiService.monthSelect.value;
        const budget = this.dataService.getMonthlyBudget(month);
        budget.budget = amount;
        budget.remaining = amount - budget.spent;
        
        this.dataService.saveData();
        this.uiService.updateBudgetDisplay(budget);
        this.uiService.budgetInput.value = '';
    }

    addCategory() {
        const name = document.getElementById('categoryName').value.trim();
        const limit = parseFloat(document.getElementById('categoryLimit').value);

        if (!name || isNaN(limit) || limit <= 0) {
            alert('Vui lòng nhập đầy đủ thông tin');
            return;
        }

        this.dataService.addCategory(name, limit);
        this.uiService.renderCategories(this.dataService.financeData.categories);
        
        document.getElementById('categoryName').value = '';
        document.getElementById('categoryLimit').value = '';
    }

    addExpense() {
        const amount = parseFloat(document.getElementById('expenseAmount').value);
        const note = document.getElementById('expenseNote').value.trim();
        const categorySelect = document.getElementById('categorySelect');
        const categoryId = categorySelect ? parseInt(categorySelect.value) : null;

        if (isNaN(amount) || amount <= 0 || !note) {
            alert('Vui lòng nhập đầy đủ thông tin');
            return;
        }

        this.dataService.addTransaction(amount, note, categoryId);
        this.loadMonthData();
        
        document.getElementById('expenseAmount').value = '';
        document.getElementById('expenseNote').value = '';
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    new AppController();
});