import { z } from 'zod';
import { buildJsonSchemas } from 'fastify-zod';

const settingSchema = z.object({
    key: z.string(),
    value: z.string(),
});

const getSettingsResponseSchema = z.array(settingSchema);

const updateSettingsRequestSchema = z.array(settingSchema);

export type UpdateSettingsInput = z.infer<typeof updateSettingsRequestSchema>;

export const { schemas: settingsSchemas, $ref } = buildJsonSchemas({
    getSettingsResponseSchema,
    updateSettingsRequestSchema,
}, { $id: 'settingsSchemas' });
