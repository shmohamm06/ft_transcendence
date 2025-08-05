"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.$ref = exports.settingsSchemas = void 0;
const zod_1 = require("zod");
const fastify_zod_1 = require("fastify-zod");
const settingSchema = zod_1.z.object({
    key: zod_1.z.string(),
    value: zod_1.z.string(),
});
const getSettingsResponseSchema = zod_1.z.array(settingSchema);
const updateSettingsRequestSchema = zod_1.z.array(settingSchema);
_a = (0, fastify_zod_1.buildJsonSchemas)({
    getSettingsResponseSchema,
    updateSettingsRequestSchema,
}, { $id: 'settingsSchemas' }), exports.settingsSchemas = _a.schemas, exports.$ref = _a.$ref;
//# sourceMappingURL=settings.schema.js.map