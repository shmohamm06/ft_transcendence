import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import axios from 'axios';

interface User {
    id: number;
    username: string;
    email: string;
    avatar?: string;
    intra_id?: number;
    intra_login?: string;
    auth_provider?: string;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    login: (token: string, user: User) => void;
    loginWithCredentials: (email: string, password: string) => Promise<void>;
    register: (username: string, email: string, password: string) => Promise<void>;
    logout: () => void;
    isAuthenticated: boolean;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const storedToken = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');

        console.log('AuthContext: Restoring from localStorage:', {
            hasToken: !!storedToken,
            hasUser: !!storedUser,
            storedUser: storedUser,
            parsedUser: storedUser ? JSON.parse(storedUser) : null
        });

        if (storedToken && storedUser) {
            try {
                const parsedUser = JSON.parse(storedUser);

                if (!parsedUser.id && storedToken) {
                    console.log('AuthContext: User object empty, extracting from JWT...');
                    try {
                        const payload = JSON.parse(atob(storedToken.split('.')[1]));
                        console.log('AuthContext: JWT payload:', payload);

                        if (payload.id) {
                            const userFromJWT = {
                                id: payload.id,
                                username: payload.username,
                                email: payload.email,
                                avatar: payload.avatar,
                                auth_provider: payload.auth_provider
                            };
                            console.log('AuthContext: Using user from JWT:', userFromJWT);
                            setUser(userFromJWT);
                            localStorage.setItem('user', JSON.stringify(userFromJWT));
                        }
                    } catch (jwtError) {
                        console.error('AuthContext: Failed to parse JWT:', jwtError);
                    }
                } else {
                    setUser(parsedUser);
                }

                setToken(storedToken);
                axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
            } catch (error) {
                console.error('AuthContext: Failed to parse stored user data', error);
                localStorage.removeItem('token');
                localStorage.removeItem('user');
            }
        }

        setIsLoading(false);
    }, []);

    const login = (newToken: string, newUser: User) => {
        // Validate inputs
        if (!newToken || typeof newToken !== 'string') {
            console.error('AuthContext: Invalid token provided');
            throw new Error('Invalid authentication token');
        }

        if (!newUser || typeof newUser !== 'object') {
            console.error('AuthContext: Invalid user object provided');
            throw new Error('Invalid user data');
        }

        // Validate required user fields
        if (!newUser.id || !newUser.username || !newUser.email) {
            console.error('AuthContext: Missing required user fields');
            throw new Error('Invalid user data structure');
        }

        console.log('AuthContext: Login called with:', {
            token: newToken ? 'PROVIDED' : 'MISSING',
            user: newUser,
            userId: newUser?.id,
            userIdType: typeof newUser?.id,
            userKeys: newUser ? Object.keys(newUser) : []
        });

        setToken(newToken);
        setUser(newUser);

        localStorage.setItem('token', newToken);
        const userString = JSON.stringify(newUser);
        localStorage.setItem('user', userString);

        const savedUserString = localStorage.getItem('user');
        const parsedSavedUser = savedUserString ? JSON.parse(savedUserString) : null;
        console.log('AuthContext: Saved to localStorage:', {
            original: newUser,
            serialized: userString,
            parsedBack: parsedSavedUser,
            savedUserId: parsedSavedUser?.id,
            savedUserIdType: typeof parsedSavedUser?.id
        });

        axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
        console.log('AuthContext: Login completed, user authenticated:', !!newToken && !!newUser);
    };

    const loginWithCredentials = async (email: string, password: string): Promise<void> => {
        try {
            console.log('AuthContext: LoginWithCredentials called with:', { email });

            // Validate input
            if (!email || !password) {
                throw new Error('Email and password are required');
            }

            const response = await axios.post('/api/users/login', {
                email,
                password
            });

            console.log('AuthContext: Login response:', response.data);

            const { accessToken } = response.data;

            // Validate JWT token
            if (!accessToken || typeof accessToken !== 'string') {
                throw new Error('Invalid authentication response');
            }

            // Parse and validate JWT payload
            const tokenParts = accessToken.split('.');
            if (tokenParts.length !== 3) {
                throw new Error('Invalid JWT token format');
            }

            const payload = JSON.parse(atob(tokenParts[1]));

            // Validate required fields in JWT payload
            if (!payload.id || !payload.username || !payload.email) {
                throw new Error('Invalid JWT token payload');
            }

            const user: User = {
                id: payload.id,
                username: payload.username,
                email: payload.email,
                avatar: payload.avatar,
                auth_provider: payload.auth_provider
            };

            login(accessToken, user);

        } catch (error: any) {
            console.error('AuthContext: Login error:', error);
            if (error.response?.data?.message) {
                throw new Error(error.response.data.message);
            } else {
                throw new Error('Login failed');
            }
        }
    };

    const register = async (username: string, email: string, password: string): Promise<void> => {
        try {
            console.log('AuthContext: Register called with:', { username, email });

            const registerResponse = await axios.post('/api/users/register', {
                username,
                email,
                password
            });

            console.log('AuthContext: Register successful:', registerResponse.data);

            const loginResponse = await axios.post('/api/users/login', {
                email,
                password
            });

            console.log('AuthContext: Auto-login after register successful:', loginResponse.data);

            const { accessToken } = loginResponse.data;

            const payload = JSON.parse(atob(accessToken.split('.')[1]));
            const user: User = {
                id: payload.id,
                username: payload.username,
                email: payload.email,
                avatar: payload.avatar,
                auth_provider: payload.auth_provider
            };

            login(accessToken, user);

        } catch (error: any) {
            console.error('AuthContext: Registration error:', error);
            if (error.response?.data?.message) {
                throw new Error(error.response.data.message);
            } else {
                throw new Error('Registration failed');
            }
        }
    };

    const logout = () => {
        console.log('AuthContext: Logout called');
        console.trace('AuthContext: Logout call stack');
        setToken(null);
        setUser(null);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        delete axios.defaults.headers.common['Authorization'];
        console.log('AuthContext: Logout completed');
    };

    const isAuthenticated = !!token && !!user;

    return (
        <AuthContext.Provider value={{ user, token, login, loginWithCredentials, register, logout, isAuthenticated, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
