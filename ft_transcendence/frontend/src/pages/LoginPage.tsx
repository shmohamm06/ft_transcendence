import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const LoginPage = () => {
    const [formData, setFormData] = useState({
        login: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { loginWithCredentials } = useAuth();
    const navigate = useNavigate();

    const handle42Login = () => {
        window.location.href = 'http://localhost:3001/api/users/oauth/42/authorize';
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await loginWithCredentials(formData.login, formData.password);
            navigate('/');
        } catch (error: any) {
            setError(error.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen text-white flex items-center justify-center relative overflow-hidden">
            {}
            <div className="absolute inset-0 pointer-events-none">
                {}
                {Array.from({ length: 8 }).map((_, i) => (
                    <div
                        key={i}
                        className="absolute w-2 h-2 bg-electric-green rounded-full opacity-20 animate-pulse"
                        style={{
                            left: `${10 + i * 12}%`,
                            top: `${20 + (i % 4) * 15}%`,
                            animationDelay: `${i * 0.7}s`
                        }}
                    />
                ))}

                {}
                <div className="absolute top-8 left-8 w-16 h-16 border-l-2 border-t-2 border-electric-green opacity-30" />
                <div className="absolute bottom-8 right-8 w-16 h-16 border-r-2 border-b-2 border-electric-green opacity-30" />
            </div>

            {}
            <div className="relative z-10 mx-auto max-w-4xl px-6">
            {}
            <   div className="text-center mb-12">
                    <h1 className="text-6xl md:text-7xl font-bold mb-4 bg-gradient-to-r from-white to-green-400 bg-clip-text text-transparent">
                        FT_TRANSCENDENCE
                    </h1>
                    <div className="w-20 h-px bg-gradient-to-r from-transparent via-electric-green to-transparent mx-auto mb-6"></div>
                    <p className="text-lg text-gray-300">
                        Access your account
                    </p>
                </div>

                {}
                <div className="auth-form">
                    {}
                    <button
                        onClick={handle42Login}
                        className="w-full btn btn-primary mb-8 flex items-center justify-center"
                    >
                        Continue with 42
                    </button>

                    {}
                    <div className="flex items-center my-8">
                        <div className="flex-grow h-px bg-white bg-opacity-20"></div>
                        <span className="px-4 text-sm text-gray-400">OR</span>
                        <div className="flex-grow h-px bg-white bg-opacity-20"></div>
                    </div>

                    {}
                    {error && (
                        <div className="border border-red-400 bg-red-400 bg-opacity-10 text-red-400 px-4 py-3 rounded-lg mb-6 text-center">
                            <span className="text-sm">{error}</span>
                        </div>
                    )}

                    {}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="form-group">
                            <label htmlFor="login">Email</label>
                            <input
                                id="login"
                                type="text"
                                value={formData.login}
                                onChange={(e) => setFormData({ ...formData, login: e.target.value })}
                                className="form-input"
                                placeholder="Enter your credentials"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="password">Password</label>
                            <input
                                id="password"
                                type="password"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                className="form-input"
                                placeholder="Enter your password"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="btn btn-secondary w-full"
                        >
                            {loading ? 'Signing in...' : 'Sign In'}
                        </button>
                    </form>

                    {}
                    <div className="text-center mt-8 pt-6 border-t border-white border-opacity-10">
                        <p className="text-sm text-gray-400">
                            New to Pong?{' '}
                            <Link to="/register" className="text-electric-green hover:text-electric-green-dark font-medium">
                                Create account
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
