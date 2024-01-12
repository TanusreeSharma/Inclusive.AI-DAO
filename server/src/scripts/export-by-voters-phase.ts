import { AsyncParser } from '@json2csv/node'
import axios from 'axios'
import { exec } from 'child_process'
import * as fs from 'node:fs'
import * as path from 'node:path'
import { In, MoreThan } from 'typeorm'

import AppDataSource from '@/database/data-source'
import * as ents from '@/database/entity'
import { sha256 } from '@/utils'

const podSlugs = ['quadratic-equal', 'quadratic-early', 'ranked-equal', 'ranked-early'] as const

type PodSlug = (typeof podSlugs)[number]
type VotePhase = 'pilots' | 'round-1' | 'round-2' | 'round-3'
type PodSlugVotePhaseVote = Record<VotePhase, Array<{ voter: string; choice: Record<string, number> }>>

const PROPOSALS_BY_VOTE_PHASE: Record<PodSlug, Record<VotePhase, string | string[]>> = {
  'quadratic-equal': {
    pilots: [
      '0x8e8c90b51b52ef693d004e343aa61fde6108963af0a4fda34f8fa71dd3fe98c2',
      '0x81e69de9507423d28ca2436ca77c23584b89aa80920d5f76e291048adfada6ac',
      '0xe017eb1ed02d881326093405aa6754a779c13742272be27c1b1a7387d6653b6a',
      '0x58a18467f467c139888697b2c4e10357dcc08beb4d072b3bbd6c3043ab13a042'
    ],
    'round-1': '0xd1980ad884df3c3a36e2b912abf018de498de7907f33c114186d10277f409331',
    'round-2': '0x67fac093ebfc6d3bb4a6d98b9c91276740e53fe4b492f7ef20206d4c5b455b16',
    'round-3': '0x2dc02b35a88e6b03e4a630613288cdfa6e57730aca06385f08247245486ab81b'
  },
  'quadratic-early': {
    pilots: [
      '0x2c065bc04cbf84a68a83ab9fbcf480d8bdaee611a7793596f9cbc4977ea18a7f',
      '0x7a097b84942f2281369d7e295fa01decfdc6eb4a4c79684e92f8be841e51a72d',
      '0xfe863c7dc512ee02b6a0b6914df706bc968b8ce6d4ceb11ca0c824c780797c40'
    ],
    'round-1': '0xb760ae00bce031b38c42470df6189574ee924a742eb2445ac75daa56b3bf1936',
    'round-2': '0xddcb80e4aa19e00863ffb3a0b15af5d4f131879bbd0bc3fd097a6dc8c780866b',
    'round-3': '0x24782cdc0641a6f3690e5d96f87bf8178017042fead4d6cb13e0cbee539d88b7'
  },
  'ranked-equal': {
    pilots: [
      '0x99588270eeab71b95b4695dbaecc67cef36529f29df984c9532a2090290b6fa4',
      '0x608dab6a2d7a7a38d381b25c04c54d82d4d49225e6ce76fcbd8ca9b44f32fd2c',
      '0xb57deed43ed49a0e93e9c25b5989ab441500ff584458da6939292a6160c56ff1'
    ],
    'round-1': '0x5d987a5fe2c18bad2981f817b367e6d015d9895e10ff2816213a2bca8b4f122a',
    'round-2': '0x91248f5f8d00aae02a1824aeb08da9ee4f3d30d14d5ed530791c2dd741a7fae1',
    'round-3': '0x277a9d0abb9e8c8594e2be5417ed1cf06dae8fd89c6e75ff814963a014d040cd'
  },
  'ranked-early': {
    pilots: [
      '0xd17eacb2ae1902b4f44036c9694a293974e4aca1fc26b71f9cc30c9170a48e31',
      '0x73057e3018aa196a713795d8787a33586a18915e7748f9b4f773648b2d69f7d3'
    ],
    'round-1': '0xe6b7741a2ff9b99700cba174e480bd1405adc7b79e4eb1c6c003fa4ff6015b96',
    'round-2': '0x69825a2e0c1375c4dd1501a076a3c16bf9b3a90dfda064b13c949e15c235562a',
    'round-3': '0xfdc4122feb8d19aded209aa35284a420ac7aa13e61843cf0ebb96e7baa19e198'
  }
}

const PROPOSAL_IDS_BY_VOTE_PHASE = Object.entries(PROPOSALS_BY_VOTE_PHASE).reduce(
  (acc, [podSlug, proposalIds]) => {
    Object.entries(proposalIds).forEach(([votePhase, proposalId]) => {
      if (Array.isArray(proposalId)) {
        proposalId.forEach((id) => {
          acc[id] = { podSlug: podSlug as PodSlug, votePhase: votePhase as VotePhase }
        })
      } else {
        acc[proposalId] = { podSlug: podSlug as PodSlug, votePhase: votePhase as VotePhase }
      }
    })
    return acc
  },
  {} as Record<string, { podSlug: PodSlug; votePhase: VotePhase }>
)

