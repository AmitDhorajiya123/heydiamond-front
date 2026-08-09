import React, { useState } from 'react';
import { Mail } from 'lucide-react';
import { Link } from 'react-router-dom';
import '../css/Auth.css';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [errors, setErrors] = useState({});

    const handleSubmit = (e) => {
        e.preventDefault();
        const newErrors = {};
        if (!email) newErrors.email = 'This field is required';

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        // Proceed with forgot password logic here
        console.log('Forgot password submitted', { email });
    };

    return (
        <div className="login-container">
            <div className="login-background"></div>
            <div className="login-card">
                <div className="logo-container">
                    <img src="/logo.png" alt="Hey Diamond Logo" className="logo" />
                </div>

                <h1 className="title">Reset Password</h1>
                <p className="subtitle">Enter your email to receive reset instructions</p>

                <form className="login-form" onSubmit={handleSubmit}>
                    <div className="input-group">
                        <label htmlFor="email">Email Address</label>
                        <div className="input-wrapper">
                            <Mail className="input-icon" size={18} />
                            <input
                                type="email"
                                id="email"
                                placeholder="heydiamond111@gmail.com"
                                value={email}
                                onChange={(e) => {
                                    setEmail(e.target.value);
                                    if (errors.email) setErrors({ ...errors, email: '' });
                                }}
                            />
                        </div>
                        {errors.email && <span className="error-text">{errors.email}</span>}
                    </div>

                    <button type="submit" className="submit-button">
                        SEND INSTRUCTIONS
                    </button>
                </form>

                <div className="register-link">
                    Remember your password? <Link to="/login">Sign In</Link>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
