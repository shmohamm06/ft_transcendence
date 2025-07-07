import { FastifyInstance } from 'fastify';
import { updateUserStatsHandler } from './user.controller';
import { registerUserHandler, loginHandler } from './user.controller';
import { getUserProfileHandler } from './user.controller';
import { $ref } from './user.schema';


async function userRoutes(server: FastifyInstance) {
    server.post('/register', {
        schema: {
            body: $ref('registerUserSchema'),
            response: { 201: $ref('userResponseSchema') },
        },
    }, registerUserHandler);

    server.post('/login', {
        schema: {
            body: $ref('loginSchema'),
            response: {
                200: { type: 'object', properties: { accessToken: { type: 'string' } } },
            },
        },
    }, loginHandler);

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

export default userRoutes;

