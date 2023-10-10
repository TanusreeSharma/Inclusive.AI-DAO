import { JsonController, Authorized, BodyParam, Post, CurrentUser } from 'routing-controllers'

import { Survey, User } from '@/database/entity'

interface SurveyResponse {
  q1A: number
  q1B: number
  q1C: number
  q1D: number
  q1E: number
  q1F: number
  q1G: number
  q2A: number
  q2B: number
  q2C: number
  q2D: number
  q2E: number
  q2F: number
  q2G: number
  q2H: number
  q2I: number
  q2J: number
  q2K: number
  // attention check questions
  attention1: number
}

@JsonController('/survey')
@Authorized()
export default class SurveyController {
  @Post('/ai') // POST /survey/ai
  async submitSurveyPostAiDiscussion(
    @BodyParam('survey') survey: SurveyResponse,
    @CurrentUser({ required: true }) user: User
  ) {
    try {
      // Create the new message entry
      const newSurvey = new Survey()
      newSurvey.user = user
      newSurvey.stage = 'ai' // ai-discussion
      newSurvey.createdAt = new Date()

      const keys = [
        'q1A',
        'q1B',
        'q1C',
        'q1D',
        'q1E',
        'q1F',
        'q1G',
        'q2A',
        'q2B',
        'q2C',
        'q2D',
        'q2E',
        'q2F',
        'q2G',
        'q2H',
        'q2I',
        'q2J',
        'q2K',
        'attention1'
      ]

      keys.forEach((key: string) => {
        if (survey[key] === 0) {
          throw new Error('Invalid survey response')
        }
        newSurvey[key] = survey[key]
      })

      await newSurvey.save()

      user.aiSurveyCompleted = true
      await user.save()

      return { error: null, payload: true }
    } catch (err) {
      console.log(err)
      return { error: 'invalid-survey', payload: null }
    }
  }
}
