import { useState } from 'react';
import Login from '../auth/Login';
import Register from '../auth/Register';
import './Home.css';

function Home() {
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);

  return (
    <div className="home">
      <div className="welcome-container">
        <h1>Finance Dashboard</h1>
        <p>Manage your finances</p>
        <div className="auth-buttons">
          <button 
            className="auth-button login"
            onClick={() => setShowLogin(true)}
          >
            Log in
          </button>
          <button 
            className="auth-button register"
            onClick={() => setShowRegister(true)}
          >
            Register
          </button>
        </div>
      </div>

      {showLogin && (
        <div className="modal-overlay">
          <Login 
            onClose={() => setShowLogin(false)}
            onRegisterClick={() => {
              setShowLogin(false);
              setShowRegister(true);
            }}
          />
        </div>
      )}

      {showRegister && (
        <div className="modal-overlay">
          <Register 
            onClose={() => setShowRegister(false)}
            onLoginClick={() => {
              setShowRegister(false);
              setShowLogin(true);
            }}
          />
        </div>
      )}
    </div>
  );
}

export default Home;