import WebSocket from 'ws';
import { GameGateway } from './modules/game/game.gateway';

const gameGateway = new GameGateway();

const wss = new WebSocket.Server({
    port: 8080,
    host: '0.0.0.0',
    path: '/game'
});

console.log('Game service WebSocket server starting on port 8080');

wss.on('connection', (ws: WebSocket, request: any) => {
    console.log('New WebSocket connection received');
    console.log('Request URL:', request.url);
    console.log('Request headers:', request.headers);

    gameGateway.handleConnection(ws, {
        url: request.url,
        headers: request.headers
    });
});

console.log('Game service is running on port 8080');
