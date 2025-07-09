import { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

const OAuthCallbackPage = () => {
    const [searchParams] = useSearchParams();
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [error, setError] = useState('');
    const processedCodeRef = useRef<string | null>(null);
    const navigate = useNavigate();
    const { login } = useAuth();

    useEffect(() => {
        const handleOAuthCallback = async () => {
            try {
                const code = searchParams.get('code');
                const state = searchParams.get('state');
                const error = searchParams.get('error');

                if (error) {
                    throw new Error(`OAuth error: ${error}`);
                }

                if (!code) {
                    throw new Error('No authorization code received');
                }

                // Prevent processing the same code multiple times
                if (processedCodeRef.current === code) {
                    console.log('OAuth code already processed, skipping:', code.substring(0, 10) + '...');
                    return;
                }

                console.log('Processing OAuth callback with code:', code.substring(0, 10) + '...');
                processedCodeRef.current = code;

                // Send the authorization code to our backend
                console.log('OAuthCallback: Making request to backend with:', { code: code.substring(0, 10) + '...', state });

                const response = await axios.post('/api/users/oauth/42/callback', {
                    code,
                    state
                });

                console.log('OAuthCallback: Full response from backend:', {
                    status: response.status,
                    statusText: response.statusText,
                    headers: response.headers,
                    data: response.data,
                    rawData: JSON.stringify(response.data)
                });

                const { accessToken, user } = response.data;

                console.log('OAuthCallback: Destructured data:', {
                    accessToken: accessToken ? 'PROVIDED' : 'MISSING',
                    user,
                    userType: typeof user,
                    userConstructor: user?.constructor?.name,
                    userStringified: JSON.stringify(user),
                    userKeys: user ? Object.keys(user) : [],
                    userValues: user ? Object.values(user) : [],
                    userEntries: user ? Object.entries(user) : [],
                    userDetails: {
                        id: user?.id,
                        username: user?.username,
                        email: user?.email,
                        avatar: user?.avatar
                    }
                });

                // Log the user in
                console.log('OAuthCallback: About to call login with:', { user, userId: user?.id });
                login(accessToken, user);

                console.log('OAuthCallback: Login called, setting status to success');

                // Check what was actually saved
                setTimeout(() => {
                    const savedUser = localStorage.getItem('user');
                    const savedToken = localStorage.getItem('token');
                    console.log('OAuthCallback: Saved to localStorage:', {
                        token: savedToken ? 'SAVED' : 'NOT_SAVED',
                        user: savedUser ? JSON.parse(savedUser) : 'NOT_SAVED'
                    });
                }, 100);
                setStatus('success');

                // Redirect to home page after successful login
                setTimeout(() => {
                    navigate('/');
                }, 2000);

            } catch (err: any) {
                console.error('OAuth callback error:', err);
                console.error('OAuth callback error details:', {
                    status: err.response?.status,
                    data: err.response?.data,
                    message: err.message
                });
                setError(err.response?.data?.message || err.message || 'OAuth authentication failed');
                setStatus('error');

                // Redirect to login page after error
                setTimeout(() => {
                    navigate('/login');
                }, 3000);
            }
        };

        handleOAuthCallback();
    }, [searchParams, login, navigate]);

    const renderContent = () => {
        switch (status) {
            case 'loading':
                return (
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
                        <h2 className="text-2xl font-bold text-white mb-2">Completing Login...</h2>
                        <p className="text-gray-400">Processing your 42 authentication</p>
                    </div>
                );

            case 'success':
                return (
                    <div className="text-center">
                        <div className="text-green-500 text-6xl mb-4">✓</div>
                        <h2 className="text-2xl font-bold text-white mb-2">Login Successful!</h2>
                        <p className="text-gray-400">Redirecting you to the home page...</p>
                    </div>
                );

            case 'error':
                return (
                    <div className="text-center">
                        <div className="text-red-500 text-6xl mb-4">✗</div>
                        <h2 className="text-2xl font-bold text-white mb-2">Login Failed</h2>
                        <p className="text-gray-400 mb-4">{error}</p>
                        <p className="text-gray-500">Redirecting to login page...</p>
                    </div>
                );
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center">
            <div className="bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-md">
                {renderContent()}
            </div>
        </div>
    );
};

export default OAuthCallbackPage;
