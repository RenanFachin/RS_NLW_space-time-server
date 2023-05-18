import { FastifyInstance } from 'fastify'
import axios from 'axios'
import { z } from 'zod'
import { prisma } from '../lib/prisma'
import { env } from '../env'

export async function authRoutes(app: FastifyInstance) {
  app.post('/register', async (request) => {
    const authUserBodySchema = z.object({
      // code é gerado e retornado pelo github
      code: z.string(),
    })

    // Com este code é possível autenticar o usuário
    const { code } = authUserBodySchema.parse(request.body)

    // Chamada para API do github para que seja retornado um accessToken
    const accessTokenResponse = await axios.post(
      'https://github.com/login/oauth/access_token',
      null,
      {
        // parâmetro que vai na url
        params: {
          client_id: env.GITHUB_CLIENT_ID,
          client_secret: env.GITHUB_CLIENT_SECRET,
          code,
        },
        // metadados da requisição
        headers: {
          // Formato da resposta
          Accept: 'application/json',
        },
      },
    )

    // Recuperando o access token
    const { access_token } = accessTokenResponse.data

    // Nova requisição para API do github para pegar os dados do usuário
    const userResponse = await axios.get('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    })

    // Dados do usuário
    // Validando os dados do usuário
    const userSchema = z.object({
      id: z.number(),
      login: z.string(),
      name: z.string(),
      avatar_url: z.string().url(),
    })

    const userInfo = userSchema.parse(userResponse.data)

    // Salvando os dados do usuário no db
    // 1 validação -> Ver se já existe
    let user = await prisma.user.findUnique({
      where: {
        githubId: userInfo.id,
      },
    })

    // Não existindo, criar um novo
    if (!user) {
      user = await prisma.user.create({
        data: {
          githubId: userInfo.id,
          login: userInfo.login,
          name: userInfo.name,
          avatarUrl: userInfo.avatar_url,
        },
      })
    }

    const token = app.jwt.sign(
      {
        // Quais informações que vão estar contidas no token (infos não sensíveis)
        name: user.name,
        avatarUrl: user.avatarUrl,
      },
      {
        // Sub é para refererenciar à quem o token é
        sub: user.id,
        expiresIn: '7 days',
      },
    )

    return {
      // Este retorno de user é o user criado no nosso DB
      token,
    }
  })
}
