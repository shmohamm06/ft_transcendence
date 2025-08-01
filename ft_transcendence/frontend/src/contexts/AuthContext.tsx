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
        // Restore token and user from localStorage on initialization
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

                // If user object is empty, try to extract from JWT token
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

        // Verify what was actually saved
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

    const register = async (username: string, email: string, password: string): Promise<void> => {
        try {
            console.log('AuthContext: Register called with:', { username, email });

            // Call register API
            const registerResponse = await axios.post('/api/users/register', {
                username,
                email,
                password
            });

            console.log('AuthContext: Register successful:', registerResponse.data);

            // After successful registration, log the user in
            const loginResponse = await axios.post('/api/users/login', {
                email,
                password
            });

            console.log('AuthContext: Auto-login after register successful:', loginResponse.data);

            const { accessToken } = loginResponse.data;

            // Decode JWT to get user info
            const payload = JSON.parse(atob(accessToken.split('.')[1]));
            const user: User = {
                id: payload.id,
                username: payload.username,
                email: payload.email,
                avatar: payload.avatar,
                auth_provider: payload.auth_provider
            };

            // Use existing login function to set token and user
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
        <AuthContext.Provider value={{ user, token, login, register, logout, isAuthenticated, isLoading }}>
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
