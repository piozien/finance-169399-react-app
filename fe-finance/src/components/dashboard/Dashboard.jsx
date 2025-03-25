import { useState } from 'react';
import { logout } from '../../api/axios';
import CategoryManager from '../categories/CategoryManager';
import ExpensesManager from '../expenses/ExpensesManager';
import Navbar from '../navigation/Navbar';
import './Dashboard.css';

function Dashboard() {
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    if (isLoggingOut) return;
    
    setIsLoggingOut(true);
    try {
      await logout();
      localStorage.removeItem('userEmail');
      window.location.href = '/';
    } catch (error) {
      console.error('Error during logout:', error);
      localStorage.removeItem('userEmail');
      window.location.href = '/';
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="dashboard">
      <Navbar onLogout={handleLogout} isLoggingOut={isLoggingOut} />
      <main className="dashboard-content">
        <div className="dashboard-grid">
          <CategoryManager />
          <ExpensesManager />
        </div>
      </main>
    </div>
  );
}

export default Dashboard;
