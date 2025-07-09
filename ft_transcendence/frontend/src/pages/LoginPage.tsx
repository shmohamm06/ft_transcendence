import { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

interface LoginResponse {
  accessToken: string;
  // add other fields here if your API returns more data
}

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError('');
        console.log('Login form submitted!');
        try {
            const response = await axios.post<LoginResponse>('/api/users/login', { email, password });
            const { accessToken } = response.data;

            // A proper solution would decode the JWT to get user info
            // For now, let's just create a mock user object.
            const userPayload = JSON.parse(atob(accessToken.split('.')[1]));
            login(accessToken, userPayload);
            navigate('/');
        } catch (err) {
            setError('Invalid email or password.');
            console.error(err);
        }
    };

    const handleRegisterClick = () => {
        console.log('Register link clicked!');
    };

    const handle42Login = async () => {
        try {
            console.log('Initiating 42 OAuth login...');
            const response = await axios.get('/api/users/oauth/42/authorize');
            const { authURL } = response.data;

            // Redirect to 42 OAuth
            window.location.href = authURL;
        } catch (err) {
            console.error('Failed to initiate 42 OAuth:', err);
            setError('Failed to initiate 42 login. Please try again.');
        }
    };

    const testClick = () => {
        alert('Test button works!');
        console.log('Test button clicked!');
    };

    return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center">
            <div className="bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-md">
                <h2 className="text-2xl font-bold text-white mb-6 text-center">Login</h2>

                <button
                    onClick={testClick}
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-md transition mb-4"
                >
                    🧪 Test Click (Should Show Alert)
                </button>

                {/* 42 OAuth Login Button */}
                <button
                    onClick={handle42Login}
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-4 rounded-md transition mb-4 flex items-center justify-center"
                >
                    <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                    </svg>
                    Login with 42
                </button>

                <div className="flex items-center my-4">
                    <div className="flex-grow border-t border-gray-600"></div>
                    <span className="px-3 text-gray-400">or</span>
                    <div className="flex-grow border-t border-gray-600"></div>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-gray-400 mb-2" htmlFor="email">Email</label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>
                    <div className="mb-6">
                        <label className="block text-gray-400 mb-2" htmlFor="password">Password</label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>
                    {error && <p className="text-red-500 text-center mb-4">{error}</p>}
                    <button
                        type="submit"
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md transition"
                    >
                        Login
                    </button>
                </form>
                <p className="text-center text-gray-400 mt-6">
                    Don't have an account? <Link
                        to="/register"
                        className="text-blue-400 hover:underline"
                        onClick={handleRegisterClick}
                    >
                        Register here
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default LoginPage;
