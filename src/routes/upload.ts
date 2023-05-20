import { randomUUID } from 'node:crypto'
import { extname, resolve } from 'node:path'
import { FastifyInstance } from 'fastify'
import { createWriteStream } from 'node:fs'
import { pipeline } from 'node:stream'
import { promisify } from 'node:util'

// Pipeline permite verificar quando um processo chegou até o final
// Promisify transformar funções antigas, que não suportam promises, em funções que suportam promises
const pump = promisify(pipeline)

export async function uploadRoutes(app: FastifyInstance) {
  app.post('/upload', async (request, reply) => {
    const upload = await request.file({
      limits: {
        fileSize: 15_728_640, // 15mb
      },
    })

    if (!upload) {
      return reply.status(400).send()
    }

    // Verificando se é video ou foto (mimetype)
    // regex
    const mimeTypeRegex = /^(image|video)\/[a-zA-Z]+/

    const isValidFileFormat = mimeTypeRegex.test(upload.mimetype)

    // Quando não é nem video nem imagem
    if (!isValidFileFormat) {
      return reply.status(400).send()
    }

    // console.log(upload.filename)

    // Gerando nomes aleatórios para os arquivos enviados para não ter duplicidade
    const fileId = randomUUID()
    const extension = extname(upload.filename)

    // Novo nome
    const fileName = fileId.concat(extension)

    // Streaming (salvando aos poucos no db)
    const writeStream = createWriteStream(
      resolve(__dirname, '../../uploads', fileName),
    )

    await pump(upload.file, writeStream)

    const fullUrl = request.protocol.concat('://').concat(request.hostname)
    const fileUrl = new URL(`/uploads/${fileName}`, fullUrl).toString()

    return {
      fileUrl,
    }
  })
}
