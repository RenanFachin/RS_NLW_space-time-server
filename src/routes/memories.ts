import { FastifyInstance } from 'fastify'
import { prisma } from '../lib/prisma'
import z from 'zod'

export async function memoriesRoutes(app: FastifyInstance) {
  // Buscando todas as memórias
  app.get('/memories', async () => {
    const memories = await prisma.memory.findMany({
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
      }
    })
  })

  // Listando uma memória específica
  app.get('/memories/:id', async (request) => {
    const memoriesParamsSchema = z.object({
      id: z.string().uuid(),
    })

    const { id } = memoriesParamsSchema.parse(request.params)

    const memory = await prisma.memory.findUniqueOrThrow({
      where: {
        id,
      },
    })

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
        userId: 'f0adcb5b-6101-4452-a936-e0d64cb8a79f',
      },
    })

    return memory
  })

  // Atualizar uma memória
  app.put('/memories/:id', async (request) => {
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

    const memory = await prisma.memory.update({
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
  app.delete('/memories/:id', async (request) => {
    const memoriesParamsSchema = z.object({
      id: z.string().uuid(),
    })

    const { id } = memoriesParamsSchema.parse(request.params)

    await prisma.memory.delete({
      where: {
        id,
      },
    })
  })
}
