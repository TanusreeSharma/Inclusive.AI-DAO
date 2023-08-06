import { JsonController, Authorized, Param, BodyParam, Get, Post, UseAfter } from 'routing-controllers'

import { openai } from '@/config'
import { FinalSay } from '@/middleware'
import { GptChatDialogue } from '@/types'

// import type { ChatCompletionRequestMessage } from 'openai'

@JsonController('/ai')
@Authorized()
@UseAfter(FinalSay)
export default class AiChatController {
  @Post('/chat')
  async chatAI(@BodyParam('dialogues') dialogues: GptChatDialogue[]) {
    const chatCompletion = await openai.createChatCompletion({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content:
            'This is an interactive conversation where you, the AI assistant, will help users in digesting value topics pertinent to the AI alignments with humanity, and creating a thoughtful opinion on such topics before discussing them with other members. You will response to the user\'s prompts. Limit your response to the maximum of two sentences, and three sentences if you must need another sentence to provide critical information. Each sentence must be short and deliver concise information without too many punctuations and complex words. You should regard most of the users as laymen and write simple words for the comprehension level of high school students. You must not repeat the prompt written by the user. If a user asks a question, do not start your response by repeating the question. You must keep it like a human-to-human, personal conversation. Users will rely on your information to formulate their own opinions and discuss with others on the topic.'
        },
        ...dialogues,
      ],
      max_tokens: 2048,
    })

    return chatCompletion.data.choices[0].message
  }
}
