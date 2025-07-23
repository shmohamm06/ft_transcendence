import { useState, useEffect, useRef } from 'react';
import PongScene from '../components/PongScene';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

interface GameState {
    ball: { x: number; y: number };
    player1: { y: number };
    player2: { y: number };
    score: { player1: number; player2: number };
    gameStatus?: 'countdown' | 'playing' | 'gameOver';
    winner?: 'player1' | 'player2';
    countdown?: number;
}

interface TournamentMatch {
    matchId: number;
    player1: string;
    player2: string;
    round: string;
    isTournament: boolean;
}

const GamePage = () => {
    const [gameState, setGameState] = useState<GameState | null>(null);
    const [connectionStatus, setConnectionStatus] = useState('Connecting...');
    const [tournamentMatch, setTournamentMatch] = useState<TournamentMatch | null>(null);
    const [gameResultSaved, setGameResultSaved] = useState(false);
    const [lastSavedGameId, setLastSavedGameId] = useState<string | null>(null);
    const [lastSaveTime, setLastSaveTime] = useState<number>(0);
    const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const saveBlockedRef = useRef<boolean>(false);
    const processingGameOverRef = useRef<boolean>(false);
    const socketRef = useRef<WebSocket | null>(null);
    const { token, user } = useAuth();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    // Debug user state
    useEffect(() => {
        console.log('GamePage: Current user state:', {
            user,
            userId: user?.id,
            userType: typeof user?.id,
            token: token ? 'PRESENT' : 'MISSING',
            isAuthenticated: !!user && !!token
        });
    }, [user, token]);
    const gameMode = searchParams.get('mode');

    const isPvPMode = gameMode === 'pvp';
    const isTournamentMode = gameMode === 'tournament';

    // Load tournament match data
    useEffect(() => {
        if (isTournamentMode) {
            const matchData = localStorage.getItem('tournamentMatch');
            if (matchData) {
                setTournamentMatch(JSON.parse(matchData));
            }
        }
    }, [isTournamentMode]);

    // Load settings from localStorage
    const getSettings = () => {
        const ballSpeed = parseInt(localStorage.getItem('ballSpeed') || '5');
        const paddleSpeed = parseInt(localStorage.getItem('paddleSpeed') || '6');
        return { ballSpeed, paddleSpeed };
    };

    // Send settings to backend
    const sendSettings = () => {
        if (socketRef.current?.readyState === WebSocket.OPEN) {
            const settings = getSettings();
            console.log('Sending settings to backend:', settings);
            socketRef.current.send(JSON.stringify({
                action: 'settings',
                ballSpeed: settings.ballSpeed,
                paddleSpeed: settings.paddleSpeed
            }));
        }
    };

    // Handle tournament game completion
    const handleTournamentGameEnd = (winner: 'player1' | 'player2') => {
        if (tournamentMatch) {
            const result = {
                matchId: tournamentMatch.matchId,
                winner: winner,
                player1: tournamentMatch.player1,
                player2: tournamentMatch.player2,
                round: tournamentMatch.round,
                timestamp: new Date().toISOString()
            };

            console.log('📝 Saving tournament result to localStorage:', result);
            localStorage.setItem('tournamentGameResult', JSON.stringify(result));

            // Trigger storage event manually for same-tab detection
            window.dispatchEvent(new StorageEvent('storage', {
                key: 'tournamentGameResult',
                newValue: JSON.stringify(result),
                storageArea: localStorage
            }));

            console.log('✅ Tournament result saved and event dispatched');

            // Don't navigate immediately, let the user see the result first
            // The tournament component will handle the result when user returns
        } else {
            console.error('❌ No tournament match data available');
        }
    };

        // Save AI game result to user stats with ultra-strict protection
    const saveGameResult = async (winner: 'player1' | 'player2', gameId: string) => {
        console.log('🎯 saveGameResult called', {
            winner,
            gameId,
            saveBlocked: saveBlockedRef.current,
            user: user ? `ID:${user.id}` : 'NO_USER',
            isPvPMode,
            isTournamentMode
        });

        // Ultra-strict early exit
        if (saveBlockedRef.current) {
            console.log('🚫 BLOCKED by saveBlockedRef');
            return;
        }

        if (!user) {
            console.log('🚫 BLOCKED: No user logged in');
            return;
        }

        if (isPvPMode) {
            console.log('🚫 BLOCKED: PvP mode - stats not saved');
            return;
        }

        if (isTournamentMode) {
            console.log('🚫 BLOCKED: Tournament mode - stats not saved');
            return;
        }

        const now = Date.now();

        // Check if we already saved this exact game
        if (gameResultSaved || lastSavedGameId === gameId) {
            console.log(`🚫 BLOCKED: Game result already saved for game ${gameId}`);
            return;
        }

        // Check if we saved anything in the last 5 seconds (debounce)
        if (now - lastSaveTime < 5000) {
            console.log(`🚫 BLOCKED: Debounce - Last save was ${now - lastSaveTime}ms ago`);
            return;
        }

        // Set blocking flag IMMEDIATELY
        saveBlockedRef.current = true;

        console.log(`💾 PROCEEDING with save for game ${gameId}`);
        setGameResultSaved(true);
        setLastSavedGameId(gameId);
        setLastSaveTime(now);

        try {
            const result = winner === 'player1' ? 'win' : 'loss';

            console.log(`💾 Making API call:`, {
                userId: user.id,
                result,
                endpoint: `/api/users/${user.id}/stats`,
                payload: { game: 'pong', result }
            });

            const response = await axios.post(`/api/users/${user.id}/stats`, {
                game: 'pong',
                result: result
            });

            console.log('✅ Game result saved successfully!', response.data);

            // Show notification only once
            setTimeout(() => {
                alert(`🎮 Game result saved to your profile: ${result.toUpperCase()}!`);
            }, 2000);

        } catch (error) {
            console.error('❌ Failed to save game result:', error);
            if (error.response) {
                console.error('Response data:', error.response.data);
                console.error('Response status:', error.response.status);
            }
            // Don't reset flags on error to prevent multiple attempts
        }
    };

    useEffect(() => {
        const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        // Connect directly to game-service on port 8080
        let wsUrl = `${wsProtocol}//localhost:8080/ws/game`;

        // Add token as query parameter if available
        if (token) {
            wsUrl += `?token=${encodeURIComponent(token)}`;
        }

        // Add game mode parameter
        if (isPvPMode || isTournamentMode) {
            wsUrl += token ? '&' : '?';
            wsUrl += 'mode=pvp'; // Tournament uses PvP mode
        }

        console.log('Connecting to WebSocket:', wsUrl);
        const socket = new WebSocket(wsUrl);
        socketRef.current = socket;

        socket.onopen = () => {
            console.log('WebSocket connected');
            setConnectionStatus('Connected');

            // Send settings immediately after connection
            setTimeout(() => {
                sendSettings();
            }, 100);
        };

        socket.onclose = () => {
            console.log('WebSocket disconnected');
            setConnectionStatus('Disconnected');
        };

        socket.onerror = (error) => {
            console.error('WebSocket error:', error);
            setConnectionStatus('Connection Error');
        };

        socket.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                let processedData = data;

                // Handle both direct game state and wrapped format
                if (data.type === 'gameState' && data.data) {
                    setGameState(data.data);
                    processedData = data.data; // Use unwrapped data for further processing
                } else {
                    setGameState(data);
                }



                // Handle tournament auto-winner detection at 3 points
                if (isTournamentMode && tournamentMatch && processedData.score) {
                    const { player1: p1Score, player2: p2Score } = processedData.score;

                    console.log(`Tournament scores: ${tournamentMatch.player1} (${p1Score}) vs ${tournamentMatch.player2} (${p2Score})`);

                    // Check if someone reached 3 points
                    if (p1Score >= 3 || p2Score >= 3) {
                        const winner = p1Score >= 3 ? 'player1' : 'player2';
                        const winnerName = winner === 'player1' ? tournamentMatch.player1 : tournamentMatch.player2;

                        // Only record result if not already recorded
                        const existingResult = localStorage.getItem('tournamentGameResult');
                        if (!existingResult) {
                            console.log(`🏆 Tournament winner detected: ${winnerName} (${winner}) with score ${p1Score}-${p2Score}`);
                            handleTournamentGameEnd(winner);

                            // Also show a visual notification
                            alert(`🏆 Tournament Match Complete!\n${winnerName} wins with ${p1Score}-${p2Score}!\n\nClick "Continue Tournament" to proceed.`);
                        }
                    }
                }

                                // Handle game end - save stats for AI games
                if (processedData.gameStatus === 'gameOver' && processedData.winner) {
                    console.log(`🎮 Game over detected!`, {
                        winner: processedData.winner,
                        score: processedData.score,
                        processingGameOver: processingGameOverRef.current,
                        isPvPMode,
                        isTournamentMode,
                        user: user ? `ID:${user.id}` : 'NO_USER'
                    });

                    // Prevent processing multiple gameOver messages
                    if (processingGameOverRef.current) {
                        console.log('🚫 BLOCKED: Already processing gameOver');
                        return;
                    }

                    processingGameOverRef.current = true;

                    // Save result for AI games (not PvP or tournament)
                    if (!isPvPMode && !isTournamentMode) {
                        // Create unique game ID based on score and timestamp
                        const gameId = `${processedData.score.player1}-${processedData.score.player2}-${Date.now()}`;
                        console.log(`💾 Calling saveGameResult for AI game:`, { winner: processedData.winner, gameId });
                        saveGameResult(processedData.winner, gameId);
                    } else {
                        console.log('🚫 SKIPPING save for non-AI game:', { isPvPMode, isTournamentMode });
                    }

                    // Reset processing flag after a delay
                    setTimeout(() => {
                        processingGameOverRef.current = false;
                    }, 3000);
                }

                // Handle tournament game end (for games that end naturally)
                if (isTournamentMode && tournamentMatch && processedData.gameStatus === 'gameOver' && processedData.winner) {
                    const existingResult = localStorage.getItem('tournamentGameResult');
                    if (!existingResult) {
                        console.log(`🏆 Tournament game over: ${processedData.winner} wins`);
                        handleTournamentGameEnd(processedData.winner);
                    }
                }
            } catch (error) {
                console.error('Error parsing game state:', error);
            }
        };

        return () => {
            console.log('Cleaning up WebSocket connection');
            socket.close();
        };
    }, [token, isPvPMode, isTournamentMode, navigate, tournamentMatch]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (socketRef.current?.readyState !== WebSocket.OPEN) return;

            let action = null;
            let player = null;

            if (isPvPMode || isTournamentMode) {
                // Player vs Player mode: W/S for player 1, Arrow keys for player 2
                if (e.key === 'w' || e.key === 'W') {
                    action = 'move';
                    player = 'player1';
                } else if (e.key === 's' || e.key === 'S') {
                    action = 'move';
                    player = 'player1';
                } else if (e.key === 'ArrowUp') {
                    action = 'move';
                    player = 'player2';
                } else if (e.key === 'ArrowDown') {
                    action = 'move';
                    player = 'player2';
                }
            } else {
                // AI mode: W/S or Arrow keys for player 1
                if (e.key === 'w' || e.key === 'W' || e.key === 'ArrowUp') {
                    action = 'move';
                    player = 'player1';
                } else if (e.key === 's' || e.key === 'S' || e.key === 'ArrowDown') {
                    action = 'move';
                    player = 'player1';
                }
            }

            if (action && player) {
                const direction = (e.key === 'w' || e.key === 'W' || e.key === 'ArrowUp') ? 'up' : 'down';
                socketRef.current.send(JSON.stringify({
                    action,
                    direction,
                    player
                }));
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isPvPMode, isTournamentMode]);

    const getPlayerNames = () => {
        if (isTournamentMode && tournamentMatch) {
            return {
                player1: `${tournamentMatch.player1} (W/S)`,
                player2: `${tournamentMatch.player2} (↑/↓)`
            };
        } else if (isPvPMode) {
            return { player1: 'Player 1 (W/S)', player2: 'Player 2 (↑/↓)' };
        } else {
            return { player1: 'Player 1', player2: 'AI' };
        }
    };

        const handleRestart = () => {
        if (socketRef.current?.readyState === WebSocket.OPEN) {
            // Reset ALL game result saved flags for new game
            console.log('🎮 Restarting game - resetting ALL save flags');
            setGameResultSaved(false);
            setLastSavedGameId(null);
            setLastSaveTime(0);
            saveBlockedRef.current = false;
            processingGameOverRef.current = false;

            // Clear any pending save timeout
            if (saveTimeoutRef.current) {
                clearTimeout(saveTimeoutRef.current);
                saveTimeoutRef.current = null;
            }

            // Send settings before starting new match
            sendSettings();
            setTimeout(() => {
                socketRef.current?.send(JSON.stringify({ action: 'startNewMatch' }));
            }, 100);
        }
    };

    const getBackLink = () => {
        if (isTournamentMode) {
            return '/tournament';
        }
        return '/';
    };

    const getBackText = () => {
        if (isTournamentMode) {
            return '← Back to Tournament';
        }
        return '← Back to Home';
    };

    const getGameModeText = () => {
        if (isTournamentMode) {
            return `Tournament ${tournamentMatch?.round || 'Match'}`;
        } else if (isPvPMode) {
            return 'PvP Mode';
        }
        return 'AI Mode';
    };

    const playerNames = getPlayerNames();
    const isGameOver = gameState?.gameStatus === 'gameOver';
    const isCountdown = gameState?.gameStatus === 'countdown';
    const settings = getSettings();

    return (
        <div className="relative w-screen h-screen text-white overflow-hidden" style={{background: 'linear-gradient(135deg, #1e1b3c 0%, #2a2550 30%, #1a1a3a 70%, #0f1419 100%)'}}>
            {/* Animated Background Elements */}
            <div className="absolute inset-0 pointer-events-none">
                {/* Game Grid Pattern */}
                <div className="absolute inset-0 opacity-5">
                    {Array.from({ length: 8 }).map((_, i) => (
                        <div 
                            key={i}
                            className="absolute border border-electric-green animate-pulse"
                            style={{
                                left: `${i * 12}%`,
                                top: '0%',
                                width: '1px',
                                height: '100%',
                                animationDelay: `${i * 0.2}s`
                            }}
                        />
                    ))}
                </div>
                
                {/* Floating Game Particles */}
                {Array.from({ length: 6 }).map((_, i) => (
                    <div 
                        key={i}
                        className="absolute w-1 h-1 bg-electric-green rounded-full opacity-20 animate-pulse"
                        style={{
                            left: `${15 + i * 15}%`,
                            top: `${20 + (i % 3) * 20}%`,
                            animationDelay: `${i * 0.8}s`
                        }}
                    />
                ))}
            </div>

            {/* Header */}
            <div className="absolute top-0 left-0 right-0 z-10 p-4 flex justify-between items-center text-white bg-white bg-opacity-5 border-b border-white border-opacity-10 backdrop-blur-20">
                <div>
                    <Link to={getBackLink()} className="text-electric-green hover:text-electric-green-dark font-medium transition-colors duration-300">
                        {getBackText()}
                    </Link>
                </div>
                <div className="text-2xl font-bold">
                    <span className="text-blue-400">{playerNames.player1}: {gameState?.score.player1 ?? 0}</span>
                    <span className="mx-4 text-electric-green">|</span>
                    <span className="text-red-400">{playerNames.player2}: {gameState?.score.player2 ?? 0}</span>
                </div>
                <div className="text-sm text-right">
                    <div className="text-electric-green font-medium">Status: {connectionStatus}</div>
                    <div className="text-gray-300">
                        {getGameModeText()}
                    </div>
                </div>
            </div>

            <PongScene gameState={gameState} />

            {/* Countdown overlay */}
            {isCountdown && gameState?.countdown && gameState.countdown > 0 && (
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-60 z-20 backdrop-blur-sm">
                    <div className="text-8xl font-bold text-electric-green animate-pulse drop-shadow-lg">
                        {gameState.countdown}
                    </div>
                </div>
            )}

            {/* Game Over overlay */}
            {isGameOver && (
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-60 z-20 backdrop-blur-sm">
                    <div className="bg-white bg-opacity-5 p-8 rounded-2xl text-center border border-electric-green border-opacity-30 backdrop-blur-20 max-w-lg mx-4">
                        <h2 className="text-4xl font-bold text-electric-green mb-4">Game Over!</h2>
                        <div className="text-2xl text-yellow-400 mb-6">
                            {gameState.winner === 'player1' ? playerNames.player1 : playerNames.player2} Wins!
                        </div>
                        <div className="text-xl text-gray-300 mb-8">
                            Final Score: <span className="text-blue-400">{gameState.score.player1}</span> - <span className="text-red-400">{gameState.score.player2}</span>
                        </div>
                        {isTournamentMode ? (
                            <div className="space-y-4">
                                <div className="text-lg text-electric-green font-medium">
                                    ✅ Tournament result recorded!
                                </div>
                                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                    <Link
                                        to="/tournament"
                                        className="btn btn-primary px-6 py-3 text-lg"
                                    >
                                        Continue Tournament
                                    </Link>
                                    <button
                                        onClick={handleRestart}
                                        className="btn btn-secondary px-6 py-3 text-lg"
                                    >
                                        Play Again
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <button
                                    onClick={handleRestart}
                                    className="btn btn-primary px-6 py-3 text-lg"
                                >
                                    Play Again
                                </button>
                                <Link
                                    to="/"
                                    className="btn btn-secondary px-6 py-3 text-lg"
                                >
                                    Home
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Controls info */}
            <div className="absolute bottom-4 left-4 text-white bg-white bg-opacity-5 p-3 rounded-lg border border-white border-opacity-10 backdrop-blur-20">
                <div className="text-sm font-semibold mb-2 text-electric-green">Controls:</div>
                {isPvPMode || isTournamentMode ? (
                    <div className="text-xs space-y-1">
                        <div><span className="text-blue-400">Player 1:</span> W (up) / S (down)</div>
                        <div><span className="text-red-400">Player 2:</span> ↑ (up) / ↓ (down)</div>
                    </div>
                ) : (
                    <div className="text-xs">
                        <div><span className="text-blue-400">Player:</span> W/S or ↑/↓</div>
                    </div>
                )}
            </div>

            {/* Settings display */}
            <div className="absolute bottom-4 right-4 text-white bg-white bg-opacity-5 p-3 rounded-lg border border-white border-opacity-10 backdrop-blur-20">
                <div className="text-xs space-y-1">
                    <div className="text-electric-green text-sm font-semibold mb-1">Settings:</div>
                    <div>Ball Speed: <span className="text-electric-green">{settings.ballSpeed}</span></div>
                    <div>Paddle Speed: <span className="text-electric-green">{settings.paddleSpeed}</span></div>
                </div>
            </div>
        </div>
    );
};

export default GamePage;
