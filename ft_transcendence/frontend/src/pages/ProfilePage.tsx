import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProfilePage = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState({
        totalGames: 0,
        totalWins: 0,
        totalLosses: 0,
        winRate: 0,
        pongGames: 0,
        pongWins: 0,
        pongLosses: 0,
        pongWinRate: 0
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        setLoading(true);
        setError('');
        
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            // Mock data with more interesting stats
            const mockStats = {
                totalGames: 28,
                totalWins: 19,
                totalLosses: 9,
                winRate: 68,
                pongGames: 25,
                pongWins: 17,
                pongLosses: 8,
                pongWinRate: 68
            };
            
            setStats(mockStats);
        } catch (err) {
            setError('Failed to load statistics');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString();
    };

    const achievements = [
        { title: 'First Victory', description: 'Win your first game', unlocked: true },
        { title: 'Win Streak', description: 'Win 5 games in a row', unlocked: true },
        { title: 'AI Slayer', description: 'Defeat AI 10 times', unlocked: true },
        { title: 'Tournament Champion', description: 'Win a tournament', unlocked: false },
    ];

    return (
        <div className="min-h-screen text-white relative overflow-hidden">
            {/* Animated Background */}
            <div className="absolute inset-0 pointer-events-none">
                {/* Electric Grid */}
                <div className="absolute inset-0 opacity-10">
                    {Array.from({ length: 8 }).map((_, i) => (
                        <div 
                            key={i}
                            className="absolute border border-electric-green animate-pulse"
                            style={{
                                left: `${i * 12}%`,
                                top: '10%',
                                width: '1px',
                                height: '80%',
                                animationDelay: `${i * 0.3}s`
                            }}
                        />
                    ))}
                </div>
                
                {/* Floating Stats Particles */}
                {Array.from({ length: 12 }).map((_, i) => (
                    <div 
                        key={i}
                        className="absolute w-1 h-1 bg-electric-green rounded-full opacity-40 animate-pulse"
                        style={{
                            left: `${15 + i * 7}%`,
                            top: `${25 + (i % 4) * 15}%`,
                            animationDelay: `${i * 0.4}s`
                        }}
                    />
                ))}
                
                {/* Corner Accents */}
                <div className="absolute top-8 left-8 w-20 h-20 border-l-2 border-t-2 border-electric-green opacity-30" />
                <div className="absolute bottom-8 right-8 w-20 h-20 border-r-2 border-b-2 border-electric-green opacity-30" />
            </div>

            {/* Main Content */}
            <div className="relative z-10 min-h-screen flex flex-col">
                {/* Header */}
                <header className="text-center pt-24 pb-12">
                    <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-white to-electric-green bg-clip-text text-transparent">
                        PROFILE
                    </h1>
                    <div className="w-24 h-px bg-gradient-to-r from-transparent via-electric-green to-transparent mx-auto mb-6"></div>
                    <p className="text-2xl text-electric-green font-light">
                        {user?.username || 'Player'}
                    </p>
                </header>

                {/* Content */}
                <main className="flex-1 px-6">
                    <div className="max-w-7xl mx-auto">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            
                            {/* User Info & Achievements */}
                            <div className="lg:col-span-1 space-y-6">
                                
                                {/* User Card */}
                                <div className="profile-card group hover:border-electric-green transition-all duration-300">
                                    <h3 className="text-xl font-bold mb-6 text-center">User Information</h3>
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center p-3 bg-white bg-opacity-5 rounded-lg group-hover:bg-opacity-10 transition-all duration-300">
                                            <span className="text-gray-400">Username</span>
                                            <span className="font-bold text-electric-green">{user?.username || 'N/A'}</span>
                                        </div>
                                        <div className="flex justify-between items-center p-3 bg-white bg-opacity-5 rounded-lg group-hover:bg-opacity-10 transition-all duration-300">
                                            <span className="text-gray-400">Email</span>
                                            <span className="font-bold text-sm text-white">{user?.email || 'N/A'}</span>
                                        </div>
                                        <div className="flex justify-between items-center p-3 bg-white bg-opacity-5 rounded-lg group-hover:bg-opacity-10 transition-all duration-300">
                                            <span className="text-gray-400">Joined</span>
                                            <span className="font-bold text-sm text-white">
                                                {user?.createdAt ? formatDate(user.createdAt) : 'N/A'}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center p-3 bg-electric-green bg-opacity-10 rounded-lg border border-electric-green border-opacity-30">
                                            <span className="text-gray-400">Status</span>
                                            <span className="font-bold text-electric-green flex items-center">
                                                <div className="w-2 h-2 bg-electric-green rounded-full mr-2 animate-pulse"></div>
                                                Active
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Achievements */}
                                <div className="profile-card">
                                    <h3 className="text-xl font-bold mb-6 text-center">Achievements</h3>
                                    <div className="space-y-3">
                                        {achievements.map((achievement, index) => (
                                            <div 
                                                key={index}
                                                className={`p-4 rounded-lg border transition-all duration-300 ${
                                                    achievement.unlocked 
                                                        ? 'border-electric-green bg-electric-green bg-opacity-10 hover:bg-opacity-20' 
                                                        : 'border-gray-600 bg-gray-600 bg-opacity-10'
                                                }`}
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <div className={`font-bold ${achievement.unlocked ? 'text-electric-green' : 'text-gray-500'}`}>
                                                            {achievement.title}
                                                        </div>
                                                        <div className="text-sm text-gray-400">{achievement.description}</div>
                                                    </div>
                                                    <div className={`text-2xl ${achievement.unlocked ? 'text-electric-green' : 'text-gray-600'}`}>
                                                        {achievement.unlocked ? '🏆' : '🔒'}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Statistics */}
                            <div className="lg:col-span-2">
                                <div className="profile-card">
                                    <h3 className="text-xl font-bold mb-6 text-center">Game Statistics</h3>
                                    
                                    {loading ? (
                                        <div className="text-center py-20">
                                            <div className="w-12 h-12 border-4 border-electric-green border-t-transparent animate-spin mx-auto mb-4 rounded-full"></div>
                                            <p className="text-gray-400 animate-pulse">Loading statistics...</p>
                                        </div>
                                    ) : error ? (
                                        <div className="text-center py-20">
                                            <div className="text-6xl mb-4">⚠️</div>
                                            <p className="text-red-400 mb-6">{error}</p>
                                            <button
                                                onClick={fetchStats}
                                                className="btn btn-primary px-8 py-3"
                                            >
                                                Retry
                                            </button>
                                        </div>
                                    ) : (
                                        <>
                                            {/* Key Stats Row */}
                                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                                                <div className="text-center p-6 bg-white bg-opacity-5 rounded-lg hover:bg-opacity-10 transition-all duration-300">
                                                    <div className="text-3xl font-bold text-electric-green mb-2">{stats.totalGames}</div>
                                                    <div className="text-sm text-gray-400">Total Games</div>
                                                </div>
                                                <div className="text-center p-6 bg-white bg-opacity-5 rounded-lg hover:bg-opacity-10 transition-all duration-300">
                                                    <div className="text-3xl font-bold text-electric-green mb-2">{stats.totalWins}</div>
                                                    <div className="text-sm text-gray-400">Victories</div>
                                                </div>
                                                <div className="text-center p-6 bg-white bg-opacity-5 rounded-lg hover:bg-opacity-10 transition-all duration-300">
                                                    <div className="text-3xl font-bold text-electric-green mb-2">{stats.winRate}%</div>
                                                    <div className="text-sm text-gray-400">Win Rate</div>
                                                </div>
                                                <div className="text-center p-6 bg-white bg-opacity-5 rounded-lg hover:bg-opacity-10 transition-all duration-300">
                                                    <div className="text-3xl font-bold text-electric-green mb-2">#{Math.floor(Math.random() * 50) + 1}</div>
                                                    <div className="text-sm text-gray-400">Rank</div>
                                                </div>
                                            </div>

                                            {/* Detailed Stats */}
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                {/* Overall Stats */}
                                                <div className="p-6 bg-white bg-opacity-5 rounded-lg border border-white border-opacity-10 hover:border-electric-green hover:bg-opacity-10 transition-all duration-300">
                                                    <h4 className="text-lg font-bold mb-4 text-center text-electric-green">Overall Performance</h4>
                                                    <div className="space-y-3">
                                                        <div className="flex justify-between items-center">
                                                            <span className="text-gray-400">Games Played</span>
                                                            <span className="font-bold">{stats.totalGames}</span>
                                                        </div>
                                                        <div className="flex justify-between items-center">
                                                            <span className="text-gray-400">Wins</span>
                                                            <span className="font-bold text-green-400">{stats.totalWins}</span>
                                                        </div>
                                                        <div className="flex justify-between items-center">
                                                            <span className="text-gray-400">Losses</span>
                                                            <span className="font-bold text-red-400">{stats.totalLosses}</span>
                                                        </div>
                                                        <div className="w-full bg-gray-600 bg-opacity-30 rounded-full h-2 mt-4">
                                                            <div 
                                                                className="bg-electric-green h-2 rounded-full transition-all duration-1000 glow-effect"
                                                                style={{ width: `${stats.winRate}%` }}
                                                            ></div>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Pong Stats */}
                                                <div className="p-6 bg-white bg-opacity-5 rounded-lg border border-white border-opacity-10 hover:border-electric-green hover:bg-opacity-10 transition-all duration-300">
                                                    <h4 className="text-lg font-bold mb-4 text-center text-electric-green">Pong Mastery</h4>
                                                    <div className="space-y-3">
                                                        <div className="flex justify-between items-center">
                                                            <span className="text-gray-400">Pong Games</span>
                                                            <span className="font-bold">{stats.pongGames}</span>
                                                        </div>
                                                        <div className="flex justify-between items-center">
                                                            <span className="text-gray-400">Victories</span>
                                                            <span className="font-bold text-green-400">{stats.pongWins}</span>
                                                        </div>
                                                        <div className="flex justify-between items-center">
                                                            <span className="text-gray-400">Defeats</span>
                                                            <span className="font-bold text-red-400">{stats.pongLosses}</span>
                                                        </div>
                                                        <div className="w-full bg-gray-600 bg-opacity-30 rounded-full h-2 mt-4">
                                                            <div 
                                                                className="bg-electric-green h-2 rounded-full transition-all duration-1000 glow-effect"
                                                                style={{ width: `${stats.pongWinRate}%` }}
                                                            ></div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </>
                                    )}

                                    {/* Action Buttons */}
                                    <div className="flex justify-center gap-4 mt-8 pt-6 border-t border-white border-opacity-10">
                                        <button
                                            onClick={fetchStats}
                                            disabled={loading}
                                            className="btn btn-secondary px-8 py-3"
                                        >
                                            {loading ? 'Refreshing...' : 'Refresh Stats'}
                                        </button>
                                        <Link
                                            to="/game"
                                            className="btn btn-primary px-8 py-3"
                                        >
                                            Play Now
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>

                {/* Footer */}
                <footer className="text-center pb-8 pt-8">
                    <div className="w-24 h-px bg-gradient-to-r from-transparent via-electric-green to-transparent mx-auto mb-6"></div>
                    <Link
                        to="/"
                        className="btn btn-secondary px-8 py-3"
                    >
                        Back to Home
                    </Link>
                </footer>
            </div>
        </div>
    );
};

export default ProfilePage;
