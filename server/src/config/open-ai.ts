import { Configuration, OpenAIApi } from 'openai'

import { envVars } from '@/config'

export const openai = new OpenAIApi(
  new Configuration({
    apiKey: envVars.OPENAI_API_KEY
  })
)
