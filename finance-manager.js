// Personal Finance Management System
class FinanceManager {
    constructor() {
        this.monthlyBudgets = {};
        this.categories = [];
        this.transactions = [];
        this.currentMonth = new Date().toISOString().slice(0, 7);
        
        this.loadData();
        this.initUI();
    }
    
    // Load saved data from localStorage
    loadData() {
        const savedData = localStorage.getItem('financeData');
        if (savedData) {
            const data = JSON.parse(savedData);
            this.monthlyBudgets = data.monthlyBudgets || {};
            this.categories = data.categories || [];
            this.transactions = data.transactions || [];
        }
    }
    
    // Save data to localStorage
    saveData() {
        const data = {
            monthlyBudgets: this.monthlyBudgets,
            categories: this.categories,
            transactions: this.transactions
        };
        localStorage.setItem('financeData', JSON.stringify(data));
    }
    
    // Initialize UI components
    initUI() {
        this.setupMonthSelector();
        this.renderCategories();
        this.renderTransactions();
        this.setupEventListeners();
    }
    
    // Set up month selection dropdown
    setupMonthSelector() {
        const monthSelect = document.getElementById('monthSelect');
        monthSelect.value = this.currentMonth;
        
        monthSelect.addEventListener('change', (e) => {
            this.currentMonth = e.target.value;
            this.updateUI();
        });
    }
    
    // Update all UI components
    updateUI() {
        this.renderCategories();
        this.renderTransactions();
        this.updateBudgetDisplay();
    }
    
    // Render categories list
    renderCategories() {
        const container = document.querySelector('.container4');
        if (!container) return;
        
        container.innerHTML = `
            <p>💼 Quản lý danh mục (theo tháng)</p>
            <div class="enter">
                <input type="text" id="newCategoryName" placeholder="Tên danh mục">
                <input type="number" id="newCategoryLimit" placeholder="Giới hạn (VND)">
                <button id="addCategoryBtn">Thêm danh mục</button>
            </div>
        `;
        
        // Add existing categories
        this.categories.forEach(category => {
            const categoryElement = document.createElement('div');
            categoryElement.className = 'content2';
            categoryElement.innerHTML = `
                <div class="item">${category.name} - Giới hạn: ${category.limit.toLocaleString()}</div>
                <div class="item_button">
                    <button class="edit-category" data-id="${category.id}">Sửa</button>
                    <button class="delete-category" data-id="${category.id}">Xóa</button>
                </div>
            `;
            container.appendChild(categoryElement);
        });
    }

    // Add new category
    addCategory(name, limit) {
        if (!name || limit <= 0) {
            this.showAlert('Vui lòng nhập đầy đủ thông tin');
            return false;
        }

        // Check for duplicate category name
        if (this.categories.some(c => c.name.toLowerCase() === name.toLowerCase())) {
            this.showAlert('Danh mục đã tồn tại');
            return false;
        }

        this.categories.push({
            id: Date.now(),
            name,
            limit,
            spent: 0
        });

        this.saveData();
        this.renderCategories();
        return true;
    }

    // Delete category
    deleteCategory(id) {
        if (!confirm('Bạn có chắc muốn xóa danh mục này?')) return false;
        
        this.categories = this.categories.filter(c => c.id !== id);
        this.saveData();
        this.renderCategories();
        return true;
    }
    
    // Render transactions list
    renderTransactions() {
        const container = document.querySelector('.container6 .content3');
        if (!container) return;
        
        container.innerHTML = '';
        
        // Filter transactions for current month
        const monthlyTransactions = this.transactions.filter(
            t => t.date.startsWith(this.currentMonth)
        );
        
        monthlyTransactions.forEach(transaction => {
            const transactionElement = document.createElement('div');
            transactionElement.className = 'content2';
            transactionElement.innerHTML = `
                <div class="item">
                    ${transaction.category} - ${transaction.note}: ${transaction.amount.toLocaleString()}
                </div>
                <div class="item_button">
                    <button class="delete-transaction" data-id="${transaction.id}">Xóa</button>
                </div>
            `;
            container.appendChild(transactionElement);
        });
    }

    // Delete transaction
    deleteTransaction(id) {
        const transaction = this.transactions.find(t => t.id === id);
        if (!transaction) return false;

        // Update category spending
        const category = this.categories.find(c => c.id === transaction.categoryId);
        if (category) {
            category.spent -= transaction.amount;
        }

        // Update monthly budget
        if (this.monthlyBudgets[transaction.date.slice(0, 7)]) {
            this.monthlyBudgets[transaction.date.slice(0, 7)].spent -= transaction.amount;
            this.monthlyBudgets[transaction.date.slice(0, 7)].remaining += transaction.amount;
        }

        // Remove transaction
        this.transactions = this.transactions.filter(t => t.id !== id);
        
        this.saveData();
        this.renderTransactions();
        this.updateBudgetDisplay();
        return true;
    }

