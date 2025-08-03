"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const user_controller_1 = require("./user.controller");
const user_controller_2 = require("./user.controller");
const user_controller_3 = require("./user.controller");
const user_schema_1 = require("./user.schema");
async function userRoutes(server) {
    server.post('/register', {
        schema: {
            body: (0, user_schema_1.$ref)('registerUserSchema'),
            response: { 201: (0, user_schema_1.$ref)('userResponseSchema') },
        },
    }, user_controller_2.registerUserHandler);
    server.post('/login', {
        schema: {
            body: (0, user_schema_1.$ref)('loginSchema'),
            response: {
                200: { type: 'object', properties: { accessToken: { type: 'string' } } },
            },
        },
    }, user_controller_2.loginHandler);
    // OAuth routes
    server.get('/oauth/42/authorize', {
        schema: {
            response: {
                200: {
                    type: 'object',
                    properties: {
                        authURL: { type: 'string' },
                        state: { type: 'string' }
                    }
                },
            },
        },
    }, user_controller_2.oauthAuthorizeHandler);
    server.post('/oauth/42/callback', {
        schema: {
            body: (0, user_schema_1.$ref)('oauthCallbackSchema'),
            response: {
                200: {
                    type: 'object',
                    properties: {
                        accessToken: { type: 'string' },
                        user: { type: 'object' }
                    }
                },
            },
        },
    }, user_controller_2.oauthCallbackHandler);
    server.get('/profile', {
        preHandler: async (request, reply) => {
            try {
                await request.jwtVerify();
            }
            catch (err) {
                reply.send(err);
            }
        },
    }, user_controller_3.getUserProfileHandler);
    server.post('/:id/stats', {
        preHandler: async (request, reply) => {
            try {
                await request.jwtVerify();
            }
            catch (err) {
                reply.send(err);
            }
        },
        schema: {
            body: {
                type: 'object',
                properties: {
                    game: { type: 'string', enum: ['pong', 'tictactoe'] },
                    result: { type: 'string', enum: ['win', 'loss'] }
                },
                required: ['game', 'result']
            }
        }
    }, user_controller_1.updateUserStatsHandler);
}
exports.default = userRoutes;
//# sourceMappingURL=user.route.js.map