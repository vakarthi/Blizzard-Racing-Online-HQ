import type { Transaction } from '../types';
import { activityService } from './activityService';

const TRANSACTIONS_KEY = 'blizzard_racing_transactions';

const defaultTransactions: Transaction[] = [
    { id: 'txn-1', date: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString(), description: 'Cyber Sky Securities - Gold Sponsorship', category: 'Sponsorship', type: 'Income', amount: 5000, status: 'Approved', submittedBy: 'Shriv', reviewedBy: 'Shriv' },
    { id: 'txn-2', date: new Date(new Date().setDate(new Date().getDate() - 20)).toISOString(), description: '3D printing filament (5kg)', category: 'Car Materials', type: 'Expense', amount: 150, status: 'Approved', submittedBy: 'Hadi', reviewedBy: 'Shriv' },
    { id: 'txn-3', date: new Date(new Date().setDate(new Date().getDate() - 10)).toISOString(), description: 'Vinyl for pit display', category: 'Pit Display', type: 'Expense', amount: 85, status: 'Pending', submittedBy: 'Aarav' },
];

const getStoredTransactions = (): Transaction[] => {
    const txns = localStorage.getItem(TRANSACTIONS_KEY);
    if(txns) return JSON.parse(txns);
    localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(defaultTransactions));
    return defaultTransactions;
};

export const financeService = {
    getTransactions: (): Transaction[] => {
        return getStoredTransactions().sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    },
    
    addTransaction: (txn: Omit<Transaction, 'id' | 'date' | 'status' | 'submittedBy'>, user: { nickname: string, role: string }): Transaction[] => {
        const txns = getStoredTransactions();
        const newTxn: Transaction = {
            ...txn,
            id: `txn-${Date.now()}`,
            date: new Date().toISOString(),
            status: user.role === 'manager' ? 'Approved' : 'Pending',
            submittedBy: user.nickname,
            ...(user.role === 'manager' && { reviewedBy: user.nickname }),
        };
        const newTxns = [...txns, newTxn];
        localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(newTxns));
        
        if (newTxn.status === 'Approved') {
            activityService.logActivity(user.nickname, 'Transaction Added', newTxn.description);
        }

        return newTxns;
    },

    approveTransaction: (txnId: string, managerNickname: string): Transaction[] => {
        const txns = getStoredTransactions();
        const txnIndex = txns.findIndex(t => t.id === txnId);
        if (txnIndex > -1 && txns[txnIndex].status === 'Pending') {
            txns[txnIndex].status = 'Approved';
            txns[txnIndex].reviewedBy = managerNickname;
            localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(txns));
            activityService.logActivity(txns[txnIndex].submittedBy, 'Transaction Added', txns[txnIndex].description);
        }
        return txns;
    },

    rejectTransaction: (txnId: string, managerNickname: string): Transaction[] => {
        const txns = getStoredTransactions();
        const txnIndex = txns.findIndex(t => t.id === txnId);
        if (txnIndex > -1 && txns[txnIndex].status === 'Pending') {
            txns[txnIndex].status = 'Rejected';
            txns[txnIndex].reviewedBy = managerNickname;
            localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(txns));
        }
        return txns;
    },

    deleteTransaction: (txnId: string): Transaction[] => {
        let txns = getStoredTransactions();
        const newTxns = txns.filter(t => t.id !== txnId);
        localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(newTxns));
        return newTxns;
    },

    getFinancialSummary: () => {
        const transactions = getStoredTransactions().filter(t => t.status === 'Approved');
        
        const totalIncome = transactions
            .filter(t => t.type === 'Income')
            .reduce((sum, t) => sum + t.amount, 0);

        const totalExpenses = transactions
            .filter(t => t.type === 'Expense')
            .reduce((sum, t) => sum + t.amount, 0);

        const remainingBudget = totalIncome - totalExpenses;

        const expenseByCategory = transactions
            .filter(t => t.type === 'Expense')
            .reduce((acc, t) => {
                if (!acc[t.category]) {
                    acc[t.category] = 0;
                }
                acc[t.category] += t.amount;
                return acc;
            }, {} as Record<string, number>);
        
        return { totalIncome, totalExpenses, remainingBudget, expenseByCategory };
    },

    getPendingTransactions: (): Transaction[] => {
        return getStoredTransactions().filter(t => t.status === 'Pending');
    }
};