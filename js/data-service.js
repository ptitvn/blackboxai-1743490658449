class DataService {
    constructor() {
        this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
        this.financeData = JSON.parse(localStorage.getItem('financeData')) || {
            monthlyBudgets: {},
            categories: [],
            transactions: []
        };
    }

    saveData() {
        localStorage.setItem('financeData', JSON.stringify(this.financeData));
    }

    getCurrentMonth() {
        return new Date().toISOString().slice(0, 7);
    }

    getMonthlyBudget(month) {
        if (!this.financeData.monthlyBudgets[month]) {
            this.financeData.monthlyBudgets[month] = {
                budget: 0,
                spent: 0,
                remaining: 0
            };
        }
        return this.financeData.monthlyBudgets[month];
    }

    addCategory(name, limit) {
        this.financeData.categories.push({
            id: Date.now(),
            name,
            limit,
            spent: 0
        });
        this.saveData();
    }

    addTransaction(amount, note, categoryId) {
        const month = this.getCurrentMonth();
        const category = this.financeData.categories.find(c => c.id === categoryId);
        
        // Add transaction
        this.financeData.transactions.push({
            id: Date.now(),
            amount,
            note,
            category: category ? category.name : 'Khác',
            categoryId,
            date: new Date().toISOString()
        });

        // Update category spending
        if (category) {
            category.spent += amount;
        }

        // Update monthly budget
        const budget = this.getMonthlyBudget(month);
        budget.spent += amount;
        budget.remaining -= amount;

        this.saveData();
    }

    searchTransactions(term, month) {
        return this.financeData.transactions.filter(t => 
            t.date.startsWith(month) && 
            (t.note.toLowerCase().includes(term) || 
             t.category.toLowerCase().includes(term))
        );
    }
}

const dataService = new DataService();
export default dataService;