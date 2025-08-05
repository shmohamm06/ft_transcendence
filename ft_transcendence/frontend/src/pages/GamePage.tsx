import React, { useState, useEffect, useRef } from 'react';
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

    
    const pressedKeys = useRef<Set<string>>(new Set());
    const movementInterval = useRef<number | null>(null);

    const saveTimeoutRef = useRef<number | null>(null);
    const saveBlockedRef = useRef<boolean>(false);
    const processingGameOverRef = useRef<boolean>(false);
    const socketRef = useRef<WebSocket | null>(null);
    const reconnectTimeoutRef = useRef<number | null>(null);
    const lastConnectTime = useRef<number>(0);
    const { token, user } = useAuth();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    
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

    
    useEffect(() => {
        if (isTournamentMode) {
            const matchData = localStorage.getItem('tournamentMatch');
            if (matchData) {
                setTournamentMatch(JSON.parse(matchData));
            }
        }
    }, [isTournamentMode]);

    
    const getSettings = () => {
        const ballSpeed = parseInt(localStorage.getItem('ballSpeed') || '5');
        const paddleSpeed = parseInt(localStorage.getItem('paddleSpeed') || '6');
        return { ballSpeed, paddleSpeed };
    };

    
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

    
    const sendMovement = () => {
        if (socketRef.current?.readyState !== WebSocket.OPEN) return;

        const keys = Array.from(pressedKeys.current);

        if (isPvPMode || isTournamentMode) {
            
            if (keys.includes('w') || keys.includes('W')) {
                socketRef.current.send(JSON.stringify({
                    action: 'move',
                    direction: 'up',
                    player: 'player1'
                }));
            } else if (keys.includes('s') || keys.includes('S')) {
                socketRef.current.send(JSON.stringify({
                    action: 'move',
                    direction: 'down',
                    player: 'player1'
                }));
            }

            
            if (keys.includes('ArrowUp')) {
                socketRef.current.send(JSON.stringify({
                    action: 'move',
                    direction: 'up',
                    player: 'player2'
                }));
            } else if (keys.includes('ArrowDown')) {
                socketRef.current.send(JSON.stringify({
                    action: 'move',
                    direction: 'down',
                    player: 'player2'
                }));
            }
        } else {
            
            if (keys.includes('w') || keys.includes('W') || keys.includes('ArrowUp')) {
                socketRef.current.send(JSON.stringify({
                    action: 'move',
                    direction: 'up',
                    player: 'player1'
                }));
            } else if (keys.includes('s') || keys.includes('S') || keys.includes('ArrowDown')) {
                socketRef.current.send(JSON.stringify({
                    action: 'move',
                    direction: 'down',
                    player: 'player1'
                }));
            }
        }
    };

    
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

            
            window.dispatchEvent(new StorageEvent('storage', {
                key: 'tournamentGameResult',
                newValue: JSON.stringify(result),
                storageArea: localStorage
            }));

            console.log('✅ Tournament result saved and event dispatched');

            
            
        } else {
            console.error('❌ No tournament match data available');
        }
    };

        
    const saveGameResult = async (winner: 'player1' | 'player2', gameId: string) => {
        console.log('🎯 saveGameResult called', {
            winner,
            gameId,
            saveBlocked: saveBlockedRef.current,
            user: user ? `ID:${user.id}` : 'NO_USER',
            isPvPMode,
            isTournamentMode
        });

        
        if (saveBlockedRef.current) {
            console.log('🚫 BLOCKED by saveBlockedRef');
            return;
        }

        if (!user) {
            console.log('🚫 BLOCKED: No user logged in');
            return;
        }

        if (isPvPMode) {
            console.log('🎮 PvP mode detected - will save stats for logged-in user (Player 1)');
            
            
        }

        if (isTournamentMode) {
            console.log('🎮 Tournament mode detected - will save stats for logged-in user (Player 1)');
            
            
        }

        const now = Date.now();

        
        if (gameResultSaved || lastSavedGameId === gameId) {
            console.log(`🚫 BLOCKED: Game result already saved for game ${gameId}`);
            return;
        }

        
        if (now - lastSaveTime < 5000) {
            console.log(`🚫 BLOCKED: Debounce - Last save was ${now - lastSaveTime}ms ago`);
            return;
        }

        
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
                gameMode: isPvPMode ? 'PvP' : isTournamentMode ? 'Tournament' : 'AI',
                endpoint: `/api/users/${user.id}/stats`,
                payload: { game: 'pong', result }
            });

            const response = await axios.post(`/api/users/${user.id}/stats`, {
                game: 'pong',
                result: result
            });

            console.log('✅ Game result saved successfully!', response.data);

            
            setTimeout(() => {
                const gameModeText = isPvPMode ? 'PvP' : isTournamentMode ? 'Tournament' : 'AI';
            }, 2000);

        } catch (error) {
            console.error('❌ Failed to save game result:', error);
            if (error.response) {
                console.error('Response data:', error.response.data);
                console.error('Response status:', error.response.status);
            }
            
        }
    };

    useEffect(() => {
        const connectWebSocket = () => {
            const now = Date.now();

            
            if (now - lastConnectTime.current < 1000) {
                console.log('🚫 Debouncing WebSocket connection');
                return;
            }

            
            if (socketRef.current) {
                console.log('🧹 Cleaning up old WebSocket connection');
                socketRef.current.onopen = null;
                socketRef.current.onclose = null;
                socketRef.current.onerror = null;
                socketRef.current.onmessage = null;

                if (socketRef.current.readyState === WebSocket.OPEN) {
                    socketRef.current.close();
                }
                socketRef.current = null;
            }

        const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        
        let wsUrl = `${wsProtocol}//localhost:3002/ws/game`;

        
        if (token) {
            wsUrl += `?token=${encodeURIComponent(token)}`;
        }

        
        if (isPvPMode || isTournamentMode) {
            wsUrl += token ? '&' : '?';
            wsUrl += 'mode=pvp'; 
        }

            
            wsUrl += (token || isPvPMode || isTournamentMode) ? '&' : '?';
            wsUrl += `t=${now}`;

        console.log('Connecting to WebSocket:', wsUrl);
            lastConnectTime.current = now;

        const socket = new WebSocket(wsUrl);
        socketRef.current = socket;

        socket.onopen = () => {
            console.log('WebSocket connected');
            setConnectionStatus('Connected');

            
            setTimeout(() => {
                sendSettings();
            }, 100);
        };

            socket.onclose = (event) => {
                console.log('WebSocket disconnected', event.code, event.reason);
            setConnectionStatus('Disconnected');

                
                if (socketRef.current === socket) {
                    socketRef.current = null;
                }
        };

        socket.onerror = (error) => {
            console.error('WebSocket error:', error);
            setConnectionStatus('Connection Error');
        };

        socket.onmessage = (event) => {
            try {
                
                const now = Date.now();
                if (now - (socketRef.current as any).lastMessageTime < 16) {
                    return; 
                }
                (socketRef.current as any).lastMessageTime = now;

                const data = JSON.parse(event.data);
                let processedData = data;

                
                if (data.type === 'gameState' && data.data) {
                    setGameState(data.data);
                    processedData = data.data; 
                } else {
                    setGameState(data);
                }

                
                if (isTournamentMode && tournamentMatch && processedData.score) {
                    const { player1: p1Score, player2: p2Score } = processedData.score;

                    console.log(`Tournament scores: ${tournamentMatch.player1} (${p1Score}) vs ${tournamentMatch.player2} (${p2Score})`);

                    
                    if (p1Score >= 3 || p2Score >= 3) {
                        const winner = p1Score >= 3 ? 'player1' : 'player2';
                        const winnerName = winner === 'player1' ? tournamentMatch.player1 : tournamentMatch.player2;

                        
                        const existingResult = localStorage.getItem('tournamentGameResult');
                        if (!existingResult) {
                            console.log(`🏆 Tournament winner detected: ${winnerName} (${winner}) with score ${p1Score}-${p2Score}`);
                            handleTournamentGameEnd(winner);
                        }
                    }
                }

                
                if (processedData.gameStatus === 'gameOver' && processedData.winner) {
                    console.log(`🎮 Game over detected!`, {
                        winner: processedData.winner,
                        score: processedData.score,
                        processingGameOver: processingGameOverRef.current,
                        isPvPMode,
                        isTournamentMode,
                        user: user ? `ID:${user.id}` : 'NO_USER'
                    });

                    
                    if (processingGameOverRef.current) {
                        console.log('🚫 BLOCKED: Already processing gameOver');
                        return;
                    }

                    processingGameOverRef.current = true;

                    
                    if (!isPvPMode && !isTournamentMode) {
                        
                        const gameId = `${processedData.score.player1}-${processedData.score.player2}-${Date.now()}`;
                        console.log(`💾 Calling saveGameResult for AI game:`, { winner: processedData.winner, gameId });
                        saveGameResult(processedData.winner, gameId);
                    } else {
                        console.log('🚫 SKIPPING save for non-AI game:', { isPvPMode, isTournamentMode });
                    }

                    
                    setTimeout(() => {
                        processingGameOverRef.current = false;
                    }, 3000);
                }

                
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

        };

        
        if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
        }

        
        reconnectTimeoutRef.current = setTimeout(() => {
            connectWebSocket();
        }, 100);

        return () => {
            console.log('Cleaning up WebSocket connection');

            
            if (reconnectTimeoutRef.current) {
                clearTimeout(reconnectTimeoutRef.current);
            }

            
            if (socketRef.current) {
                socketRef.current.onopen = null;
                socketRef.current.onclose = null;
                socketRef.current.onerror = null;
                socketRef.current.onmessage = null;
                socketRef.current.close();
                socketRef.current = null;
            }
        };
    }, [token, isPvPMode, isTournamentMode, navigate, tournamentMatch]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            pressedKeys.current.add(e.key);
        };

        const handleKeyUp = (e: KeyboardEvent) => {
            pressedKeys.current.delete(e.key);
        };

        
        movementInterval.current = setInterval(() => {
            if (pressedKeys.current.size > 0) {
                sendMovement();
            }
        }, 50); 

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
            if (movementInterval.current) {
                clearInterval(movementInterval.current);
            }
        };
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
            
            console.log('🎮 Restarting game - resetting ALL save flags');
            setGameResultSaved(false);
            setLastSavedGameId(null);
            setLastSaveTime(0);
            saveBlockedRef.current = false;
            processingGameOverRef.current = false;

            
            if (saveTimeoutRef.current) {
                clearTimeout(saveTimeoutRef.current);
                saveTimeoutRef.current = null;
            }

            
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
            {}
            <div className="absolute inset-0 pointer-events-none">
                {}
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

                {}
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

            {}
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

            {}
            {isCountdown && gameState?.countdown && gameState.countdown > 0 && (
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-60 z-20 backdrop-blur-sm">
                    <div className="text-8xl font-bold text-electric-green animate-pulse drop-shadow-lg">
                        {gameState.countdown}
                    </div>
                </div>
            )}

            {}
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
                                <div className="flex justify-center">
                                    <Link
                                        to="/tournament"
                                        className="btn btn-primary px-6 py-3 text-lg"
                                    >
                                        Continue Tournament
                                    </Link>
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

            {}
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

            {}
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
