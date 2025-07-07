import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

interface UserProfile {
    id: number;
    username: string;
    email: string;
    pong_wins: number;
    pong_losses: number;
    ttt_wins: number;
    ttt_losses: number;
}

const ProfilePage = () => {
    const { user } = useAuth();
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchProfile();

        // Auto-refresh when user returns to page (e.g., after playing a game)
        const handleFocus = () => {
            console.log('Profile page focused - refreshing stats...');
            fetchProfile();
        };

        window.addEventListener('focus', handleFocus);

        return () => {
            window.removeEventListener('focus', handleFocus);
        };
    }, []);

    const fetchProfile = async () => {
        try {
            console.log('Fetching user profile...');
            const response = await axios.get('/api/users/profile');
            console.log('Profile data received:', response.data);
            setProfile(response.data);
        } catch (err: any) {
            console.error('Failed to fetch profile:', err);
            setError('Failed to load profile data');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
                    <p className="text-xl">Loading profile...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
                <div className="text-center">
                    <p className="text-red-500 text-xl mb-4">{error}</p>
                    <button
                        onClick={fetchProfile}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
                <p className="text-xl">No profile data available</p>
            </div>
        );
    }

    const totalPongGames = profile.pong_wins + profile.pong_losses;
    const totalTttGames = profile.ttt_wins + profile.ttt_losses;
    const totalGames = totalPongGames + totalTttGames;
    const totalWins = profile.pong_wins + profile.ttt_wins;

    const pongWinRate = totalPongGames > 0 ? (profile.pong_wins / totalPongGames * 100).toFixed(1) : '0';
    const tttWinRate = totalTttGames > 0 ? (profile.ttt_wins / totalTttGames * 100).toFixed(1) : '0';
    const overallWinRate = totalGames > 0 ? (totalWins / totalGames * 100).toFixed(1) : '0';

    return (
        <div className="min-h-screen bg-gray-900 text-white p-4">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-3xl font-bold">My Profile</h1>
                    <div className="flex space-x-4">
                        <button
                            onClick={() => {
                                setLoading(true);
                                fetchProfile();
                            }}
                            className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition"
                        >
                            🔄 Refresh Stats
                        </button>
                        <Link
                            to="/"
                            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition"
                        >
                            ← Back to Home
                        </Link>
                    </div>
                </div>

                {/* User Info Card */}
                <div className="bg-gray-800 rounded-lg p-6 mb-8">
                    <div className="flex items-center space-x-6">
                        <div className="w-20 h-20 bg-indigo-600 rounded-full flex items-center justify-center">
                            <span className="text-3xl">👤</span>
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold">{profile.username}</h2>
                            <p className="text-gray-400">{profile.email}</p>
                            <p className="text-sm text-gray-500">Player ID: #{profile.id}</p>
                        </div>
                    </div>
                </div>

                {/* Overall Statistics */}
                <div className="bg-gray-800 rounded-lg p-6 mb-8">
                    <h3 className="text-xl font-bold mb-4">🏆 Overall Statistics</h3>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="bg-gray-700 rounded-lg p-4 text-center">
                            <div className="text-2xl font-bold text-blue-400">{totalGames}</div>
                            <div className="text-sm text-gray-400">Total Games</div>
                        </div>
                        <div className="bg-gray-700 rounded-lg p-4 text-center">
                            <div className="text-2xl font-bold text-green-400">{totalWins}</div>
                            <div className="text-sm text-gray-400">Total Wins</div>
                        </div>
                        <div className="bg-gray-700 rounded-lg p-4 text-center">
                            <div className="text-2xl font-bold text-red-400">{totalGames - totalWins}</div>
                            <div className="text-sm text-gray-400">Total Losses</div>
                        </div>
                        <div className="bg-gray-700 rounded-lg p-4 text-center">
                            <div className="text-2xl font-bold text-yellow-400">{overallWinRate}%</div>
                            <div className="text-sm text-gray-400">Win Rate</div>
                        </div>
                    </div>
                </div>

                {/* Game-specific Statistics */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Pong Statistics */}
                    <div className="bg-gray-800 rounded-lg p-6">
                        <h3 className="text-xl font-bold mb-4 flex items-center">
                            🏓 Pong Statistics
                        </h3>
                        <div className="space-y-4">
                            <div className="flex justify-between">
                                <span className="text-gray-400">Games Played</span>
                                <span className="font-bold">{totalPongGames}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-400">Wins</span>
                                <span className="font-bold text-green-400">{profile.pong_wins}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-400">Losses</span>
                                <span className="font-bold text-red-400">{profile.pong_losses}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-400">Win Rate</span>
                                <span className="font-bold text-yellow-400">{pongWinRate}%</span>
                            </div>
                            <div className="w-full bg-gray-700 rounded-full h-2">
                                <div
                                    className="bg-green-400 h-2 rounded-full transition-all duration-500"
                                    style={{ width: `${pongWinRate}%` }}
                                ></div>
                            </div>
                        </div>
                    </div>

                    {/* Tic-Tac-Toe Statistics */}
                    <div className="bg-gray-800 rounded-lg p-6">
                        <h3 className="text-xl font-bold mb-4 flex items-center">
                            ❌⭕ Tic-Tac-Toe Statistics
                        </h3>
                        <div className="space-y-4">
                            <div className="flex justify-between">
                                <span className="text-gray-400">Games Played</span>
                                <span className="font-bold">{totalTttGames}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-400">Wins</span>
                                <span className="font-bold text-green-400">{profile.ttt_wins}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-400">Losses</span>
                                <span className="font-bold text-red-400">{profile.ttt_losses}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-400">Win Rate</span>
                                <span className="font-bold text-yellow-400">{tttWinRate}%</span>
                            </div>
                            <div className="w-full bg-gray-700 rounded-full h-2">
                                <div
                                    className="bg-orange-400 h-2 rounded-full transition-all duration-500"
                                    style={{ width: `${tttWinRate}%` }}
                                ></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Link
                        to="/game"
                        className="bg-green-600 hover:bg-green-700 rounded-lg p-4 text-center transition"
                    >
                        🏓 Play Pong
                    </Link>
                    <Link
                        to="/tictactoe"
                        className="bg-orange-600 hover:bg-orange-700 rounded-lg p-4 text-center transition"
                    >
                        ❌⭕ Play Tic-Tac-Toe
                    </Link>
                    <Link
                        to="/settings"
                        className="bg-blue-600 hover:bg-blue-700 rounded-lg p-4 text-center transition"
                    >
                        ⚙️ Settings
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
