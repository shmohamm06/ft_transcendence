import { FastifyInstance } from 'fastify';
import { registerUserHandler, loginHandler, oauthAuthorizeHandler, oauthCallbackHandler, createTestUserHandler, updateUserStatsHandler } from './user.controller';
import { getUserProfileHandler } from './user.controller';
import { $ref } from './user.schema';


export default async function userRoutes(server: FastifyInstance) {
    server.post('/register', {
        schema: {
            body: $ref('registerUserSchema'),
            response: {
                201: $ref('userResponseSchema'),
            },
        },
    }, registerUserHandler);

    server.post('/login', {
        schema: {
            body: $ref('loginSchema'),
        },
    }, loginHandler);

    
    server.get('/oauth/42/authorize', oauthAuthorizeHandler);

    server.post('/oauth/42/callback', {
        schema: {
            body: $ref('oauthCallbackSchema'),
        },
    }, oauthCallbackHandler);

    
    server.post('/create-test-user', createTestUserHandler);

    server.get('/profile', {
        preHandler: async (request, reply) => {
            try {
                await request.jwtVerify();
            } catch (err) {
                reply.send(err);
            }
        },
    }, getUserProfileHandler);

    server.post('/:id/stats', {
        preHandler: async (request, reply) => {
            try {
                await request.jwtVerify();
            } catch (err) {
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
    }, updateUserStatsHandler);
}

