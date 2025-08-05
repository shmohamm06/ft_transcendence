"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const settings_controller_1 = require("./settings.controller");
const settings_schema_1 = require("./settings.schema");
async function settingsRoutes(server) {
    server.addHook('onRequest', async (request, reply) => {
        try {
            if (request.jwtVerify) {
                await request.jwtVerify();
            }
        }
        catch (err) {
            reply.send(err);
        }
    });
    server.get('/', {
        schema: {
            response: {
                200: (0, settings_schema_1.$ref)('getSettingsResponseSchema'),
            },
        },
    }, settings_controller_1.getSettingsHandler);
    server.put('/', {
        schema: {
            body: (0, settings_schema_1.$ref)('updateSettingsRequestSchema'),
        },
    }, settings_controller_1.updateSettingsHandler);
}
exports.default = settingsRoutes;
//# sourceMappingURL=settings.route.js.map