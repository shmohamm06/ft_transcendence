import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

type Player = 'X' | 'O' | null;

interface GameState {
    board: Player[];
    currentPlayer: Player;
    winner: Player;
    gameOver: boolean;
}

const TicTacToe: React.FC = () => {
    const { user, token, isAuthenticated } = useAuth();
    
    const [gameState, setGameState] = useState<GameState>({
        board: Array(9).fill(null),
        currentPlayer: 'X',
        winner: null,
        gameOver: false
    });

    const [scores, setScores] = useState({
        X: 0,
        O: 0,
        draws: 0
    });

    const [isThinking, setIsThinking] = useState(false);

    
    useEffect(() => {
        const loadScores = async () => {
            
            const savedScores = localStorage.getItem('tictactoe_scores');
            if (savedScores) {
                try {
                    setScores(JSON.parse(savedScores));
                } catch (error) {
                    console.error('Failed to parse saved scores:', error);
                }
            }

            
            if (isAuthenticated && user) {
                try {
                    console.log('Loading user stats from backend...');
                    const response = await axios.get(`/api/users/profile`);
                    console.log('User profile response:', response.data);
                    
                    if (response.data) {
                        const backendStats = {
                            X: response.data.ttt_wins || 0,
                            O: response.data.ttt_losses || 0,
                            draws: 0 
                        };
                        
                        console.log('Backend stats loaded:', backendStats);
                        setScores(backendStats);
                        
                        
                        localStorage.setItem('tictactoe_scores', JSON.stringify(backendStats));
                    }
                } catch (error) {
                    console.error('Failed to load user stats from backend:', error);
                    
                }
            }
        };

        loadScores();
    }, [isAuthenticated, user]);

    
    useEffect(() => {
        localStorage.setItem('tictactoe_scores', JSON.stringify(scores));
    }, [scores]);

    
    const updateBackendStats = async (result: 'win' | 'loss') => {
        console.log('🎯 updateBackendStats called:', {
            result,
            isAuthenticated,
            userId: user?.id,
            hasToken: !!token
        });

        if (!isAuthenticated || !user || !token) {
            console.log('User not authenticated, skipping backend stats update');
            return;
        }

        try {
            console.log('Making API call to update stats:', {
                url: `/api/users/${user.id}/stats`,
                payload: { game: 'tictactoe', result },
                headers: axios.defaults.headers.common
            });

            const response = await axios.post(`/api/users/${user.id}/stats`, {
                game: 'tictactoe',
                result: result
            });
            console.log('✅ Stats updated successfully:', response.data);
            
            
            await refreshStatsFromBackend();
        } catch (error) {
            console.error('❌ Failed to update stats:', error);
            
            if (error.response) {
                console.error('Response status:', error.response.status);
                console.error('Response data:', error.response.data);
            }
        }
    };

    
    const refreshStatsFromBackend = async () => {
        if (!isAuthenticated || !user) return;

        try {
            console.log('Refreshing stats from backend...');
            const response = await axios.get(`/api/users/profile`);
            
            if (response.data) {
                const backendStats = {
                    X: response.data.ttt_wins || 0,
                    O: response.data.ttt_losses || 0,
                    draws: 0 
                };
                
                console.log('Refreshed backend stats:', backendStats);
                setScores(backendStats);
                localStorage.setItem('tictactoe_scores', JSON.stringify(backendStats));
            }
        } catch (error) {
            console.error('Failed to refresh stats from backend:', error);
        }
    };

    const checkWinner = (board: Player[]): Player => {
        const lines = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8], 
            [0, 3, 6], [1, 4, 7], [2, 5, 8], 
            [0, 4, 8], [2, 4, 6] 
        ];

        for (let i = 0; i < lines.length; i++) {
            const [a, b, c] = lines[i];
            if (board[a] && board[a] === board[b] && board[a] === board[c]) {
                return board[a];
            }
        }

        return null;
    };

    const getAvailableMoves = (board: Player[]): number[] => {
        return board.map((cell, index) => cell === null ? index : null)
                   .filter(val => val !== null) as number[];
    };

    const minimax = (board: Player[], depth: number, isMaximizing: boolean): number => {
        const winner = checkWinner(board);

        if (winner === 'O') return 10 - depth;
        if (winner === 'X') return depth - 10;
        if (getAvailableMoves(board).length === 0) return 0;

        if (isMaximizing) {
            let bestScore = -Infinity;
            for (let move of getAvailableMoves(board)) {
                board[move] = 'O';
                let score = minimax(board, depth + 1, false);
                board[move] = null;
                bestScore = Math.max(score, bestScore);
            }
            return bestScore;
        } else {
            let bestScore = Infinity;
            for (let move of getAvailableMoves(board)) {
                board[move] = 'X';
                let score = minimax(board, depth + 1, true);
                board[move] = null;
                bestScore = Math.min(score, bestScore);
            }
            return bestScore;
        }
    };

    const getBestMove = (board: Player[]): number => {
        const availableMoves = getAvailableMoves(board);

        
        if (Math.random() < 0.4) {
            const randomIndex = Math.floor(Math.random() * availableMoves.length);
            return availableMoves[randomIndex];
        }

        
        if (Math.random() < 0.3) {
            
            let moves: { move: number; score: number }[] = [];
            for (let move of availableMoves) {
                board[move] = 'O';
                let score = minimax(board, 0, false);
                board[move] = null;
                moves.push({ move, score });
            }

            
            moves.sort((a, b) => a.score - b.score);
            const worseMovesCount = Math.ceil(moves.length / 2);
            const randomWorseIndex = Math.floor(Math.random() * worseMovesCount);
            return moves[randomWorseIndex].move;
        }

        
        let bestScore = -Infinity;
        let bestMove = -1;

        for (let move of availableMoves) {
            board[move] = 'O';
            let score = minimax(board, 0, false);
            board[move] = null;

            if (score > bestScore) {
                bestScore = score;
                bestMove = move;
            }
        }

        return bestMove;
    };

    const makeMove = (index: number) => {
        if (gameState.board[index] || gameState.gameOver) return;

        const newBoard = [...gameState.board];
        newBoard[index] = gameState.currentPlayer;

        const winner = checkWinner(newBoard);
        const isDraw = !winner && getAvailableMoves(newBoard).length === 0;

        setGameState({
            board: newBoard,
            currentPlayer: gameState.currentPlayer === 'X' ? 'O' : 'X',
            winner: winner,
            gameOver: winner !== null || isDraw
        });

        
        if (winner || isDraw) {
            console.log('🎮 Game ended:', { winner, isDraw });
            
            if (winner) {
                setScores(prev => ({
                    ...prev,
                    [winner]: prev[winner] + 1
                }));
                
                
                if (winner === 'X') {
                    console.log('🎯 Player won, updating backend stats...');
                    updateBackendStats('win');
                } else {
                    console.log('🎯 AI won, updating backend stats...');
                    updateBackendStats('loss');
                }
            } else if (isDraw) {
                setScores(prev => ({
                    ...prev,
                    draws: prev.draws + 1
                }));
                
                
                console.log('🎯 Game was a draw - not updating backend stats (draws not tracked)');
            }
        }
    };

    
    useEffect(() => {
        if (gameState.currentPlayer === 'O' && !gameState.gameOver) {
            setIsThinking(true);
            const timer = setTimeout(() => {
                const bestMove = getBestMove([...gameState.board]);
                if (bestMove !== -1) {
                    makeMove(bestMove);
                }
                setIsThinking(false);
            }, 500); 

            return () => clearTimeout(timer);
        }
    }, [gameState.currentPlayer, gameState.gameOver]);

    const resetGame = () => {
        setGameState({
            board: Array(9).fill(null),
            currentPlayer: 'X',
            winner: null,
            gameOver: false
        });
        setIsThinking(false);
    };

    const resetScores = () => {
        setScores({
            X: 0,
            O: 0,
            draws: 0
        });
        localStorage.removeItem('tictactoe_scores');
    };

    const getStatusMessage = () => {
        if (gameState.winner) {
            return gameState.winner === 'X' ? 'You Win! 🎉' : 'AI Wins! 🤖';
        }
        if (gameState.gameOver) {
            return "It's a Draw! 🤝";
        }
        if (isThinking) {
            return 'AI is thinking... 🤔';
        }
        return gameState.currentPlayer === 'X' ? 'Your Turn' : 'AI Turn';
    };

    return (
        <div className="text-center text-white">
            {/* Authentication Status */}
            {!isAuthenticated && (
                <div className="mb-4 p-3 bg-yellow-600 bg-opacity-20 rounded-lg border border-yellow-500 border-opacity-30">
                    <p className="text-sm text-yellow-300">
                        ⚠️ You're not logged in. Game stats will only be saved locally.
                    </p>
                </div>
            )}

            {/* Game Status */}
            <div className="mb-8">
                <h2 className="text-2xl font-bold mb-4 text-electric-green">
                    {getStatusMessage()}
                </h2>

                {/* Scores */}
                <div className="grid grid-cols-3 gap-4 mb-6 max-w-md mx-auto">
                    <div className="bg-white bg-opacity-5 rounded-lg p-4 border border-white border-opacity-10">
                        <div className="text-2xl font-bold text-blue-400">X</div>
                        <div className="text-sm text-gray-300">Your Wins</div>
                        <div className="text-xl font-bold text-electric-green">{scores.X}</div>
                    </div>
                    <div className="bg-white bg-opacity-5 rounded-lg p-4 border border-white border-opacity-10">
                        <div className="text-2xl font-bold text-gray-300">-</div>
                        <div className="text-sm text-gray-300">Draws</div>
                        <div className="text-xl font-bold text-electric-green">{scores.draws}</div>
                    </div>
                    <div className="bg-white bg-opacity-5 rounded-lg p-4 border border-white border-opacity-10">
                        <div className="text-2xl font-bold text-red-400">O</div>
                        <div className="text-sm text-gray-300">Your Losses</div>
                        <div className="text-xl font-bold text-electric-green">{scores.O}</div>
                    </div>
                </div>
            </div>

            {/* Game Board */}
            <div className="inline-block mb-8">
                <div className="grid grid-cols-3 gap-2 p-6 bg-white bg-opacity-5 rounded-2xl border border-electric-green border-opacity-30">
                    {gameState.board.map((cell, index) => (
                        <button
                            key={index}
                            onClick={() => makeMove(index)}
                            disabled={gameState.gameOver || cell !== null || gameState.currentPlayer === 'O'}
                            className={`
                                w-20 h-20 rounded-lg border-2 text-3xl font-bold transition-all duration-300
                                ${cell === null
                                    ? 'border-electric-green border-opacity-30 hover:border-opacity-60 hover:bg-electric-green hover:bg-opacity-10 text-white'
                                    : 'border-electric-green border-opacity-60'
                                }
                                ${cell === 'X' ? 'text-blue-400' : cell === 'O' ? 'text-red-400' : 'text-white'}
                                ${gameState.currentPlayer === 'O' || gameState.gameOver ? 'cursor-not-allowed' : 'cursor-pointer'}
                                hover:text-white
                            `}
                        >
                            {cell}
                        </button>
                    ))}
                </div>
            </div>

            {/* Game Controls */}
            <div className="flex justify-center gap-4">
                <button
                    onClick={resetGame}
                    className="btn btn-primary px-6 py-3"
                >
                    New Game
                </button>
            </div>

            {/* Game Info */}
            <div className="mt-8 p-4 bg-white bg-opacity-5 rounded-lg border border-white border-opacity-10 max-w-md mx-auto">
                <h3 className="text-lg font-bold mb-2 text-electric-green">How to Play</h3>
                <div className="text-sm text-gray-300 space-y-1">
                    <p>• You are X, AI is O</p>
                    <p>• Get 3 in a row to win</p>
                    <p>• AI sometimes makes mistakes</p>
                    <p>• You can actually win now! 🎯</p>
                    {isAuthenticated && (
                        <p className="text-electric-green mt-2">• Stats are saved to your profile! 📊</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TicTacToe;
