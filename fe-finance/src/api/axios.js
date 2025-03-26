import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'https://finance-169399.herokuapp.com/api';
console.log("API request to:", `${API_URL}/auth/register`);

const axiosInstance = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    },
    withCredentials: true
});

axiosInstance.interceptors.request.use(
    (config) => {
        const userEmail = localStorage.getItem('userEmail');
        if (userEmail) {
            console.log('Sending a request from email:', userEmail);
            config.headers['Email'] = userEmail;
        } else {
            console.warn('No user email in localStorage');
        }
        return config;
    },
    (error) => {
        console.error('Error in request interceptor:', error);
        return Promise.reject(error);
    }
);

axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response) {
            console.error('Error in interceptor answer:', {
                status: error.response.status,
                data: error.response.data,
                headers: error.response.headers
            });

            if (error.response.status === 401) {
                localStorage.removeItem('userEmail');
                window.location.href = '/';
            }
            return Promise.reject(error);
        } else if (error.request) {
            console.error('Network error:', error.request);
            throw new Error('SERVER_UNAVAILABLE');
        } else {
            console.error('Request error:', error.message);
            return Promise.reject(error);
        }
    }
);

export const checkServerHealth = async () => {
    try {
        await axiosInstance.get('/auth/health');
        return true;
    } catch (error) {
        console.error('Server status check error:', error);
        return false;
    }
};

export const login = async (credentials) => {
    return axiosInstance.post('/auth/login', credentials);
};

export const register = async (userData) => {
    return axiosInstance.post('/auth/register', userData);
};

export const logout = async () => {
    const userEmail = localStorage.getItem('userEmail');
    if (!userEmail) {
        throw new Error('User is not logged in');
    }

    try {
        await axiosInstance.post('/auth/logout', null, {
            params: {email: userEmail}
        });
        localStorage.removeItem('userEmail');
        return true;
    } catch (error) {
        console.error('Error while logging out:', error);
        throw error;
    }
}

// Category
export const getCategories = async () => {
    console.log('Downloading categories...');
    return axiosInstance.get('/categories');
};

export const createCategory = async (categoryData) => {
    console.log('Creating categories:', categoryData);
    return axiosInstance.post('/categories', categoryData);
};

export const updateCategory = async (categoryId, categoryData) => {
    if (!categoryId) {
        throw new Error('Category ID is required');
    }
    console.log('Category update:', {id: categoryId, data: categoryData});
    return axiosInstance.put(`/categories/${categoryId}`, categoryData);
}

export const deleteCategory = async (categoryId) => {
    if (!categoryId) {
        throw new Error('Category ID is required');
    }
    const userEmail = localStorage.getItem('userEmail');
    console.log('Category deletion:', {
        categoryId,
        userEmail,
        headers: axiosInstance.defaults.headers
    });

    try {
        const response = await axiosInstance.delete(`/categories/${categoryId}`);
        console.log('Answer from the server:', {
            status: response.status,
            headers: response.headers,
            data: response.data
        });
        
        if (response.status === 204) {
            console.log('The category has been successfully removed');
            return true;
        } else {
            console.error('Unexpected response status:', response.status);
            throw new Error('Failed to delete category');
        }
    } catch (error) {
        console.error('Error when deleting a category:', {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status
        });
        throw error;
    }
}

// Expenses
export const getExpenses = async () => {
    console.log('Collecting expenses...');
    return axiosInstance.get('/expenses');
};

export const createExpense = async (expenseData) => {
    console.log('Expense creation:', expenseData);
    return axiosInstance.post('/expenses', expenseData);
};

export const updateExpense = async (expenseId, expenseData) => {
    console.log('Expense update:', { id: expenseId, data: expenseData });
    return axiosInstance.put(`/expenses/${expenseId}`, expenseData);
};

export const deleteExpense = async (expenseId) => {
    console.log('Expense removal:', expenseId);
    try {
        const response = await axiosInstance.delete(`/expenses/${expenseId}`);
        console.log('Expense removed successfully');
        return response;
    } catch (error) {
        console.error('Error while deleting the expense:', error);
        throw error;
    }
};

export const getExpensesByCategory = async (categoryId) => {
    console.log('Collection of expenses for categories:', categoryId);
    return axiosInstance.get(`/expenses/category/${categoryId}`);
};

export const getExpensesByDateRange = async (startDate, endDate) => {
    console.log('Collecting expenses in terms of dates:', { start: startDate, end: endDate });
    return axiosInstance.get('/expenses/date-range', {
        params: { start: startDate, end: endDate }
    });
};
