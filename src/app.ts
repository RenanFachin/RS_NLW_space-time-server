import 'dotenv/config'

import fastify from 'fastify'
import cors from '@fastify/cors'
import fastifyJwt from '@fastify/jwt'
import { memoriesRoutes } from './routes/memories'
import { authRoutes } from './routes/auth'
import { env } from './env'

export const app = fastify()

// Habilitando o cors para que seja possível um front end acessar as infos do back end
app.register(cors, {
  origin: true, // todas URLS de front-end podem acessar o back-end
})

app.register(fastifyJwt, {
  secret: env.JWT_SECRET,
})

// Rotas da aplicação
app.register(memoriesRoutes)
app.register(authRoutes)
