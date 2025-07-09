import { z } from 'zod';
declare const updateSettingsRequestSchema: z.ZodArray<z.ZodObject<{
    key: z.ZodString;
    value: z.ZodString;
}, "strip", z.ZodTypeAny, {
    value: string;
    key: string;
}, {
    value: string;
    key: string;
}>, "many">;
export type UpdateSettingsInput = z.infer<typeof updateSettingsRequestSchema>;
export declare const settingsSchemas: import("fastify-zod").JsonSchema[], $ref: import("fastify-zod/build/JsonSchema").$Ref<{
    getSettingsResponseSchema: z.ZodArray<z.ZodObject<{
        key: z.ZodString;
        value: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        value: string;
        key: string;
    }, {
        value: string;
        key: string;
    }>, "many">;
    updateSettingsRequestSchema: z.ZodArray<z.ZodObject<{
        key: z.ZodString;
        value: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        value: string;
        key: string;
    }, {
        value: string;
        key: string;
    }>, "many">;
}>;
export {};
//# sourceMappingURL=settings.schema.d.ts.map