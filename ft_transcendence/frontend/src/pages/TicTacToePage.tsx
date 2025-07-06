import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import TicTacToe from '../components/TicTacToe';

interface GameResult {
    id: number;
    winner: 'X' | 'O' | null;
    timestamp: Date;
}

const TicTacToePage: React.FC = () => {
    const [gameHistory, setGameHistory] = useState<GameResult[]>([]);
    const [stats, setStats] = useState({
        xWins: 0,
        oWins: 0,
        draws: 0,
        totalGames: 0
    });

    const handleGameEnd = (winner: 'X' | 'O' | null) => {
        const newGame: GameResult = {
            id: Date.now(),
            winner,
            timestamp: new Date()
        };

        setGameHistory(prev => [newGame, ...prev.slice(0, 9)]); // Keep last 10 games

        setStats(prev => ({
            xWins: prev.xWins + (winner === 'X' ? 1 : 0),
            oWins: prev.oWins + (winner === 'O' ? 1 : 0),
            draws: prev.draws + (winner === null ? 1 : 0),
            totalGames: prev.totalGames + 1
        }));
    };

    const resetStats = () => {
        setGameHistory([]);
        setStats({
            xWins: 0,
            oWins: 0,
            draws: 0,
            totalGames: 0
        });
    };

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white">
            {/* Header */}
            <div className="bg-gray-800 border-b border-gray-700 p-4">
                <div className="max-w-6xl mx-auto flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <Link to="/" className="text-blue-400 hover:underline">
                            ← Back to Home
                        </Link>
                        <h1 className="text-2xl font-bold">Tic-Tac-Toe</h1>
                    </div>
                    <button
                        onClick={resetStats}
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded transition"
                    >
                        Reset Statistics
                    </button>
                </div>
            </div>

            <div className="max-w-6xl mx-auto p-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Game Area */}
                    <div className="lg:col-span-2">
                        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                            <TicTacToe onGameEnd={handleGameEnd} />
                        </div>
                    </div>

                    {/* Statistics and History */}
                    <div className="space-y-6">
                        {/* Statistics */}
                        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                            <h3 className="text-xl font-bold mb-4 text-center">Statistics</h3>
                            <div className="space-y-3">
                                <div className="flex justify-between">
                                    <span>Total Games:</span>
                                    <span className="font-bold text-blue-400">{stats.totalGames}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>X Wins:</span>
                                    <span className="font-bold text-red-400">{stats.xWins}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>O Wins:</span>
                                    <span className="font-bold text-blue-400">{stats.oWins}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Draws:</span>
                                    <span className="font-bold text-yellow-400">{stats.draws}</span>
                                </div>
                                {stats.totalGames > 0 && (
                                    <>
                                        <hr className="border-gray-600" />
                                        <div className="flex justify-between">
                                            <span>X Win Rate:</span>
                                            <span className="font-bold text-red-400">
                                                {((stats.xWins / stats.totalGames) * 100).toFixed(1)}%
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>O Win Rate:</span>
                                            <span className="font-bold text-blue-400">
                                                {((stats.oWins / stats.totalGames) * 100).toFixed(1)}%
                                            </span>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Game History */}
                        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                            <h3 className="text-xl font-bold mb-4 text-center">Game History</h3>
                            {gameHistory.length === 0 ? (
                                <p className="text-gray-400 text-center">No games yet</p>
                            ) : (
                                <div className="space-y-2 max-h-64 overflow-y-auto">
                                    {gameHistory.map((game) => (
                                        <div
                                            key={game.id}
                                            className="flex justify-between items-center p-2 bg-gray-700 rounded"
                                        >
                                            <span className="text-sm text-gray-300">
                                                {formatTime(game.timestamp)}
                                            </span>
                                            <span className="font-bold">
                                                {game.winner ? (
                                                    <span className={game.winner === 'X' ? 'text-red-400' : 'text-blue-400'}>
                                                        {game.winner} Won
                                                    </span>
                                                ) : (
                                                    <span className="text-yellow-400">Draw</span>
                                                )}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TicTacToePage;
