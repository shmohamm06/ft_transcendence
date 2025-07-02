import { FastifyInstance } from 'fastify';
import { getSettingsHandler, updateSettingsHandler } from './settings.controller';
import { $ref } from './settings.schema';

async function settingsRoutes(server: FastifyInstance) {
    server.addHook('onRequest', async (request, reply) => {
        try {
            if ((request as any).jwtVerify) {
                await (request as any).jwtVerify();
            }
        } catch (err) {
            reply.send(err);
        }
    });

    server.get(
        '/',
        {
            schema: {
                response: {
                    200: $ref('getSettingsResponseSchema'),
                },
            },
        },
        getSettingsHandler
    );

    server.put(
        '/',
        {
            schema: {
                body: $ref('updateSettingsRequestSchema'),
            },
        },
        updateSettingsHandler
    );
}

export default settingsRoutes;
