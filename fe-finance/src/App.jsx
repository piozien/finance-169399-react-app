import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Home from './components/home/Home.jsx';
import Dashboard from './components/dashboard/Dashboard.jsx';
import CategoryChart from './components/charts/CategoryChart.jsx';  
import ExpensesChart from './components/charts/ExpensesChart.jsx';
import Footer from './components/navigation/Footer.jsx';
import './App.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      const userEmail = localStorage.getItem('userEmail');
      setIsAuthenticated(!!userEmail);
    };

    checkAuth();

    window.addEventListener('storage', checkAuth);

    return () => {
      window.removeEventListener('storage', checkAuth);
    };
  }, []);

  return (
    <Router>
      <div className="app-container">
        <Routes>
          <Route
            path="/"
            element={isAuthenticated ? <Navigate to="/dashboard" /> : <Home />}
          />
          <Route
            path="/dashboard"
            element={isAuthenticated ? <Dashboard /> : <Navigate to="/" />}
          />
          <Route
            path="/category-chart"
            element={isAuthenticated ? <CategoryChart /> : <Navigate to="/" />}
          />
          <Route
            path="/expenses-chart"
            element={isAuthenticated ? <ExpensesChart /> : <Navigate to="/" />}
          />
        </Routes>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