// const ALL_PROPOSAL_IDS = Object.values(PROPOSAL_IDS_BY_VOTE_PHASE).reduce((acc, proposalIds) => {
//   Object.keys(proposalIds).forEach((id) => {
//     acc.add(id)
//   })
//   return acc
// }, new Set<string>())

async function fetchPropsalVotes(proposalIds: string | string[]) {
  const query = `
		query Votes($proposalIds: [String!]!) {
			votes(where: {proposal_in: $proposalIds}, first: 500) {
				proposal {
					id
				}
				voter
				choice
			}
		}
	`

  try {
    const response = await axios.post('https://hub.snapshot.org/graphql', {
      query,
      variables: {
        proposalIds: Array.isArray(proposalIds) ? proposalIds : [proposalIds]
      }
    })

    if ('errors' in response.data) {
      throw new Error(response.data.errors)
    }

    return response.data.data.votes as Array<{
      proposal: {
        id: string
      }
      voter: string
      choice: Record<string, number>
    }>
  } catch (error) {
    console.error('Error fetching vote choices:', error)
    throw error
  }
}

export async function exportAllDataByVotersPhase() {
  await AppDataSource.initialize()

  const votesRaw = await fetchPropsalVotes(Object.keys(PROPOSAL_IDS_BY_VOTE_PHASE))
  const votes: Record<PodSlug, PodSlugVotePhaseVote> = {
    'quadratic-equal': {} as PodSlugVotePhaseVote,
    'quadratic-early': {} as PodSlugVotePhaseVote,
    'ranked-equal': {} as PodSlugVotePhaseVote,
    'ranked-early': {} as PodSlugVotePhaseVote
  }
  // const voters: Record<PodSlug, Set<string>> = {
  // 	'quadratic-equal': new Set<string>(),
  // 	'quadratic-early': new Set<string>(),
  // 	'ranked-equal': new Set<string>(),
  // 	'ranked-early': new Set<string>()
  // }
  const votersByPodAndPhase: Record<string, { podSlug: PodSlug; votePhase: VotePhase }> = {}

  votesRaw.forEach((vote) => {
    const {
      proposal: { id: proposalId },
      voter,
      choice
    } = vote
    const { podSlug, votePhase } = PROPOSAL_IDS_BY_VOTE_PHASE[proposalId]
    // console.log(podSlug, votePhase, voter, choice)

    if (!votes[podSlug][votePhase]) votes[podSlug][votePhase] = []
    votes[podSlug][votePhase].push({ voter, choice })

    // voters[podSlug].add(voter)
    votersByPodAndPhase[voter] = { podSlug, votePhase }
  })

  const votersAddrList = Object.keys(votersByPodAndPhase)

  const users = await ents.User.find({
    relations: ['pod'],
    where: { address: In(votersAddrList) }
  })

  const surveys = await ents.Survey.find({ relations: ['user'], where: { user: { address: In(votersAddrList) } } })
  const chats = await ents.Chat.find({
    relations: ['user', 'aiResponse'],
    where: { user: { address: In(votersAddrList) } }
  })
  const pods = await ents.Pod.find({ relations: ['valueQuestion'] })

  const usersMap = new Map<string, ents.User>()
  const podsMap = new Map<number, ents.Pod>()
  // const podUsers = new Map<string, string>()
  const userAddressToId = users.reduce((acc, user) => {
    acc.set(user.address, user.id)
    return acc
  }, new Map<string, string>())

  for (const user of users) {
    usersMap.set(user.id, user)
  }

  for (const pod of pods) {
    podsMap.set(pod.id, pod)
  }

  const gitRootPath = await new Promise<string | Error>((resolve, reject) => {
    exec('git rev-parse --show-toplevel', (err, stdout, stderr) => {
      if (err) {
        reject(err)
      } else {
        resolve(stdout.trim())
      }
    })
  })

  if (gitRootPath instanceof Error) {
    throw gitRootPath
  }

  const dataPath = path.join(gitRootPath, 'server', 'exported-data', 'all')
  const fileStreamChatAi = fs.createWriteStream(path.join(dataPath, 'chats-ai.csv'))
  const fileStreamChatDiscuss = fs.createWriteStream(path.join(dataPath, 'chats-discuss.csv'))
  const fileStreamChatVote = fs.createWriteStream(path.join(dataPath, 'chats-vote.csv'))
  const fileStreamUser = fs.createWriteStream(path.join(dataPath, 'users.csv'))
  const fileStreamSurvey = fs.createWriteStream(path.join(dataPath, 'surveys.csv'))
  const fileStreamVotes = fs.createWriteStream(path.join(dataPath, 'votes.csv'))

  const fieldUsers = ['id', 'name', 'phase', 'createdAt', 'pod']
  const fieldChats = ['id', 'user', 'pod', 'phase', 'text', 'aiResponse', 'createdAt', 'connection']
  const fieldSurveys = [
    'id',
    'user',
    'pod',
    'phase',
    'createdAt',
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
  const fieldVotes = [
    'user',
    'address',
    'pod',
    'phase',
    'proposal',
    'votes_given',
    'choice_1',
    'choice_2',
    'choice_3',
    'choice_4'
  ]

  const usersCleaned = users.map((user) => {
    // podUsers.set(user.id, user.pod.slug)

    return {
      id: user.id,
      name: user.name,
      pod: votersByPodAndPhase[user.address].podSlug,
      phase: votersByPodAndPhase[user.address].votePhase,
      createdAt: user.createdAt
      // pod: user.pod?.id || null
    }
  })

  const surveysCleaned = surveys.map((survey) => ({
    id: survey.id,
    user: survey.user.id,
    pod: votersByPodAndPhase[survey.user.address].podSlug,
    phase: votersByPodAndPhase[survey.user.address].votePhase,
    createdAt: survey.createdAt,
    q1A: survey.q1A,
    q1B: survey.q1B,
    q1C: survey.q1C,
    q1D: survey.q1D,
    q1E: survey.q1E,
    q1F: survey.q1F,
    q1G: survey.q1G,
    q2A: survey.q2A,
    q2B: survey.q2B,
    q2C: survey.q2C,
    q2D: survey.q2D,
    q2E: survey.q2E,
    q2F: survey.q2F,
    q2G: survey.q2G,
    q2H: survey.q2H,
    q2I: survey.q2I,
    q2J: survey.q2J,
    q2K: survey.q2K,
    attention1: survey.attention1
  }))

  const userConnectionSha = new Map<string, { ai: string; discuss: string; vote: string }>()

  const chatsAi = []
  const chatsDiscuss = []
  const chatsVote = []

  for (const chat of chats) {
    // If user was created before the registration start time (MoreThan) but still
    // uses the service, ignore
    const userData = usersMap.get(chat.user.id)
    if (!userData) continue

    // console.log(chat)
    if (!userConnectionSha.has(chat.user.id)) {
      const userPodValueQ = podsMap.get(userData.pod.id).valueQuestion[0]
      // console.log(chat.user.id, userPodValueQ.snapshotId)
      // Note: `+` is intentionally added in sha string
      const connectionAi = sha256(`${chat.user.id}+0`) // ${userPodValueQ.id} (hardcoded to 0 for now)
      const connectionVote = sha256(`${chat.user.id}+${userPodValueQ.snapshotId}+ask`)
      // console.log(userData)
      const connectionDiscuss = sha256(`pod-${userData.pod.id}`)
      // console.log(connectionAi, connectionVote, chat.connection)
      userConnectionSha.set(chat.user.id, { ai: connectionAi, discuss: connectionDiscuss, vote: connectionVote })
    }

    const { ai: connectionAi, discuss: connectionDiscuss, vote: connectionVote } = userConnectionSha.get(chat.user.id)

    const chatCleaned = {
      id: chat.id,
      user: chat.user.id,
      pod: votersByPodAndPhase[chat.user.address].podSlug,
      phase: votersByPodAndPhase[chat.user.address].votePhase,
      text: chat.text,
      aiResponse: chat.aiResponse?.text || null,
      createdAt: chat.createdAt,
      connection: chat.connection
    }

    if (chat.connection === connectionAi) chatsAi.push(chatCleaned)
    else if (chat.connection === connectionDiscuss || chat.connection.startsWith('pod-')) chatsDiscuss.push(chatCleaned)
    else if (chat.connection === connectionVote) chatsVote.push(chatCleaned)
    else {
      // console.log('>> invalid chat connection', chat)
      // console.log('<< ', chat.connection, connectionAi, connectionDiscuss, connectionVote)
      // most likely the value topic's snapshotId changed so sha256 changed
      chatsVote.push(chatCleaned)
    }
  }

  const parsedVoteChoices = Object.keys(votes)
    .map((podSlug) => {
      return Object.keys(votes[podSlug]).map((votePhase) => {
        return (votes[podSlug][votePhase] as Array<{ voter: string; choice: Record<string, number> }>).map(
          (voteChoice) => {
            const choice_1 = voteChoice.choice['1'] || 0
            const choice_2 = voteChoice.choice['2'] || 0
            const choice_3 = voteChoice.choice['3'] || 0
            const choice_4 = voteChoice.choice['4'] || 0
            return {
              user: userAddressToId.get(voteChoice.voter) || 'unknown',
              address: voteChoice.voter,
              pod: podSlug,
              phase: votePhase,
              // proposal: valueQuestionId,
              votes_given: choice_1 + choice_2 + choice_3 + choice_4,
              // snapshot is 1 indexed
              choice_1,
              choice_2,
              choice_3,
              choice_4
            }
          }
        )
      })
    })
    .flat(2)

  const parserChats = new AsyncParser({ fields: fieldChats })
  const parserUsers = new AsyncParser({ fields: fieldUsers })
  const parserSurveys = new AsyncParser({ fields: fieldSurveys })
  const parserVotes = new AsyncParser({ fields: fieldVotes })

  const pipeChatsAi = parserChats.parse(chatsAi).pipe(fileStreamChatAi)
  const pipeChatsDiscuss = parserChats.parse(chatsDiscuss).pipe(fileStreamChatDiscuss)
  const pipeChatsVote = parserChats.parse(chatsVote).pipe(fileStreamChatVote)
  const pipeUsers = parserUsers.parse(usersCleaned).pipe(fileStreamUser)
  const pipeSurveys = parserSurveys.parse(surveysCleaned).pipe(fileStreamSurvey)
  const pipeVotes = parserVotes.parse(parsedVoteChoices).pipe(fileStreamVotes)

  const pipePromChatsAi = new Promise((resolve, reject) => {
    pipeChatsAi.on('finish', () => resolve(true))
    pipeChatsAi.on('error', (err) => reject(err))
  })

  const pipePromChatsDiscuss = new Promise((resolve, reject) => {
    pipeChatsDiscuss.on('finish', () => resolve(true))
    pipeChatsDiscuss.on('error', (err) => reject(err))
  })

  const pipePromChatsVote = new Promise((resolve, reject) => {
    pipeChatsVote.on('finish', () => resolve(true))
    pipeChatsVote.on('error', (err) => reject(err))
  })

  const pipePromUsers = new Promise((resolve, reject) => {
    pipeUsers.on('finish', () => resolve(true))
    pipeUsers.on('error', (err) => reject(err))
  })

  const pipePromSurveys = new Promise((resolve, reject) => {
    pipeSurveys.on('finish', () => resolve(true))
    pipeSurveys.on('error', (err) => reject(err))
  })

  const pipePromVotes = new Promise((resolve, reject) => {
    pipeVotes.on('finish', () => resolve(true))
    pipeVotes.on('error', (err) => reject(err))
  })

  await Promise.all([
    pipePromChatsAi,
    pipePromChatsDiscuss,
    pipePromChatsVote,
    pipePromUsers,
    pipePromSurveys,
    pipePromVotes
  ])

  // logging

  const podSlugPhaseVoters = Object.keys(votersByPodAndPhase).reduce(
    (acc, voter) => {
      const { podSlug, votePhase } = votersByPodAndPhase[voter]
      if (!acc[podSlug][votePhase]) acc[podSlug][votePhase] = new Set<string>()
      acc[podSlug][votePhase].add(voter)
      return acc
    },
    {
      'quadratic-equal': {} as Record<VotePhase, Set<string>>,
      'quadratic-early': {} as Record<VotePhase, Set<string>>,
      'ranked-equal': {} as Record<VotePhase, Set<string>>,
      'ranked-early': {} as Record<VotePhase, Set<string>>
    } as Record<PodSlug, Record<VotePhase, Set<string>>>
  )

  const totalByPhase: Record<VotePhase, number> = {
    pilots: 0,
    'round-1': 0,
    'round-2': 0,
    'round-3': 0
  }

  Object.keys(podSlugPhaseVoters).forEach((podSlug) => {
    console.log(`Pod "${podSlug}" voters`)

    let totalPod = 0
    Object.keys(podSlugPhaseVoters[podSlug])
      .sort()
      .forEach((votePhase) => {
        const size = podSlugPhaseVoters[podSlug][votePhase].size
        totalPod += size
        totalByPhase[votePhase] += size
        console.log(`  "${votePhase}": \t${size}`)
      })
    console.log(`  total: ${totalPod}`)
  })

  console.log('Total voters by phase')
  Object.keys(totalByPhase).forEach((phase) => {
    console.log(`  "${phase}": ${totalByPhase[phase]}`)
  })
  console.log(`  total: ${Object.values(totalByPhase).reduce((acc, size) => acc + size, 0)}`)
}

exportAllDataByVotersPhase()
  .catch((err) => console.log(err))
  .finally(() => {
    process.exit()
  })
