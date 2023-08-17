export * from './profile'
export * from './user'

export type GptChatDialogue = {
  role: 'user' | 'system' | 'assistant'
  content: string
}