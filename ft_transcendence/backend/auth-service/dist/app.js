"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const dotenv = __importStar(require("dotenv"));
const path = __importStar(require("path"));
// Load .env file from current directory
dotenv.config({ path: path.join(__dirname, '../.env') });
// Debug: Check if environment variables are loaded
console.log('Environment variables loaded:', {
    CLIENT_ID: process.env.OAUTH_CLIENT_ID ? 'LOADED' : 'MISSING',
    CLIENT_SECRET: process.env.OAUTH_CLIENT_SECRET ? 'LOADED' : 'MISSING',
    JWT_SECRET: process.env.JWT_SECRET ? 'LOADED' : 'MISSING'
});
const fastify_1 = __importDefault(require("fastify"));
const jwt_1 = __importDefault(require("@fastify/jwt"));
const cors_1 = __importDefault(require("@fastify/cors"));
const init_1 = require("./db/init");
const user_route_1 = __importDefault(require("./modules/user/user.route"));
const user_schema_1 = require("./modules/user/user.schema");
const settings_route_1 = __importDefault(require("./modules/settings/settings.route"));
const settings_schema_1 = require("./modules/settings/settings.schema");
const fastify = (0, fastify_1.default)({ logger: true });
// Initialize Database
(0, init_1.initializeDatabase)();
// Register CORS
fastify.register(cors_1.default, {
    origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
});
// Register JWT
fastify.register(jwt_1.default, {
    secret: process.env.JWT_SECRET || 'a-super-secret-key-that-is-long-enough', // This MUST be the same across services
});
// Add schemas
for (const schema of [...user_schema_1.userSchemas, ...settings_schema_1.settingsSchemas]) {
    fastify.addSchema(schema);
}
// Register user routes
fastify.register(user_route_1.default, { prefix: '/api/users' });
// Register settings routes
fastify.register(settings_route_1.default, { prefix: '/api/settings' });
// Add a new route to verify tokens for other services
fastify.post('/api/verify', async (request, reply) => {
    try {
        await request.jwtVerify();
        reply.send(request.user);
    }
    catch (err) {
        reply.code(401).send({ error: 'Unauthorized' });
    }
});
const start = async () => {
    try {
        await fastify.listen({ port: 3001, host: '0.0.0.0' });
    }
    catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
};
fastify.decorate("authenticate", async function (request, reply) {
    try {
        await request.jwtVerify();
    }
    catch (err) {
        reply.send(err);
    }
});
start();
//# sourceMappingURL=app.js.map