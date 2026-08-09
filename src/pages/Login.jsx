import React, { useState } from 'react';
import { Mail, Lock, EyeOff, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import '../css/Auth.css';

const Login = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errors, setErrors] = useState({});

    const handleSubmit = (e) => {
        e.preventDefault();
        const newErrors = {};
        if (!email) newErrors.email = 'This field is required';
        if (!password) newErrors.password = 'This field is required';

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        // Proceed with login logic here
        console.log('Login submitted', { email, password });
    };

    return (
        <div className="login-container">
            <div className="login-background"></div>
            <div className="login-card">
                <div className="logo-container">
                    <img src="/logo.png" alt="Hey Diamond Logo" className="logo" />
                </div>

                <h1 className="title">Welcome Back</h1>
                <p className="subtitle">Access your premium diamond trading account</p>

                <form className="login-form" onSubmit={handleSubmit}>
                    <div className="input-group">
                        <label htmlFor="email">Email or Username</label>
                        <div className="input-wrapper">
                            <Mail className="input-icon" size={18} />
                            <input
                                type="text"
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

                    <div className="input-group">
                        <label htmlFor="password">Password</label>
                        <div className="input-wrapper">
                            <Lock className="input-icon" size={18} />
                            <input
                                type={showPassword ? "text" : "password"}
                                id="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => {
                                    setPassword(e.target.value);
                                    if (errors.password) setErrors({ ...errors, password: '' });
                                }}
                            />
                            <button
                                type="button"
                                className="toggle-password"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                            </button>
                        </div>
                        {errors.password && <span className="error-text">{errors.password}</span>}
                    </div>

                    <div className="forgot-password">
                        <Link to="/forgot-password">Forgot Password?</Link>
                    </div>

                    <button type="submit" className="submit-button">
                        SIGN IN
                    </button>
                </form>

                <div className="register-link">
                    Don't have an account? <Link to="/register">Register Now</Link>
                </div>
            </div>
        </div>
    );
};

export default Login;
