import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCategories, getExpensesByCategory, getExpensesByDateRange } from '../../api/axios';
import Navbar from '../navigation/Navbar';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import './Charts.css';

function ExpensesChart() {
    const navigate = useNavigate();
    const [expenses, setExpenses] = useState([]);
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    // Colors for the chart
    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#ff7300'];

    const handleLogout = async () => {
        if (isLoggingOut) return;
        
        setIsLoggingOut(true);
        try {
            localStorage.removeItem('userEmail');
            navigate('/');
        } catch (error) {
            console.error('Error logging out:', error);
            localStorage.removeItem('userEmail');
            navigate('/');
        } finally {
            setIsLoggingOut(false);
        }
    };

    // Fetch categories on first render
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await getCategories();
                setCategories(response.data);
            } catch (error) {
                console.error('Error fetching categories:', error);
                setError('Failed to fetch categories');
            }
        };

        fetchCategories();
    }, []);

    // Format value in tooltip
    const formatValue = (value) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(value);
    };

    // Fetch expenses when category or dates change
    useEffect(() => {
        const fetchExpenses = async () => {
            if (!selectedCategory) return;

            setIsLoading(true);
            setError('');
            try {
                let response;
                if (startDate && endDate) {
                    // If date range is selected, get expenses for that range
                    response = await getExpensesByDateRange(startDate, endDate);
                    // Filter only expenses from selected category
                    response.data = response.data.filter(expense => 
                        expense.categoryId === parseInt(selectedCategory)
                    );
                } else {
                    // If no date range selected, get all expenses from category
                    response = await getExpensesByCategory(selectedCategory);
                }

                // Prepare chart data - each expense separately
                const chartData = response.data.map(expense => ({
                    name: expense.description || 'No description',
                    value: parseFloat(expense.amount),
                    date: new Date(expense.date).toLocaleDateString('en-US')
                }));

                setExpenses(chartData);
            } catch (error) {
                console.error('Error fetching expenses:', error);
                setError('Failed to fetch expenses');
            } finally {
                setIsLoading(false);
            }
        };

        fetchExpenses();
    }, [selectedCategory, startDate, endDate]);

    return (
        <div className="chart-page">
            <Navbar onLogout={handleLogout} isLoggingOut={isLoggingOut} />
            <div className="chart-container">
                <div className="chart-controls">
                    <div className="control-group">
                        <label htmlFor="category">Category:</label>
                        <select 
                            id="category"
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                        >
                            <option value="">Select category</option>
                            {categories.map(category => (
                                <option key={category.id} value={category.id}>
                                    {category.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="control-group">
                        <label htmlFor="startDate">From:</label>
                        <input
                            type="datetime-local"
                            id="startDate"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                        />
                    </div>
                    <div className="control-group">
                        <label htmlFor="endDate">To:</label>
                        <input
                            type="datetime-local"
                            id="endDate"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                        />
                    </div>
                </div>

                {isLoading ? (
                    <div>Loading data...</div>
                ) : error ? (
                    <div className="error">{error}</div>
                ) : !selectedCategory ? (
                    <div className="no-data">
                        <h2>Select category</h2>
                        <p>To view the expenses chart, select a category from the list above.</p>
                    </div>
                ) : expenses.length === 0 ? (
                    <div className="no-data">
                        <h2>No expenses</h2>
                        <p>There are no expenses for this category in the selected date range.</p>
                    </div>
                ) : (
                    <>
                        <h2>Expenses Chart Over Time</h2>
                        <div className="chart-content">
                            <ResponsiveContainer width="100%" height={400}>
                                <PieChart>
                                    <Pie
                                        data={expenses}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={({ name }) => name}
                                        outerRadius={150}
                                        innerRadius={0}
                                        paddingAngle={0}
                                        startAngle={90}
                                        endAngle={450}
                                        fill="#8884d8"
                                        dataKey="value"
                                    >
                                        {expenses.map((entry, index) => (
                                            <Cell 
                                                key={`cell-${index}`} 
                                                fill={COLORS[index % COLORS.length]}
                                            />
                                        ))}
                                    </Pie>
                                    <Tooltip content={({ active, payload }) => {
                                        if (active && payload && payload.length) {
                                            const data = payload[0];
                                            return (
                                                <div className="custom-tooltip">
                                                    <p className="tooltip-name">{data.name}</p>
                                                    <p className="tooltip-value">{formatValue(data.value)}</p>
                                                    <p className="tooltip-date">{data.payload.date}</p>
                                                </div>
                                            );
                                        }
                                        return null;
                                    }} />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

export default ExpensesChart;
