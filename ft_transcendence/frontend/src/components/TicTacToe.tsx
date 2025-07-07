import React, { useState, useEffect } from 'react';

type Player = 'X' | 'O' | null;
type Board = Player[];

interface TicTacToeProps {
    onGameEnd?: (winner: Player) => void;
    onGameStart?: () => void;
}

const TicTacToe: React.FC<TicTacToeProps> = ({ onGameEnd, onGameStart }) => {
    const [board, setBoard] = useState<Board>(Array(9).fill(null));
    const [currentPlayer, setCurrentPlayer] = useState<'X' | 'O'>('X');
    const [winner, setWinner] = useState<Player>(null);
    const [gameOver, setGameOver] = useState(false);

    // Winning combinations
    const winningCombinations = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
        [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
        [0, 4, 8], [2, 4, 6] // diagonals
    ];

    // Check for winner
    const checkWinner = (board: Board): Player => {
        for (const combination of winningCombinations) {
            const [a, b, c] = combination;
            if (board[a] && board[a] === board[b] && board[a] === board[c]) {
                return board[a];
            }
        }
        return null;
    };

    // Check if board is full (draw)
    const isBoardFull = (board: Board): boolean => {
        return board.every(cell => cell !== null);
    };

    // Handle cell click
    const handleCellClick = (index: number) => {
        if (board[index] || winner || gameOver) return;

        const newBoard = [...board];
        newBoard[index] = currentPlayer;
        setBoard(newBoard);

        const gameWinner = checkWinner(newBoard);
        if (gameWinner) {
            setWinner(gameWinner);
            setGameOver(true);
            onGameEnd?.(gameWinner);
        } else if (isBoardFull(newBoard)) {
            setGameOver(true);
            onGameEnd?.(null); // Draw
        } else {
            setCurrentPlayer(currentPlayer === 'X' ? 'O' : 'X');
        }
    };

    // Reset game
    const resetGame = () => {
        setBoard(Array(9).fill(null));
        setCurrentPlayer('X');
        setWinner(null);
        setGameOver(false);
        onGameStart?.(); // Notify parent that a new game started
    };

    // Get cell style based on content
    const getCellStyle = (cell: Player) => {
        const baseStyle = "w-20 h-20 border-2 border-gray-300 flex items-center justify-center text-4xl font-bold cursor-pointer transition-all duration-200 hover:bg-gray-100";

        if (cell === 'X') {
            return `${baseStyle} text-red-500 bg-red-50`;
        } else if (cell === 'O') {
            return `${baseStyle} text-blue-500 bg-blue-50`;
        } else {
            return `${baseStyle} hover:bg-gray-50`;
        }
    };

    return (
        <div className="flex flex-col items-center space-y-6 p-6">
            {/* Current Player Display */}
            {!gameOver && (
                <div className="text-center">
                    <h2 className="text-3xl font-bold mb-2">
                        Current Turn: <span className={currentPlayer === 'X' ? 'text-red-500' : 'text-blue-500'}>{currentPlayer}</span>
                    </h2>
                    <p className="text-lg text-gray-600">
                        Player {currentPlayer === 'X' ? 'X' : 'O'}'s turn
                    </p>
                </div>
            )}

            {/* Game Status */}
            <div className="text-center">
                {gameOver && (
                    <div className="space-y-2">
                        {winner ? (
                            <h2 className="text-3xl font-bold text-green-600">
                                Player {winner} Wins!
                            </h2>
                        ) : (
                            <h2 className="text-3xl font-bold text-yellow-600">
                                It's a Draw!
                            </h2>
                        )}
                        <button
                            onClick={resetGame}
                            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
                        >
                            Play Again
                        </button>
                    </div>
                )}
            </div>

            {/* Game Board */}
            <div className="grid grid-cols-3 gap-2 bg-gray-200 p-4 rounded-lg shadow-lg">
                {board.map((cell, index) => (
                    <button
                        key={index}
                        className={getCellStyle(cell)}
                        onClick={() => handleCellClick(index)}
                        disabled={gameOver || cell !== null}
                    >
                        {cell}
                    </button>
                ))}
            </div>

            {/* Game Rules */}
            <div className="text-center text-gray-600 max-w-md">
                <h3 className="font-semibold mb-2">Game Rules:</h3>
                <p className="text-sm">
                    Players take turns placing X and O. The goal is to get three of your symbols in a row (horizontally, vertically, or diagonally).
                </p>
            </div>
        </div>
    );
};

export default TicTacToe;
