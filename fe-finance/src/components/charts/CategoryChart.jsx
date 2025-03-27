import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCategories, getExpensesByCategory } from '../../api/axios';
import Navbar from '../navigation/Navbar';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import './Charts.css';

function CategoryChart() {
    const navigate = useNavigate();
    const [categories, setCategories] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#ff7300'];

    const handleLogout = async () => {
        if (isLoggingOut) return;
        
        setIsLoggingOut(true);
        try {
            localStorage.removeItem('userEmail');
            navigate('/');
        } catch (error) {
            console.error('Error during logout:', error);
            localStorage.removeItem('userEmail');
            navigate('/');
        } finally {
            setIsLoggingOut(false);
        }
    };

    const fetchCategoryExpenses = async (categoryId) => {
        try {
            const response = await getExpensesByCategory(categoryId);
            // Calculate total expenses for the category
            return response.data.reduce((sum, expense) => sum + parseFloat(expense.amount), 0);
        } catch (error) {
            console.error(`Error fetching expenses for category ${categoryId}:`, error);
            return 0;
        }
    };

    useEffect(() => {
        const fetchCategories = async () => {
            setIsLoading(true);
            try {
                const response = await getCategories();
                
                // Get expenses for each category
                const categoriesWithExpenses = await Promise.all(
                    response.data.map(async (category) => {
                        const totalExpenses = await fetchCategoryExpenses(category.id);
                        return {
                            name: category.name,
                            value: totalExpenses,
                            id: category.id
                        };
                    })
                );

                // Filter categories that have expenses
                const categoriesWithValues = categoriesWithExpenses.filter(cat => cat.value > 0);
                setCategories(categoriesWithValues);
            } catch (error) {
                console.error('Error fetching categories:', error);
                setError('Failed to fetch category data');
            } finally {
                setIsLoading(false);
            }
        };

        fetchCategories();
    }, []);

    // Format values in tooltip
    const formatValue = (value) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(value);
    };

    return (
        <div className="chart-page">
            <Navbar onLogout={handleLogout} isLoggingOut={isLoggingOut} />
            <div className="chart-container">
                {isLoading ? (
                    <div>Loading data...</div>
                ) : error ? (
                    <div className="message message-error">{error}</div>
                ) : categories.length === 0 ? (
                    <div className="no-data">
                        <h2>No expenses in categories</h2>
                        <p>Add expenses in the management panel to see the chart.</p>
                    </div>
                ) : (
                    <>
                        <h2>Expenses by Category</h2>
                        <div className="chart-content">
                            <ResponsiveContainer width="100%" height={400}>
                                <PieChart>
                                    <Pie
                                        data={categories}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={({ name }) => name}
                                        outerRadius={150}
                                        fill="#8884d8"
                                        dataKey="value"
                                    >
                                        {categories.map((entry, index) => (
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

export default CategoryChart;
