import fastify from 'fastify'
import cors from '@fastify/cors'
import { memoriesRoutes } from './routes/memories'

const app = fastify()

// Habilitando o cors para que seja possível um front end acessar as infos do back end
app.register(cors, {
  origin: true, // todas URLS de front-end podem acessar o back-end
})

// Rotas da aplicação
app.register(memoriesRoutes)

app
  .listen({
    port: 3333,
  })
  .then(() => {
    console.log('HTTP server running on http://localhost:3333')
  })
