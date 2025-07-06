import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ReactNode } from 'react';

interface ProtectedRouteProps {
    children: ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
    const { isAuthenticated } = useAuth();

    // Temporarily disable authentication for testing
    // if (!isAuthenticated) {
    //     return <Navigate to="/login" replace />;
    // }

    return <>{children}</>;
};

export default ProtectedRoute;
