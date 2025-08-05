import { FastifyRequest, FastifyReply } from 'fastify';
import { getSettingsForUser, updateSettingsForUser } from './settings.service';
import { UpdateSettingsInput } from './settings.schema';

export async function getSettingsHandler(request: any, reply: FastifyReply) {
    try {
        if (!request.user || !request.user.id) {
            return reply.code(401).send({ message: 'Unauthorized' });
        }
        const settings = await getSettingsForUser(request.user.id);
        return reply.send(settings);
    } catch (e) {
        console.error(e);
        return reply.code(500).send({ message: 'Error retrieving settings' });
    }
}

export async function updateSettingsHandler(
    request: any,
    reply: FastifyReply
) {
    try {
        if (!request.user || !request.user.id) {
            return reply.code(401).send({ message: 'Unauthorized' });
        }
        await updateSettingsForUser(request.user.id, request.body as UpdateSettingsInput);
        return reply.code(204).send();
    } catch (e) {
        console.error(e);
        return reply.code(500).send({ message: 'Error updating settings' });
    }
}
