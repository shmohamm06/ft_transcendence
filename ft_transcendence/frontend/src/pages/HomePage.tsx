import { useAuth } from "../contexts/AuthContext";
import { Link } from "react-router-dom";

const HomePage = () => {
    const { user, logout } = useAuth();

    return (
        <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center">
            <div className="text-center">
                <h1 className="text-5xl font-bold mb-4">Welcome, {user?.username}!</h1>
                <p className="text-xl text-gray-400 mb-8">Ready to play Pong?</p>
            </div>

            <div className="space-x-4">
                <Link
                    to="/game"
                    className="px-6 py-3 bg-green-600 hover:bg-green-700 rounded-md text-lg font-semibold transition"
                >
                    Play vs AI
                </Link>
                <Link
                    to="/settings"
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-md text-lg font-semibold transition"
                >
                    Game Settings
                </Link>
                <button
                    onClick={logout}
                    className="px-6 py-3 bg-red-600 hover:bg-red-700 rounded-md text-lg font-semibold transition"
                >
                    Logout
                </button>
            </div>
        </div>
    );
};

export default HomePage;
