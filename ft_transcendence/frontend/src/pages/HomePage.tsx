import React from "react";
import { useAuth } from "../contexts/AuthContext";
import { Link } from "react-router-dom";

const HomePage = () => {
    const { user, logout } = useAuth();

    return (
        <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4">
            <div className="text-center space-y-8">
                <h1 className="text-5xl font-bold text-white">
                    Welcome, {user?.username || 'Player'}!
                </h1>
                <p className="text-xl text-gray-300">
                    Ready to play games?
                </p>

                {/* Game Buttons */}
                <div className="space-y-4">
                    <Link
                        to="/game"
                        className="block w-64 mx-auto px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg text-lg font-semibold transition"
                    >
                        🏓 Play Pong vs AI
                    </Link>

                    <Link
                        to="/game?mode=pvp"
                        className="block w-64 mx-auto px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-lg font-semibold transition"
                    >
                        🏓 Pong: Player vs Player
                    </Link>

                    <Link
                        to="/tournament"
                        className="block w-64 mx-auto px-6 py-3 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg text-lg font-semibold transition"
                    >
                        🏆 Pong Tournament
                    </Link>

                    <Link
                        to="/tictactoe"
                        className="block w-64 mx-auto px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-lg font-semibold transition"
                    >
                        ❌⭕ Tic-Tac-Toe
                    </Link>

                    <Link
                        to="/settings"
                        className="block w-64 mx-auto px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-lg font-semibold transition"
                    >
                        ⚙️ Settings
                    </Link>

                    <button
                        onClick={logout}
                        className="block w-64 mx-auto px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg text-lg font-semibold transition"
                    >
                        🚪 Logout
                    </button>
                </div>
            </div>
        </div>
    );
};

export default HomePage;
