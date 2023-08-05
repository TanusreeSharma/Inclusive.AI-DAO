import { JsonController, Authorized, Param, BodyParam, Get, Post, UseAfter } from 'routing-controllers'

import { openai } from '@/config'
import { FinalSay } from '@/middleware'

@JsonController('/ai')
@Authorized()
@UseAfter(FinalSay)
export default class AiChatController {
  @Post('/chat')
  async chatAI(@BodyParam('prompt') prompt: string) {
    const chatCompletion = await openai.createChatCompletion({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content:
            'This is an interactive conversation where you, the AI assistant, will help users in digesting value topics pertinent to the AI alignments with humanity, and creating a thoughtful opinion on such topics before discussing them with other members.'
        },
        { role: 'user', content: prompt }
      ],
      max_tokens: 1024
    })

    return chatCompletion.data.choices[0].message
  }
}
