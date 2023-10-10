// for running random scripts

import AppDataSource from '@/database/data-source'
import { User } from '@/database/entity'
import { assignSnapshotProposal, assignVotePowerToUser } from '@/utils'
import { createProposals } from './create-proposal'
import { MoreThan } from 'typeorm'

export const valueQuestionIds = {
  'quadratic-equal': 1,
  'quadratic-early': 2,
  'ranked-equal': 3,
  'ranked-early': 4
}

/*
export const valueQuestionProposal = {
  'quadratic-equal': '0x2c77e5bca4464594bfd3ef12bf2addaa212c3e923ad66d9622088fdbb01a0dab',
  'quadratic-early': '0xd3648e44050dcb147932db62ed1bf054ef2bc95ccbb1e27a5ba35353d63ae004',
  'ranked-equal': '0xdc8d626e53854019d1a9554718ca014d3257672c9663e6b2011c8854b137242a',
  'ranked-early': '0xf5249d59e7ab68d7561858a8afa129340825c8a7981be5ee40e766bea6c0a7fa'
}*/
// export const valueQuestionProposal = {
//   'quadratic-equal': '0x0ff971549a05dd03c3a855df0142a231cf9eb552fbfa16a9ade73f5572df12ea',
//   'quadratic-early': '0x7286aafad646b2c521381ab81e4ccc6d0af76a99140eccad4e6d5ea2a33e915d',
//   'ranked-equal': '0xc588d341025d1d0530b53db850c0680d236181640513711dabad0a128d228cce',
//   'ranked-early': '0x5f6842320c7a5303a6cf6265aa77518af9172362a26a525f53ebd47174178f34'
// }

export const snapshotSpaces = {
  'quadratic-equal': 'qe.inclusiveai.eth',
  'quadratic-early': 'qa.inclusiveai.eth',
  'ranked-equal': 're.inclusiveai.eth',
  'ranked-early': 'ra.inclusiveai.eth'
}

export async function initialize() {
  // await AppDataSource.initialize()

  console.log('... initializing ...')

  // only users registered after this timestamp will be considered for all actions below
  //const considerUsersAfterDate = new Date('2023-09-23T12:00:00.000Z')
  //const considerUsersAfterDate = new Date('2023-10-05T10:00:00.000Z')
  const considerUsersAfterDate = new Date('2023-10-07T00:00:00.000Z')

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
    //order: { createdAt: 'DESC' },
    order: { createdAt: 'ASC' },
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
    if (!user.pod) continue;
    const tokenType = user.pod.slug.startsWith('quadratic') ? 'quadratic' : 'rank'
    const tokenEarlyWeight = user.pod.slug.endsWith('early')

    let tokenAmount = 100 // default, no decimal exponentiation
    if (tokenEarlyWeight) {
      tokenAmount = user.votingEarly ? 400 : 25
    }
    console.log(user.address, user.votingEarly, tokenAmount)

    await assignVotePowerToUser(user, tokenType, tokenAmount)
  }

  // Wait 15 seconds for snanpshot backend to sync with latest block
  // so that the proposals created below include the airdropped tokens voting power
  await new Promise((resolve) => setTimeout(resolve, 10_000))

  console.log('done mint')

  //
  // Create Proposals
  //

  await createProposals()

  // Wait 10 seconds for snanpshot backend to process proposals
  // await new Promise((resolve) => setTimeout(resolve, 10_000))
  console.log('done')
}
