import { Link } from 'react-router-dom';
import { FaUserCircle, FaChartPie, FaHome, FaMoneyBillWave } from 'react-icons/fa';
import './Navbar.css';

function Navbar({ onLogout, isLoggingOut }) {
    return (
        <nav className="navbar">
            <div className="navbar-brand">
                <Link to="/dashboard" className="brand-link">
                    <FaMoneyBillWave className="brand-icon" />
                    <span>Finance Dashboard</span>
                </Link>
            </div>
            <div className="nav-links">
                <Link to="/dashboard" className="nav-link">
                    <FaHome className="nav-icon" />
                    <span>Dashboard</span>
                </Link>
                <Link to="/category-chart" className="nav-link">
                    <FaChartPie className="nav-icon" />
                    <span>Categories</span>
                </Link>
                <Link to="/expenses-chart" className="nav-link">
                    <FaChartPie className="nav-icon" />
                    <span>Expenses</span>
                </Link>
            </div>
            <button 
                className="logout-button"
                onClick={onLogout}
                disabled={isLoggingOut}
            >
                <FaUserCircle className="user-icon" />
                <span>{isLoggingOut ? 'Logout...' : 'Logout'}</span>
            </button>
        </nav>
    );
}

export default Navbar;
