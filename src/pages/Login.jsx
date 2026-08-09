import React, { useState } from 'react';
import { Mail, Lock, EyeOff, Eye, Shield } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import '../css/Auth.css';

const Login = () => {
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('admin');
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

        // Save role and redirect
        localStorage.setItem('userRole', role);
        navigate(`/${role}/dashboard`);
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
                        <label htmlFor="role">Login As</label>
                        <div className="input-wrapper">
                            <Shield className="input-icon" size={18} />
                            <select
                                id="role"
                                value={role}
                                onChange={(e) => setRole(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '14px 16px 14px 44px',
                                    border: '1px solid var(--color-input-border)',
                                    borderRadius: '12px',
                                    backgroundColor: 'var(--color-input-bg)',
                                    fontFamily: 'var(--font-sans)',
                                    fontSize: '14px',
                                    color: 'var(--color-text-dark)',
                                    outline: 'none',
                                    appearance: 'none',
                                    cursor: 'pointer'
                                }}
                            >
                                <option value="admin">Admin</option>
                                <option value="vendor">Vendor</option>
                                <option value="user">User</option>
                            </select>
                        </div>
                    </div>

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
