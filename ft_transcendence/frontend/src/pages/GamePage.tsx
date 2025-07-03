import { useState, useEffect, useRef } from 'react';
import PongScene from '../components/PongScene';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface GameState {
    ball: { x: number; y: number };
    player1: { y: number };
    player2: { y: number };
    score: { player1: number; player2: number };
}

const GamePage = () => {
    const [gameState, setGameState] = useState<GameState | null>(null);
    const [connectionStatus, setConnectionStatus] = useState('Connecting...');
    const socketRef = useRef<WebSocket | null>(null);
    const { token } = useAuth();

    useEffect(() => {
        const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        let wsUrl = `${wsProtocol}//${window.location.host}/ws/game`;

        // Add token as query parameter if available
        if (token) {
            wsUrl += `?token=${encodeURIComponent(token)}`;
        }

        console.log('Connecting to WebSocket:', wsUrl);
        const socket = new WebSocket(wsUrl);
        socketRef.current = socket;

        socket.onopen = () => {
            console.log('WebSocket connected');
            setConnectionStatus('Connected');
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
                // Handle both direct game state and wrapped format
                if (data.type === 'gameState' && data.data) {
                    setGameState(data.data);
                } else {
                    setGameState(data);
                }
            } catch (error) {
                console.error('Error parsing game state:', error);
            }
        };

        return () => {
            console.log('Cleaning up WebSocket connection');
            socket.close();
        };
    }, [token]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (socketRef.current?.readyState !== WebSocket.OPEN) return;
            if (e.key === 'w' || e.key === 'W' || e.key === 'ArrowUp') {
                socketRef.current.send(JSON.stringify({ action: 'move', direction: 'up' }));
            } else if (e.key === 's' || e.key === 'S' || e.key === 'ArrowDown') {
                socketRef.current.send(JSON.stringify({ action: 'move', direction: 'down' }));
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    return (
        <div className="relative w-screen h-screen bg-black">
            <div className="absolute top-0 left-0 right-0 z-10 p-4 flex justify-between items-center text-white bg-black bg-opacity-50">
                <div>
                    <Link to="/" className="text-blue-400 hover:underline">← Back to Home</Link>
                </div>
                <div className="text-2xl font-bold">
                    <span>Player 1: {gameState?.score.player1 ?? 0}</span>
                    <span className="mx-4">|</span>
                    <span>AI: {gameState?.score.player2 ?? 0}</span>
                </div>
                <div>Status: {connectionStatus}</div>
            </div>
            <PongScene gameState={gameState} />
        </div>
    );
};

export default GamePage;
