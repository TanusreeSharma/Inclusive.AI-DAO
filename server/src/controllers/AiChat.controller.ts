import { JsonController, Authorized, BodyParam, Post, CurrentUser, Get, Param, QueryParam } from 'routing-controllers'
import type { ChatCompletionRequestMessage } from 'openai'

import { openai, winstonLogger } from '@/config'
import { AiResponse, Chat, User } from '@/database/entity'
import { promptInjectionMain, promptInjectionVoteAsk } from '@/data/prompts'
import { removeProfanity } from '@/utils/remove-profanity'

@JsonController('/ai')
@Authorized()
export default class AiChatController {
  @Post('/chat')
  async chatAI(
    @BodyParam('connection') connection: string,
    @BodyParam('dialogue') _dialogue: ChatCompletionRequestMessage,
    @BodyParam('location') location: string,
    @CurrentUser({ required: true }) user: User
  ) {
    if (_dialogue.role !== 'user') return { connection, dialogue: null }

    const dialogue = {
      role: _dialogue.role,
      content: removeProfanity(_dialogue.content.trim())
    }

    try {
      const dialogueHistoryRaw = await Chat.find({
        where: {
          user: {
            id: user.id
          },
          connection
        },
        relations: ['aiResponse'], // get the AI response if it exists
        order: {
          createdAt: 'ASC'
        }
      })
      // console.log('dialogueHistoryRaw', dialogueHistoryRaw)

      const dialogueHistory = dialogueHistoryRaw
        .map((chat) => {
          // console.log(chat)
          const dialogues: ChatCompletionRequestMessage[] = [
            {
              role: 'user',
              content: chat.text
            }
          ]

          if (chat.aiResponse) {
            dialogues.push({
              role: 'assistant',
              content: chat.aiResponse.text
            })
          }

          return dialogues
        })
        .flat()
      // console.log('dialogueHistory', dialogueHistory)

      const systemMessage = { role: 'system', content: '' } as ChatCompletionRequestMessage
      if (location === 'main-chat') {
        systemMessage.content = promptInjectionMain
      } else if (location === 'vote-ask') {
        systemMessage.content = promptInjectionVoteAsk
      }

      const chatCompletion = await openai.createChatCompletion({
        model: 'gpt-3.5-turbo',
        // model: 'gpt-4',
        messages: [systemMessage, ...dialogueHistory, dialogue],
        max_tokens: 80
      })
      // console.log('chatCompletion', chatCompletion)
      winstonLogger.info(`chat completion ${user.id}`)

      const aiMessage = chatCompletion.data.choices[0].message

      // Create the new message entry
      const newChat = new Chat()
      // TODO: make sure User exists
      newChat.user = user
      newChat.connection = connection
      newChat.createdAt = new Date()
      newChat.text = dialogue.content
      await newChat.save()

      // Save the AI response
      const newAiResponse = new AiResponse()
      newAiResponse.text = aiMessage.content
      newAiResponse.connection = connection
      newAiResponse.createdAt = new Date()
      newAiResponse.chat = newChat
      await newAiResponse.save()

      newChat.aiResponse = newAiResponse
      await newChat.save()

      return {
        connection,
        dialogue: chatCompletion.data.choices[0].message
      }
    } catch (err) {
      console.log(err)
      winstonLogger.error(`chat error ${user.id} ${(err as Error).message}`)
      return { connection, dialogue: null }
    }
  }

  @Get('/chat-history')
  async getChatHistory(
    @CurrentUser({ required: true }) user: User,
    @QueryParam('connection', { required: true }) connection: string
  ) {
    try {
      const chatHistory = await Chat.find({
        where: {
          user: {
            id: user.id
          },
          connection
        },
        relations: ['aiResponse'], // get the AI response if it exists
        order: {
          createdAt: 'ASC'
        }
        // cache: true
      })

      return { error: null, payload: { connection, chatHistory } }
    } catch (err) {
      console.log(err)
      return { error: err, payload: null }
    }
  }
}
