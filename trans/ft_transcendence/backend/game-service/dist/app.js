"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ws_1 = __importDefault(require("ws"));
const game_gateway_1 = require("./modules/game/game.gateway");
const gameGateway = new game_gateway_1.GameGateway();
const wss = new ws_1.default.Server({
    port: 8080,
    path: '/ws/game' // This must match nginx proxy path
});
console.log('Game service WebSocket server starting on port 8080 with path /ws/game');
wss.on('connection', (ws, request) => {
    console.log('New WebSocket connection received');
    console.log('Request URL:', request.url);
    console.log('Request headers:', request.headers);
    gameGateway.handleConnection(ws, {
        url: request.url,
        headers: request.headers
    });
});
console.log('Game service is running on port 8080');
