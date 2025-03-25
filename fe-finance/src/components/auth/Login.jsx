import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { login, checkServerHealth } from '../../api/axios';
import './Auth.css';

const Login = ({ onClose, onRegisterClick }) => {
 const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });
  const [status, setStatus] = useState({ type: "", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const checkServer = async () => {
      const isHealthy = await checkServerHealth();
      if (!isHealthy) {
        setStatus({
          type: "error",
          message: "The backend server is unavailable."
        });
      }
    };
    checkServer();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (isSubmitting) {
      return;
    }

    setStatus({ type: "", message: "" });
    setIsSubmitting(true);

    try {
      const isServerHealthy = await checkServerHealth();
      if (!isServerHealthy) {
        setStatus({
          type: "error",
          message: "Unable to connect to the server. Check your Internet connection and try again in a while."
        });
        setIsSubmitting(false);
        return;
      }

      const response = await login(formData);
      console.log('Login response:', response);

      localStorage.setItem('userEmail', formData.email);
      console.log('Stored email in localStorage:', formData.email);

      setStatus({
        type: "success",
        message: `Hello ${response.data.firstName}! Login successful. You will be redirected shortly.`
      });

      setTimeout(() => {
        navigate('/dashboard');
      }, 2000); 

    } catch (err) {
      console.error('Login error details:', {
        message: err.message,
        response: err.response,
        request: err.request
      });
      
      if (err.message === 'SERVER_UNAVAILABLE') {
        setStatus({
          type: "error",
          message: "Unable to connect to the server. Please check if the server is running and try again."
        });
      } else if (err.response?.status === 401) {
        setStatus({
          type: "error",
          message: "Invalid email or password. Please check your credentials and try again."
        });
      } else if (err.response?.status === 400) {
        setStatus({
          type: "error",
          message: "Invalid data format. Please make sure the email is correct."
        });
      } else if (err.response?.status === 404) {
        setStatus({
          type: "error",
          message: "User with this email not found. Please check your email or register a new account."
        });
      } else {
        setStatus({
          type: "error",
          message: err.response?.data?.message || "An unexpected error occurred. Please try again later or contact the administrator."
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-form-container">
      <button className="close-button" onClick={onClose}>&times;</button>
      <h2>Login</h2>
      {status.message && (
        <div className={`status-message ${status.type}`}>
          {status.message}
        </div>
      )}
      <form onSubmit={handleSubmit} className="auth-form">
        <div className="form-group">
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            disabled={isSubmitting}
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            disabled={isSubmitting}
          />
        </div>
        <button type="submit" className="auth-button" disabled={isSubmitting}>
          {isSubmitting ? "Logging in..." : "Log in"}
        </button>
      </form>
      <div className="auth-switch">
        Don't have an account?
        <button onClick={onRegisterClick}>
          Register now!
        </button>
      </div>
    </div>
  );
};

export default Login;