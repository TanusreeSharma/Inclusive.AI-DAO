import { Authorized, CurrentUser, Get, JsonController, Post } from 'routing-controllers'
import { MoreThan } from 'typeorm'

import { Chat, User } from '@/database/entity'
import { assignVotePowerToUser, sha256 } from '@/utils'
import { createProposals } from '@/scripts/create-proposal'
import { env } from 'process'
import { envVars } from '@/config'

const SHA_MAP_OF_USER_ID = new Map<string, string>()

@JsonController()
export class AppController {
  @Get('/ping')
  ping() {
    return { error: null, payload: 'pong' }
  }

  @Get('/discuss/chat-history')
  @Authorized()
  async getDiscussChatHistory(@CurrentUser({ required: true }) user: User) {
    const maxChats = 50

    if (!user) return { error: 'user-required', payload: null }

    // Current User doesn't query `Pod` for efficiency when checking authorization.
    // So we need to query the User again but the `Pod` relation included.
    const userWithPod = await User.findOne({
      where: { id: user.id },
      relations: ['pod']
    })
    if (!userWithPod) return { error: 'user-pod-not-found', payload: null }

    // Make sure this is synced with frontend's connection ID for pod discussion chat
    const podDiscussConnection = `pod-${userWithPod.pod.id}`

    try {
      const chatHistory = await Chat.find({
        where: {
          connection: podDiscussConnection
        },
        relations: ['user'],
        order: {
          createdAt: 'DESC'
        },
        take: maxChats
      })

      const chatHistoryWithUserTags = chatHistory.map((chat) => {
        const userId = chat.user.id
        const userTag = SHA_MAP_OF_USER_ID.get(userId) || sha256(userId)
        if (!SHA_MAP_OF_USER_ID.has(userId)) SHA_MAP_OF_USER_ID.set(userId, userTag)

        return {
          id: chat.id,
          text: chat.text,
          aiResponse: null,
          createdAt: chat.createdAt,
          tag: userTag
        }
      })

      return { error: null, payload: { connection: podDiscussConnection, chatHistory: chatHistoryWithUserTags } }
    } catch (err) {
      console.log(err)
      return { error: err, payload: null }
    }
  }

  @Post('/admin/mint-tokens')
  @Authorized()
  async mintTokens(@CurrentUser({ required: true }) user: User) {
    if (user.id !== 'jwp6@illinois.edu' && user.id !== 'tsharma6@illinois.edu')
      return { error: 'user-not-authorized', payload: null }

    try {
      // only users registered after this timestamp will be considered for all actions below
      const considerUsersAfterDate = new Date(envVars.CONSIDER_USERS_AFTER_DATE || '2023-10-04T12:00:00.000Z')
      // const considerUsersAfterDate = new Date('2023-08-08T00:00:00.000Z')

      //
      // Assign users early weights or not (for users in "early" pods)
      //

      // Quadratic Early, 20%
      const usersQuadraticEarlyCount = await User.count({
        where: { pod: { slug: 'quadratic-early' }, createdAt: MoreThan(considerUsersAfterDate) }
      })
      const usersQuadraticEarlyTopN = Math.ceil(usersQuadraticEarlyCount * 0.2)
      const usersQuadraticEarly = await User.find({
        where: { pod: { slug: 'quadratic-early' }, createdAt: MoreThan(considerUsersAfterDate) },
        order: { createdAt: 'DESC' },
        take: usersQuadraticEarlyTopN
      })

      console.log('Quadratic Early Member Counts:    ', usersQuadraticEarlyCount)
      console.log('Quadratic Early Weighted Selected:', usersQuadraticEarly.length)
      for (const user of usersQuadraticEarly) {
        user.votingEarly = true
        await user.save()
      }

      // Rank Early, 20%
      const usersRankEarlyCount = await User.count({
        where: { pod: { slug: 'ranked-early' }, createdAt: MoreThan(considerUsersAfterDate) }
      })
      const usersRankEarlyTopN = Math.ceil(usersRankEarlyCount * 0.2)
      const usersRankEarly = await User.find({
        where: { pod: { slug: 'ranked-early' }, createdAt: MoreThan(considerUsersAfterDate) },
        order: { createdAt: 'DESC' },
        take: usersRankEarlyTopN
      })

      console.log('Rank Early Members Count:    ', usersRankEarlyCount)
      console.log('Rank Early Weighted Selected:', usersRankEarly.length)
      for (const user of usersRankEarly) {
        user.votingEarly = true
        await user.save()
      }

      //
      // Airdrop vote tokens to all users
      //
      // NOTE: Must be done BEFORE the proposals are created (to reflect voting power)
      //

      const users = await User.find({ where: { createdAt: MoreThan(considerUsersAfterDate) }, relations: ['pod'] })
      console.log('============================================')
      console.log(`Eligible User Count: ${users.length}`)
      console.log('============================================')

      for (const user of users) {
        if (!user.pod) continue
        const tokenType = user.pod.slug.startsWith('quadratic') ? 'quadratic' : 'rank'
        const tokenEarlyWeight = user.pod.slug.endsWith('early')

        let tokenAmount = 100 // default, no decimal exponentiation
        if (tokenEarlyWeight) {
          tokenAmount = user.votingEarly ? 400 : 25
        }
        console.log(user.address, user.votingEarly, tokenAmount)

        await assignVotePowerToUser(user, tokenType, tokenAmount)
      }

      return { error: null, payload: 'success' }
    } catch (err) {
      console.log(err)
      return { error: err, payload: null }
    }
  }

  @Post('/admin/create-proposals')
  @Authorized()
  async createProposals(@CurrentUser({ required: true }) user: User) {
    if (user.id !== 'jwp6@illinois.edu' && user.id !== 'tsharma6@illinois.edu')
      return { error: 'user-not-authorized', payload: null }

    try {
      await createProposals()
      // Wait for snanpshot backend to process proposals
      await new Promise((resolve) => setTimeout(resolve, 3_000))

      return { error: null, payload: 'success' }
    } catch (err) {
      console.log(err)
      return { error: err, payload: null }
    }
  }
}
