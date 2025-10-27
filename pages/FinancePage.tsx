import React, { useState, useEffect, useMemo } from 'react';
import { financeService } from '../services/financeService';
import type { Transaction, TransactionCategory, TransactionType } from '../types';
import { useAuth, useTheme } from '../hooks/useAuth';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, LineChart, Line, XAxis, YAxis, CartesianGrid } from 'recharts';

const AddTransactionModal: React.FC<{ onSave: (txn: Omit<Transaction, 'id' | 'date'| 'status' | 'submittedBy'>) => void, onClose: () => void }> = ({ onSave, onClose }) => {
    const [formData, setFormData] = useState({
        description: '',
        amount: 0,
        type: 'Expense' as TransactionType,
        category: 'Other' as TransactionCategory
    });
    
    const categories: TransactionCategory[] = ['Car Materials', 'Pit Display', 'Travel', 'Marketing', 'Other'];

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
        onClose();
    };
    
    return (
         <div className="fixed inset-0 bg-background-primary/75 flex items-center justify-center z-50 modal-backdrop" onClick={onClose}>
            <div className="bg-background-secondary rounded-lg shadow-xl w-full max-w-lg border border-border-color modal-content" onClick={e => e.stopPropagation()}>
                <form onSubmit={handleSubmit}>
                    <div className="p-6">
                        <h3 className="text-xl font-bold text-text-primary mb-4">Add Transaction</h3>
                        <div className="space-y-4">
                            <input type="text" placeholder="Description" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} required className="w-full bg-background-tertiary text-text-primary rounded p-2 border border-border-color focus:ring-accent focus:border-accent" />
                             <input type="number" placeholder="Amount (£)" value={formData.amount > 0 ? formData.amount : ''} onChange={e => setFormData({...formData, amount: parseFloat(e.target.value) || 0})} required className="w-full bg-background-tertiary text-text-primary rounded p-2 border border-border-color focus:ring-accent focus:border-accent" />
                             <div className="grid grid-cols-2 gap-4">
                                <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value as TransactionType, category: e.target.value === 'Income' ? 'Sponsorship' : 'Other'})} className="w-full bg-background-tertiary text-text-primary rounded p-2 border border-border-color focus:ring-accent focus:border-accent">
                                    <option value="Expense">Expense</option>
                                    <option value="Income">Income</option>
                                </select>
                                <select value={formData.category} disabled={formData.type === 'Income'} onChange={e => setFormData({...formData, category: e.target.value as TransactionCategory})} className="w-full bg-background-tertiary text-text-primary rounded p-2 border border-border-color focus:ring-accent focus:border-accent disabled:opacity-50">
                                    {formData.type === 'Income' ? <option value="Sponsorship">Sponsorship</option> : categories.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                             </div>
                        </div>
                    </div>
                    <div className="bg-background-tertiary px-6 py-3 flex justify-end space-x-2 rounded-b-lg">
                        <button type="button" onClick={onClose} className="bg-border-color hover:bg-opacity-70 text-text-primary font-bold py-2 px-4 rounded-lg">Cancel</button>
                        <button type="submit" className="bg-primary hover:bg-primary-hover text-text-on-primary font-bold py-2 px-4 rounded-lg">Add Transaction</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const FinancePage: React.FC = () => {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [summary, setSummary] = useState(financeService.getFinancialSummary());
    const [isModalOpen, setIsModalOpen] = useState(false);
    // Fix: Destructure `user` and `can` from `useAuth` and `theme` from `useTheme`.
    const { user, can } = useAuth();
    const { theme } = useTheme();

    const canWrite = user?.role === 'manager' || can('finance', 'write');

    const refreshData = () => {
        setTransactions(financeService.getTransactions());
        setSummary(financeService.getFinancialSummary());
    };

    useEffect(() => {
        refreshData();
    }, []);
    
    const handleAddTransaction = (txn: Omit<Transaction, 'id' | 'date' | 'status' | 'submittedBy'>) => {
        if (!user) return;
        financeService.addTransaction(txn, { nickname: user.nickname, role: user.role });
        refreshData();
    };

    const handleApprove = (id: string) => {
        if (!user || user.role !== 'manager') return;
        financeService.approveTransaction(id, user.nickname);
        refreshData();
    };

    const handleReject = (id: string) => {
        if (!user || user.role !== 'manager') return;
        financeService.rejectTransaction(id, user.nickname);
        refreshData();
    };

    const handleDelete = (id: string) => {
        if(window.confirm("Are you sure you want to delete this transaction?")) {
            financeService.deleteTransaction(id);
            refreshData();
        }
    };
    
    const formatCurrency = (amount: number) => new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(amount);

    const pieData = Object.entries(summary.expenseByCategory).map(([name, value]) => ({ name, value }));
    const PIE_COLORS = [theme.colors['--color-primary'], theme.colors['--color-accent'], theme.colors['--color-success'], theme.colors['--color-warning'], theme.colors['--color-danger']];

    const historicalData = useMemo(() => {
        let cumulativeIncome = 0;
        let cumulativeExpense = 0;
        return [...transactions].filter(t => t.status === 'Approved').reverse().map(txn => {
            if (txn.type === 'Income') cumulativeIncome += txn.amount;
            else cumulativeExpense += txn.amount;
            return {
                date: new Date(txn.date).toLocaleDateString(),
                Income: cumulativeIncome,
                Expenses: cumulativeExpense,
                Budget: cumulativeIncome - cumulativeExpense
            };
        });
    }, [transactions]);
    
    const statusPill: Record<Transaction['status'], string> = {
        Approved: 'bg-success/20 text-success',
        Pending: 'bg-warning/20 text-warning',
        Rejected: 'bg-danger/20 text-danger'
    };

    return (
         <div className="animate-fade-in">
             <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl md:text-4xl font-bold text-text-primary">
                    Finance Tracker
                </h1>
                {canWrite && (
                    <button 
                        onClick={() => setIsModalOpen(true)}
                        className="bg-primary hover:bg-primary-hover text-text-on-primary font-bold py-2 px-4 rounded-lg transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 flex items-center space-x-2"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" /></svg>
                        <span>New Transaction</span>
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-success/20 border border-success/50 p-4 rounded-lg"><h3 className="text-sm font-medium text-success">Total Income</h3><p className="text-3xl font-bold text-text-primary">{formatCurrency(summary.totalIncome)}</p></div>
                <div className="bg-danger/20 border border-danger/50 p-4 rounded-lg"><h3 className="text-sm font-medium text-danger">Total Expenses</h3><p className="text-3xl font-bold text-text-primary">{formatCurrency(summary.totalExpenses)}</p></div>
                <div className="bg-primary/20 border border-primary/50 p-4 rounded-lg"><h3 className="text-sm font-medium text-primary">Remaining Budget</h3><p className="text-3xl font-bold text-text-primary">{formatCurrency(summary.remainingBudget)}</p></div>
            </div>
            
            <div className="bg-background-secondary p-6 rounded-lg border border-border-color shadow-lg mb-8">
                <h3 className="text-xl font-bold mb-4 text-text-primary">Approved Budget Over Time</h3>
                <div style={{width: '100%', height: 250}}>
                    <ResponsiveContainer>
                        <LineChart data={historicalData}>
                            <CartesianGrid strokeDasharray="3 3" stroke={theme.colors['--color-border-color']} />
                            <XAxis dataKey="date" stroke={theme.colors['--color-text-secondary']} />
                            <YAxis stroke={theme.colors['--color-text-secondary']} tickFormatter={(value) => `£${value}`} />
                            <Tooltip formatter={(value: number) => formatCurrency(value)} contentStyle={{ backgroundColor: theme.colors['--color-background-primary'] }} />
                            <Legend />
                            <Line type="monotone" dataKey="Income" stroke={theme.colors['--color-success']} />
                            <Line type="monotone" dataKey="Expenses" stroke={theme.colors['--color-danger']} />
                            <Line type="monotone" dataKey="Budget" stroke={theme.colors['--color-primary']} strokeWidth={2} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1 bg-background-secondary p-6 rounded-lg border border-border-color shadow-lg">
                    <h3 className="text-xl font-bold mb-4 text-text-primary">Approved Expense Breakdown</h3>
                    <div style={{width: '100%', height: 250}}>
                        <ResponsiveContainer>
                             <PieChart>
                                <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                                    {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />)}
                                </Pie>
                                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="lg:col-span-2 bg-background-secondary p-6 rounded-lg border border-border-color shadow-lg">
                    <h3 className="text-xl font-bold mb-4 text-text-primary">Transaction History</h3>
                    <div className="max-h-[40vh] overflow-y-auto">
                        <ul className="space-y-3">
                            {transactions.map(txn => (
                                <li key={txn.id} className="flex flex-col sm:flex-row justify-between sm:items-center bg-background-tertiary p-3 rounded-md">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${statusPill[txn.status]}`}>{txn.status}</span>
                                            <p className="font-semibold text-text-primary">{txn.description}</p>
                                        </div>
                                        <p className="text-sm text-text-secondary mt-1">{new Date(txn.date).toLocaleDateString()} - {txn.category} (by {txn.submittedBy})</p>
                                    </div>
                                    <div className="flex items-center space-x-2 self-end sm:self-center mt-2 sm:mt-0">
                                        {user?.role === 'manager' && txn.status === 'Pending' && (
                                            <>
                                                <button onClick={() => handleApprove(txn.id)} className="text-xs font-bold bg-success/80 hover:bg-success text-white px-2 py-1 rounded">Approve</button>
                                                <button onClick={() => handleReject(txn.id)} className="text-xs font-bold bg-danger/80 hover:bg-danger text-white px-2 py-1 rounded">Reject</button>
                                            </>
                                        )}
                                        <p className={`font-bold text-lg ${txn.type === 'Income' ? 'text-success' : 'text-danger'}`}>{txn.type === 'Income' ? '+' : '-'}{formatCurrency(txn.amount)}</p>
                                        {canWrite && <button onClick={() => handleDelete(txn.id)} className="text-danger/50 hover:text-danger">&times;</button>}
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>

             {isModalOpen && canWrite && <AddTransactionModal onSave={handleAddTransaction} onClose={() => setIsModalOpen(false)} />}
         </div>
    );
};

export default FinancePage;