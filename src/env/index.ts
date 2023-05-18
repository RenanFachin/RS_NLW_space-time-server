import 'dotenv/config'
import { z } from 'zod'

const envSchema = z.object({
  JWT_SECRET: z.string(),
  GITHUB_CLIENT_ID: z.string(),
  GITHUB_CLIENT_SECRET: z.string(),
  PORT: z.coerce.number().default(3333),
})

const _env = envSchema.safeParse(process.env)

if (_env.success === false) {
  console.error('Invalid environment variables', _env.error.format())

  throw new Error('Invalid environment variables')
}

// Exportando as variáveis de ambiente já validadas
export const env = _env.data
