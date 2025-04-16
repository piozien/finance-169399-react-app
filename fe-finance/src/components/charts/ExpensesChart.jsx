import {useState, useEffect} from 'react';
import {useNavigate} from 'react-router-dom';
import {getCategories, getExpensesByCategory, getExpensesByDateRange} from '../../api/axios';
import Navbar from '../navigation/Navbar';
import {PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip} from 'recharts';
import DatePicker from 'react-datepicker';
import dateUtils from '../../utils/dateUtils';
import 'react-datepicker/dist/react-datepicker.css';
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

    const handleDateChange = (date, setter) => {
        if (!date) {
            setter('');
            return;
        }
        setter(date.toISOString());
    };

    // Format value in tooltip
    const formatValue = (value) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(value);
    };

    // Format date in tooltip
    const formatTooltipDate = (dateString) => {
        if (!dateString) return '';
        return dateUtils.formatDateUS(dateString);
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

                const chartData = response.data.map(expense => {
                    const amount = parseFloat(expense.amount);
                    return {
                        name: expense.description || 'No description',
                        value: amount,
                        date: dateUtils.formatDateShortUS(expense.date),
                        percentage: ((amount / totalAmount) * 100).toFixed(1)
                    };
                });


                // Calculate total amount for percentage
                const totalAmount = chartData.reduce((sum, item) => sum + item.value, 0);

                // Add percentage to each item
                chartData.forEach(item => {
                    item.percentage = ((item.value / totalAmount) * 100).toFixed(1);
                });

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
        <div className="chart-page" lang="en-US">
            <Navbar onLogout={handleLogout} isLoggingOut={isLoggingOut}/>
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
                        <DatePicker
                            selected={startDate ? new Date(startDate) : null}
                            onChange={(date) => handleDateChange(date, setStartDate)}
                            dateFormat="MM/dd/yyyy"
                            placeholderText="mm/dd/yyyy"
                            className="date-picker"
                            id="startDate"
                        />
                    </div>
                    <div className="control-group">
                        <label htmlFor="endDate">To:</label>
                        <DatePicker
                            selected={endDate ? new Date(endDate) : null}
                            onChange={(date) => handleDateChange(date, setEndDate)}
                            dateFormat="MM/dd/yyyy"
                            placeholderText="mm/dd/yyyy"
                            className="date-picker"
                            id="endDate"
                        />
                    </div>
                </div>

                {error && <div className="message message-error">{error}</div>}
                {isLoading ? (
                    <div>Loading data...</div>
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
                                        label={({name}) => name}
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
                                    <Tooltip content={({active, payload}) => {
                                        if (active && payload && payload.length) {
                                            const data = payload[0];
                                            return (
                                                <div className="custom-tooltip">
                                                    <p className="tooltip-name">{data.name}</p>
                                                    <p className="tooltip-value">{formatValue(data.value)}</p>
                                                    <p className="tooltip-percentage">{data.payload.percentage}% of
                                                        category</p>
                                                    <p className="tooltip-date">{formatTooltipDate(data.payload.date)}</p>
                                                </div>
                                            );
                                        }
                                        return null;
                                    }}/>
                                    <Legend/>
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
