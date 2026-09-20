import { z } from 'zod';
export const promptSchema = z.object({ title:z.string().min(4).max(120), prompt:z.string().min(20).max(5000), description:z.string().min(20).max(800), categoryId:z.string().cuid(), styleId:z.string().cuid(), aspectRatio:z.string().max(20).optional() });
export type PromptInput = z.infer<typeof promptSchema>;