    // Add new transaction
    addTransaction(amount, note, categoryId) {
        if (amount <= 0 || !note || !categoryId) {
            this.showAlert('Vui lòng nhập đầy đủ thông tin');
            return false;
        }
        
        const category = this.categories.find(c => c.id === categoryId);
        if (!category) {
            this.showAlert('Danh mục không tồn tại');
            return false;
        }
        
        // Update category spending
        category.spent += amount;
        
        // Update monthly budget
        if (!this.monthlyBudgets[this.currentMonth]) {
            this.monthlyBudgets[this.currentMonth] = { budget: 0, spent: 0, remaining: 0 };
        }
        this.monthlyBudgets[this.currentMonth].spent += amount;
        this.monthlyBudgets[this.currentMonth].remaining -= amount;
        
        // Add transaction
        this.transactions.push({
            id: Date.now(),
            amount,
            note,
            category: category.name,
            categoryId,
            date: new Date().toISOString()
        });
        
        this.saveData();
        this.renderTransactions();
        this.updateBudgetDisplay();
        return true;
    }
    
    // Search transactions
    searchTransactions(term) {
        const container = document.querySelector('.container6 .content3');
        if (!container) return;
        
        container.innerHTML = '';
        
        const results = this.transactions.filter(t => 
            t.note.toLowerCase().includes(term.toLowerCase()) || 
            t.category.toLowerCase().includes(term.toLowerCase())
        );
        
        results.forEach(transaction => {
            const transactionElement = document.createElement('div');
            transactionElement.className = 'content2';
            transactionElement.innerHTML = `
                <div class="item">
                    ${transaction.category} - ${transaction.note}: ${transaction.amount.toLocaleString()}
                </div>
                <div class="item_button">
                    <button class="delete-transaction" data-id="${transaction.id}">Xóa</button>
                </div>
            `;
            container.appendChild(transactionElement);
        });
    }

    // Update budget display
    updateBudgetDisplay() {
        const currentMonthData = this.monthlyBudgets[this.currentMonth] || { 
            budget: 0, 
            spent: 0, 
            remaining: 0 
        };
        
        // Update remaining amount display
        document.getElementById('remainingAmount').textContent = 
            `${currentMonthData.remaining.toLocaleString()} VND`;
        
        // Show warning if over budget
        if (currentMonthData.remaining < 0) {
            document.querySelector('.container7').style.display = 'block';
            document.querySelector('.container7 p').textContent = 
                `Cảnh báo: Bạn đã vượt quá ngân sách tháng!`;
        } else {
            document.querySelector('.container7').style.display = 'none';
        }
    }
    
    // Set up event listeners
    setupEventListeners() {
        // Budget form submission
        document.getElementById('saveBudgetBtn')?.addEventListener('click', () => {
            const amount = parseFloat(document.getElementById('budgetInput').value);
            this.setMonthlyBudget(amount);
        });

        // Add category form
        document.addEventListener('click', (e) => {
            if (e.target.id === 'addCategoryBtn') {
                const name = document.getElementById('newCategoryName').value.trim();
                const limit = parseFloat(document.getElementById('newCategoryLimit').value);
                this.addCategory(name, limit);
            }
            
            // Delete category button
            if (e.target.classList.contains('delete-category')) {
                const id = parseInt(e.target.dataset.id);
                this.deleteCategory(id);
            }
        });

        // Add transaction form
        document.getElementById('addExpenseBtn')?.addEventListener('click', () => {
            const amount = parseFloat(document.getElementById('expenseAmount').value);
            const note = document.getElementById('expenseNote').value.trim();
            const categoryId = parseInt(document.getElementById('expenseCategory').value);
            this.addTransaction(amount, note, categoryId);
        });

        // Delete transaction
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('delete-transaction')) {
                const id = parseInt(e.target.dataset.id);
                this.deleteTransaction(id);
            }
        });

        // Search transactions
        document.getElementById('searchBtn')?.addEventListener('click', () => {
            const searchTerm = document.getElementById('searchInput').value.trim();
            this.searchTransactions(searchTerm);
        });

        // Month selection change
        document.getElementById('monthSelect')?.addEventListener('change', (e) => {
            this.currentMonth = e.target.value;
            this.updateUI();
        });
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    const financeApp = new FinanceManager();
});