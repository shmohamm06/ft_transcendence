"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSettingsHandler = getSettingsHandler;
exports.updateSettingsHandler = updateSettingsHandler;
const settings_service_1 = require("./settings.service");
async function getSettingsHandler(request, reply) {
    try {
        if (!request.user || !request.user.id) {
            return reply.code(401).send({ message: 'Unauthorized' });
        }
        const settings = await (0, settings_service_1.getSettingsForUser)(request.user.id);
        return reply.send(settings);
    }
    catch (e) {
        console.error(e);
        return reply.code(500).send({ message: 'Error retrieving settings' });
    }
}
async function updateSettingsHandler(request, reply) {
    try {
        if (!request.user || !request.user.id) {
            return reply.code(401).send({ message: 'Unauthorized' });
        }
        await (0, settings_service_1.updateSettingsForUser)(request.user.id, request.body);
        return reply.code(204).send();
    }
    catch (e) {
        console.error(e);
        return reply.code(500).send({ message: 'Error updating settings' });
    }
}
//# sourceMappingURL=settings.controller.js.map