import { FastifyInstance } from 'fastify'
import { prisma } from '../lib/prisma'
import z from 'zod'

export async function memoriesRoutes(app: FastifyInstance) {
  // Verificar o token antes de cada uma das rotas de memories
  app.addHook('preHandler', async (request) => {
    // Verificando se o token existe, caso não exista ele não dá acesso ao restante da rota
    await request.jwtVerify()
  })

  // Buscando todas as memórias
  app.get('/memories', async (request) => {
    // request.user.sub -> é o id do usuário

    const memories = await prisma.memory.findMany({
      // listando apenas as que sejam do usuário contido no token
      where: {
        userId: request.user.sub,
      },
      orderBy: {
        // Ordendando da mais antiga para a mais atual
        createdAt: 'asc',
      },
    })

    // Fazendo um "corte" nas memórias pois no front end não é utilizado o content inteiro
    return memories.map((memory) => {
      return {
        id: memory.id,
        coverUrl: memory.coverUrl,
        excerpt: memory.content.substring(0, 115).concat('...'),
        createdAt: memory.createdAt,
      }
    })
  })

  // Listando uma memória específica
  app.get('/memories/:id', async (request, reply) => {
    const memoriesParamsSchema = z.object({
      id: z.string().uuid(),
    })

    const { id } = memoriesParamsSchema.parse(request.params)

    const memory = await prisma.memory.findUniqueOrThrow({
      where: {
        id,
      },
    })

    if (!memory.isPublic && memory.userId !== request.user.sub) {
      return reply.status(401).send()
    }

    return memory
  })

  // Criar uma nova memória
  // coerce.boolean() => vai verificar o que vem do front end para saber se é true ou false
  app.post('/memories', async (request) => {
    const createMemoryBodySchema = z.object({
      content: z.string(),
      coverUrl: z.string(),
      isPublic: z.coerce.boolean().default(false),
    })

    const { content, coverUrl, isPublic } = createMemoryBodySchema.parse(
      request.body,
    )

    const memory = await prisma.memory.create({
      data: {
        content,
        coverUrl,
        isPublic,
        userId: request.user.sub,
      },
    })

    return memory
  })

  // Atualizar uma memória
  app.put('/memories/:id', async (request, reply) => {
    const updateMemoryBodySchema = z.object({
      content: z.string(),
      coverUrl: z.string(),
      isPublic: z.coerce.boolean().default(false),
    })

    const memoriesParamsSchema = z.object({
      id: z.string().uuid(),
    })

    const { content, coverUrl, isPublic } = updateMemoryBodySchema.parse(
      request.body,
    )
    const { id } = memoriesParamsSchema.parse(request.params)

    let memory = await prisma.memory.findUniqueOrThrow({
      where: {
        id,
      },
    })

    if (memory.userId !== request.user.sub) {
      return reply.status(401).send()
    }

    memory = await prisma.memory.update({
      // Atualizar os dados da mensagem de id passado
      where: {
        id,
      },
      // Mandando os seguintes dados
      data: {
        content,
        coverUrl,
        isPublic,
      },
    })

    return memory
  })

  // Deletar uma memória
  app.delete('/memories/:id', async (request, reply) => {
    const memoriesParamsSchema = z.object({
      id: z.string().uuid(),
    })

    const { id } = memoriesParamsSchema.parse(request.params)

    const memory = await prisma.memory.findUniqueOrThrow({
      where: {
        id,
      },
    })

    if (memory.userId !== request.user.sub) {
      return reply.status(401).send()
    }

    await prisma.memory.delete({
      where: {
        id,
      },
    })
  })
}
