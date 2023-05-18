import { FastifyInstance } from 'fastify'
import axios from 'axios'
import { z } from 'zod'

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
          client_id: process.env.GITHUB_CLIENT_ID,
          client_secret: process.env.GITHUB_CLIENT_SECRET,
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

    const user = userSchema.parse(userResponse.data)

    return {
      user,
    }
  })
}
