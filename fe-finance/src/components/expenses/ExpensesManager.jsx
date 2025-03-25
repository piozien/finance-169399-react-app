import { useState, useEffect } from 'react';
import { getExpenses, createExpense, updateExpense, deleteExpense } from '../../api/axios';
import { getCategories } from '../../api/axios';
import { CATEGORY_CHANGED_EVENT } from '../categories/CategoryManager';
import './ExpensesManager.css';

function ExpensesManager() {
    const [expenses, setExpenses] = useState([]);
    const [categories, setCategories] = useState([]);
    const [newExpense, setNewExpense] = useState({
        amount: '',
        description: '',
        categoryId: ''
    });
    const [editingExpense, setEditingExpense] = useState(null);
    const [editForm, setEditForm] = useState({
        amount: '',
        description: '',
        categoryId: ''
    });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [deletingExpenseId, setDeletingExpenseId] = useState(null);
    const [isExpanded, setIsExpanded] = useState(true);

    const checkUserEmail = () => {
        const userEmail = localStorage.getItem('userEmail');
        if (!userEmail) {
            setError('You are not logged in. Please log in again.');
            return false;
        }
        return true;
    };

    const fetchExpenses = async () => {
        if (!checkUserEmail()) return;

        try {
            console.log('Fetching expenses...');
            const response = await getExpenses();
            console.log('Retrieved expenses:', response.data);
            setExpenses(response.data);
            setError('');
        } catch (error) {
            console.error('Error fetching expenses:', error);
            const errorMessage = error.response?.data?.message || error.message;
            setError('Failed to fetch expenses: ' + errorMessage);
        }
    };

    const fetchCategories = async () => {
        if (!checkUserEmail()) return;

        try {
            console.log('Fetching categories...');
            const response = await getCategories();
            console.log('Retrieved categories:', response.data);
            setCategories(response.data);
        } catch (error) {
            console.error('Error fetching categories:', error);
            setError('Failed to fetch categories');
        }
    };

    useEffect(() => {
        const handleCategoryChange = async (event) => {
            const { action, categoryId } = event.detail;
            console.log('Category change detected:', action, categoryId);

            if (action === 'delete') {
                console.log('Refreshing expenses after category deletion...');
                await fetchExpenses();
            }

            console.log('Refreshing categories list...');
            await fetchCategories();
        };

        window.addEventListener(CATEGORY_CHANGED_EVENT, handleCategoryChange);

        return () => {
            window.removeEventListener(CATEGORY_CHANGED_EVENT, handleCategoryChange);
        };
    }, []);

    useEffect(() => {
        fetchExpenses();
        fetchCategories();
    }, []);

    const handleAddExpense = async (e) => {
        e.preventDefault();
        if (!checkUserEmail()) return;

        if (!newExpense.amount || !newExpense.categoryId) {
            setError('Amount and category are required');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            const response = await createExpense(newExpense);
            setNewExpense({ amount: '', description: '', categoryId: '' });
            setExpenses(prevExpenses => [...prevExpenses, response.data]);
            setError('');
        } catch (error) {
            console.error('Error adding expense:', error);
            const errorMessage = error.response?.data?.message || error.message;
            setError('Failed to add expense: ' + errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const handleStartEdit = (expense) => {
        setEditingExpense(expense);
        setEditForm({
            amount: expense.amount,
            description: expense.description || '',
            categoryId: expense.categoryId
        });
        setError('');
    };

    const handleCancelEdit = () => {
        setEditingExpense(null);
        setEditForm({
            amount: '',
            description: '',
            categoryId: ''
        });
        setError('');
    };

    const handleUpdateExpense = async (e, expenseId) => {
        e.preventDefault();
        if (!checkUserEmail()) return;

        if (!editForm.amount || !editForm.categoryId) {
            setError('Amount and category are required');
            return;
        }

        setIsLoading(true);
        console.log('Updating expense:', { id: expenseId, data: editForm });

        try {
            const response = await updateExpense(expenseId, {
                amount: parseFloat(editForm.amount),
                description: editForm.description,
                categoryId: parseInt(editForm.categoryId)
            });
            
            console.log('Expense updated:', response.data);
            
            setExpenses(prevExpenses =>
                prevExpenses.map(exp =>
                    exp.id === expenseId ? response.data : exp
                )
            );
            setEditingExpense(null);
            setEditForm({
                amount: '',
                description: '',
                categoryId: ''
            });
            setError('');
        } catch (error) {
            console.error('Error updating expense:', error);
            const errorMessage = error.response?.data?.message || error.message;
            setError('Failed to update expense: ' + errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteExpense = async (expenseId) => {
        if (!checkUserEmail()) return;

        setDeletingExpenseId(expenseId);
        setIsLoading(true);

        try {
            await deleteExpense(expenseId);
            setExpenses(prevExpenses =>
                prevExpenses.filter(exp => exp.id !== expenseId)
            );
            setError('');
        } catch (error) {
            console.error('Error deleting expense:', error);
            const errorMessage = error.response?.data?.message || error.message;
            setError('Failed to delete expense: ' + errorMessage);
        } finally {
            setIsLoading(false);
            setDeletingExpenseId(null);
        }
    };

    const formatAmount = (amount) => {
        return parseFloat(amount).toFixed(2);
    };

    const toggleExpanded = () => {
        setIsExpanded(!isExpanded);
    };

    return (
        <div className="expense-manager">
            <div className="expense-header" onClick={toggleExpanded}>
                <h2>Expense Management</h2>
                <span className={`expand-icon ${isExpanded ? 'expanded' : ''}`}>&#9650;</span>
            </div>

            {isExpanded && (
                <div className="expense-content">
                    <form onSubmit={handleAddExpense} className="add-expense-form">
                        <div className="form-group">
                            <input
                                type="number"
                                step="0.01"
                                value={newExpense.amount}
                                onChange={(e) => setNewExpense(prev => ({ ...prev, amount: e.target.value }))}
                                placeholder="Amount"
                                disabled={isLoading}
                            />
                            <select
                                value={newExpense.categoryId}
                                onChange={(e) => setNewExpense(prev => ({ ...prev, categoryId: e.target.value }))}
                                disabled={isLoading}
                            >
                                <option value="">Select category</option>
                                {categories.map(category => (
                                    <option key={category.id} value={category.id}>
                                        {category.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group">
                            <input
                                type="text"
                                value={newExpense.description}
                                onChange={(e) => setNewExpense(prev => ({ ...prev, description: e.target.value }))}
                                placeholder="Description (optional)"
                                disabled={isLoading}
                            />
                            <button type="submit" disabled={isLoading}>
                                {isLoading ? 'Adding...' : 'Add Expense'}
                            </button>
                        </div>
                    </form>

                    {error && <div className="error-message">{error}</div>}

                    <div className="expenses-list">
                        {expenses.map(expense => (
                            <div key={expense.id} className="expense-item">
                                {editingExpense?.id === expense.id ? (
                                    <form onSubmit={(e) => handleUpdateExpense(e, expense.id)} className="edit-expense-form">
                                        <div className="edit-form-group">
                                            <input
                                                type="number"
                                                step="0.01"
                                                value={editForm.amount}
                                                onChange={(e) => setEditForm(prev => ({ ...prev, amount: e.target.value }))}
                                                disabled={isLoading}
                                            />
                                            <select
                                                value={editForm.categoryId}
                                                onChange={(e) => setEditForm(prev => ({ ...prev, categoryId: e.target.value }))}
                                                disabled={isLoading}
                                            >
                                                <option value="">Select category</option>
                                                {categories.map(category => (
                                                    <option key={category.id} value={category.id}>
                                                        {category.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="edit-form-group">
                                            <input
                                                type="text"
                                                value={editForm.description}
                                                onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                                                placeholder="Description (optional)"
                                                disabled={isLoading}
                                            />
                                            <div className="edit-buttons">
                                                <button type="submit" disabled={isLoading} className="save-button">
                                                    {isLoading ? 'Saving...' : 'Save'}
                                                </button>
                                                <button type="button" onClick={handleCancelEdit} disabled={isLoading} className="cancel-button">
                                                    Cancel
                                                </button>
                                            </div>
                                        </div>
                                    </form>
                                ) : (
                                    <>
                                        <div className="expense-info">
                                            <span className="expense-amount">{formatAmount(expense.amount)} USD</span>
                                            <span className="expense-category">
                                                {categories.find(cat => cat.id === expense.categoryId)?.name || 'No category'}
                                            </span>
                                            {expense.description && (
                                                <span className="expense-description">{expense.description}</span>
                                            )}
                                        </div>
                                        <div className="expense-actions">
                                            <button
                                                onClick={() => handleStartEdit(expense)}
                                                disabled={isLoading}
                                                className="edit-button"
                                            >
                                                &#9998;
                                            </button>
                                            <button
                                                onClick={() => handleDeleteExpense(expense.id)}
                                                disabled={isLoading || deletingExpenseId === expense.id}
                                                className="delete-button"
                                            >
                                                {deletingExpenseId === expense.id ? '...' : '\u2715'}
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

export default ExpensesManager;
