import React, { useState } from 'react';
import { Mail, Lock, EyeOff, Eye, AlertCircle, Loader2 } from 'lucide-react';
import { Link, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../css/Auth.css';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const Login = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { login, isAuthenticated, booting } = useAuth();

    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errors, setErrors] = useState({});
    const [generalError, setGeneralError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    // Already logged in -> go to app (respect the page that bounced us here).
    if (!booting && isAuthenticated) {
        return <Navigate to={location.state?.from || '/dashboard'} replace />;
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setGeneralError('');

        // Client-side validation mirrors backend LoginRequest rules.
        const newErrors = {};
        if (!email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!EMAIL_RE.test(email.trim())) {
            newErrors.email = 'Enter a valid email address';
        }
        if (!password) {
            newErrors.password = 'Password is required';
        }
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setSubmitting(true);
        try {
            const res = await login(email.trim(), password);
            if (res?.success) {
                navigate(location.state?.from || '/dashboard', { replace: true });
            } else {
                setGeneralError(res?.message || 'Login failed. Please try again.');
            }
        } catch (err) {
            const data = err.response?.data;
            if (data?.errors) {
                // 422 validation errors from backend (arrays per field).
                const fieldErrors = {};
                Object.keys(data.errors).forEach((key) => {
                    const msgs = data.errors[key];
                    fieldErrors[key] = Array.isArray(msgs) ? msgs[0] : String(msgs);
                });
                setErrors(fieldErrors);
                if (data.message) setGeneralError(data.message);
            } else {
                // 401 invalid credentials / 403 inactive / network errors.
                setGeneralError(
                    data?.message ||
                    (err.code === 'ERR_NETWORK'
                        ? 'Cannot reach the server. Please check your connection.'
                        : 'Login failed. Please try again.')
                );
            }
        } finally {
            setSubmitting(false);
        }
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

                {generalError && (
                    <div className="auth-alert" role="alert">
                        <AlertCircle size={18} />
                        <span>{generalError}</span>
                    </div>
                )}

                <form className="login-form" onSubmit={handleSubmit} noValidate>
                    <div className="input-group">
                        <label htmlFor="email">Email</label>
                        <div className="input-wrapper">
                            <Mail className="input-icon" size={18} />
                            <input
                                type="email"
                                id="email"
                                placeholder="heydiamond111@gmail.com"
                                value={email}
                                autoComplete="email"
                                disabled={submitting}
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
                                autoComplete="current-password"
                                disabled={submitting}
                                onChange={(e) => {
                                    setPassword(e.target.value);
                                    if (errors.password) setErrors({ ...errors, password: '' });
                                }}
                            />
                            <button
                                type="button"
                                className="toggle-password"
                                onClick={() => setShowPassword(!showPassword)}
                                aria-label={showPassword ? 'Hide password' : 'Show password'}
                            >
                                {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                            </button>
                        </div>
                        {errors.password && <span className="error-text">{errors.password}</span>}
                    </div>

                    <div className="forgot-password">
                        <Link to="/forgot-password">Forgot Password?</Link>
                    </div>

                    <button type="submit" className="submit-button" disabled={submitting}>
                        {submitting ? (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                                <Loader2 size={18} className="spin" /> SIGNING IN...
                            </span>
                        ) : (
                            'SIGN IN'
                        )}
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
