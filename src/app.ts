import 'dotenv/config'

import fastify from 'fastify'
import cors from '@fastify/cors'
import fastifyJwt from '@fastify/jwt'
import multipart from '@fastify/multipart'
import { memoriesRoutes } from './routes/memories'
import { authRoutes } from './routes/auth'
import { env } from './env'
import { uploadRoutes } from './routes/upload'
import { resolve } from 'node:path'

export const app = fastify()

// Habilitando o cors para que seja possível um front end acessar as infos do back end
app.register(cors, {
  origin: true, // todas URLS de front-end podem acessar o back-end
})

app.register(fastifyJwt, {
  secret: env.JWT_SECRET,
})

app.register(multipart)

app.register(require('@fastify/static'), {
  root: resolve(__dirname, '../uploads'),
  prefix: '/uploads',
})

// Rotas da aplicação
app.register(memoriesRoutes)
app.register(authRoutes)
app.register(uploadRoutes)
