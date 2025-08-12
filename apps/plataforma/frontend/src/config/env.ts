import { z } from 'zod';

const EnvSchema = z.object({
  VITE_API_BASE_URL: z.string().url().optional(),
  VITE_GITHUB_CLIENT_ID: z.string().optional(),
});

export const env = EnvSchema.parse(import.meta.env ?? {});
