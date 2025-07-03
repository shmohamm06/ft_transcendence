import { FastifyInstance } from 'fastify';
import { registerUserHandler, loginHandler } from './user.controller';
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
}

export default userRoutes;
