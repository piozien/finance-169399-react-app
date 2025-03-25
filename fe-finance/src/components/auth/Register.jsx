import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { register, checkServerHealth } from '../../api/axios';
import './Auth.css';

const Register = ({ onClose, onLoginClick }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: ""
  });
  const [status, setStatus] = useState({ type: "", message: "" });
  const [passwordMatch, setPasswordMatch] = useState(true);
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

    if (name === 'password' || name === 'confirmPassword') {
      const otherField = name === 'password' ? formData.confirmPassword : formData.password;
      setPasswordMatch(value === otherField || value === "");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (isSubmitting) {
      return;
    }

    setStatus({ type: "", message: "" });
    setIsSubmitting(true);

    if (!passwordMatch) {
      setStatus({
        type: "error",
        message: "Passwords must match"
      });
      setIsSubmitting(false);
      return;
    }

    const registerData = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      password: formData.password
    };

    try {
      const isServerHealthy = await checkServerHealth();
      if (!isServerHealthy) {
        setStatus({
          type: "error",
          message: "The backend server is unavailable."
        });
        setIsSubmitting(false);
        return;
      }

      const response = await register(registerData);
      console.log('Registration successful:', response);

      setStatus({
        type: "success",
        message: "Registration successful! You will be redirected to login shortly."
      });
      
      setTimeout(() => {
        onLoginClick();
      }, 2000);
    } catch (err) {
      console.error('Registration error details:', {
        message: err.message,
        response: err.response,
        status: err.response?.status,
        data: err.response?.data,
        headers: err.response?.headers
      });
      
      if (err.message === 'SERVER_UNAVAILABLE') {
        setStatus({
          type: "error",
          message: "Unable to connect to the server. Please check if the backend is running."
        });
      } else if (err.response?.status === 400) {
        setStatus({
          type: "error",
          message: err.response.data.message || "Invalid data. Please check your information."
        });
      } else if (err.response?.status === 409) {
        console.log('Received 409 error:', err.response.data);
        setStatus({
          type: "error",
          message: err.response.data.message || "A user with this email already exists."
        });
      } else {
        setStatus({
          type: "error",
          message: err.response?.data?.message || "An error occurred during registration. Please try again later."
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-form-container">
      <button className="close-button" onClick={onClose}>&times;</button>
      <h2>Register</h2>
      {status.message && (
        <div className={`status-message ${status.type}`}>
          {status.message}
        </div>
      )}
      <form onSubmit={handleSubmit} className="auth-form">
        <div className="form-group">
          <label htmlFor="firstName">First Name:</label>
          <input
            type="text"
            id="firstName"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="lastName">Last Name:</label>
          <input
            type="text"
            id="lastName"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
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
          />
        </div>
        <div className="form-group">
          <label htmlFor="confirmPassword">Confirm Password:</label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
          />
        </div>
        {!passwordMatch && (
          <div className="status-message error">
            Passwords do not match
          </div>
        )}
        <button type="submit" disabled={isSubmitting || !passwordMatch}>
          {isSubmitting ? "Registering..." : "Register"}
        </button>
      </form>
      <div className="auth-switch">
        Already have an account?
        <button onClick={onLoginClick}>
          Log in now!
        </button>
      </div>
    </div>
  );
};

export default Register;
