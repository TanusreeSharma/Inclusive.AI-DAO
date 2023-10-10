import { profanityWordsList } from '@/data/profanity-words-list'

export function removeProfanity(text: string) {
  const words = text.split(' ')
  const filteredWords = words.filter((word) => !profanityWordsList.has(word))
  return filteredWords.join(' ')
}
