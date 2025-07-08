import { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const RegisterPage = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError('');
        console.log('Register form submitted!');
        console.log('Sending data:', { username, email, password: '***' });

        try {
            console.log('Making axios request to /api/users/register...');
            const response = await axios.post('/api/users/register', { username, email, password });
            console.log('Registration successful!', response.data);
            navigate('/login');
        } catch (err: any) {
            console.error('Registration failed!', err);
            console.error('Error response:', err.response);
            console.error('Error message:', err.message);
            console.error('Error status:', err.response?.status);
            console.error('Error data:', err.response?.data);

            if (err.response?.data?.message) {
                setError(err.response.data.message);
            } else if (err.response?.status === 409) {
                setError('User already exists. Please try different username or email.');
            } else if (err.response?.status === 500) {
                setError('Server error. Please try again later.');
            } else {
                setError('Failed to register. Please try again.');
            }
        }
    };

    const testAPI = async () => {
        console.log('=== 🧪 COMPREHENSIVE API TEST ===');

        try {
            // Проверяем базовую конфигурацию
            console.log('🔧 Current location:', window.location.href);
            console.log('🔧 Axios base URL:', axios.defaults.baseURL);
            console.log('🔧 Axios defaults:', axios.defaults);

            // Проверяем доступность frontend
            console.log('📡 Testing frontend server...');
            const frontendTest = await fetch('/');
            console.log('✅ Frontend server response:', frontendTest.status, frontendTest.statusText);

            // Тестируем несуществующий API endpoint
            console.log('📡 Testing API proxy with 404 endpoint...');
            try {
                await axios.get('/api/users/nonexistent');
            } catch (err: any) {
                console.log('✅ 404 test result:', err.response?.status, err.response?.statusText);
            }

            // Главный тест - регистрация
            console.log('📡 Testing registration API...');
            const testData = {
                username: 'testuser_' + Date.now(),
                email: 'test_' + Date.now() + '@example.com',
                password: 'testpassword123'
            };
            console.log('📊 Test data:', testData);

            // Используем fetch вместо axios для сравнения
            console.log('🔄 Trying with fetch first...');
            const fetchResponse = await fetch('/api/users/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(testData)
            });

            console.log('✅ Fetch response status:', fetchResponse.status);
            console.log('✅ Fetch response headers:', Object.fromEntries(fetchResponse.headers.entries()));

            if (fetchResponse.ok) {
                const fetchData = await fetchResponse.json();
                console.log('✅ Fetch response data:', fetchData);

                // Теперь пробуем axios
                console.log('🔄 Now trying with axios...');
                const axiosResponse = await axios.post('/api/users/register', {
                    username: 'testuser2_' + Date.now(),
                    email: 'test2_' + Date.now() + '@example.com',
                    password: 'testpassword123'
                });

                console.log('✅ Axios response:', axiosResponse);
                alert('🎉 Both fetch and axios work! API is functioning correctly.');
            } else {
                const errorText = await fetchResponse.text();
                console.error('❌ Fetch failed:', fetchResponse.status, errorText);
                alert(`❌ Fetch failed: ${fetchResponse.status} ${fetchResponse.statusText}`);
            }

        } catch (err: any) {
            console.error('❌ Comprehensive test failed!', err);
            console.error('❌ Error name:', err.name);
            console.error('❌ Error message:', err.message);
            console.error('❌ Error stack:', err.stack);
            console.error('❌ Error response:', err.response);
            console.error('❌ Is network error:', err.code === 'NETWORK_ERROR');
            console.error('❌ Full error object:', JSON.stringify(err, Object.getOwnPropertyNames(err), 2));

            alert(`❌ API test failed! Error: ${err.message}. Check console for full details.`);
        }
    };

    const handleLoginClick = () => {
        console.log('Login link clicked!');
    };

    return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center">
            <div className="bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-md">
                <h2 className="text-2xl font-bold text-white mb-6 text-center">Create Account</h2>

                <button
                    onClick={testAPI}
                    className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded-md transition mb-4"
                >
                    🧪 Comprehensive API Test
                </button>

                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-gray-400 mb-2" htmlFor="username">Username</label>
                        <input
                            type="text"
                            id="username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>
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
                        Register
                    </button>
                </form>
                <p className="text-center text-gray-400 mt-6">
                    Already have an account? <Link
                        to="/login"
                        className="text-blue-400 hover:underline"
                        onClick={handleLoginClick}
                    >
                        Login here
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default RegisterPage;
