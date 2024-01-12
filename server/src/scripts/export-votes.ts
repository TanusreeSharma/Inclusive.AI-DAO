import { AsyncParser } from '@json2csv/node'
import axios from 'axios'
import { exec } from 'child_process'
import * as fs from 'node:fs'
import * as path from 'node:path'
import { MoreThan } from 'typeorm'

import AppDataSource from '@/database/data-source'
import * as ents from '@/database/entity'

const valueQuestionIds = {
  'quadratic-equal': 1,
  'quadratic-early': 2,
  'ranked-equal': 3,
  'ranked-early': 4
}

async function fetchUserVoteChoices(proposalId: string, userAddresses: string[]): Promise<any> {
  const query = `
    query Votes($proposalId: String!, $userAddresses: [String!]!) {
      votes(where: {proposal: $proposalId, voter_in: $userAddresses}) {
        voter
        choice
      }
    }
  `

  try {
    const response = await axios.post('https://hub.snapshot.org/graphql', {
      query,
      variables: {
        proposalId,
        userAddresses
      }
    })
    return response.data.data.votes
  } catch (error) {
    console.error('Error fetching vote choices:', error)
    throw error
  }
}

export async function exportVotes() {
  // export data of all users
  // const users = await ents.User.find({ relations: ['profile', 'pod', 'pod.valueQuestion'] })
  // const users = await ents.User.find({ relations: ['profile'] })
  await AppDataSource.initialize()

  // const considerDataAfterDate = new Date('2023-09-01T12:00:00.000Z')
  const considerDataAfterDate = new Date('2023-09-03T12:00:00.000Z')

  // Proposal IDs fetched from database is the latest proposal ID, but sometimes we want to fetch
  // the vote choice results of previous proposals. In that case, we manually specify the proposal
  // ID and override
  const overrideProposalIds = {
    // 'quadratic-equal': ['0x58a18467f467c139888697b2c4e10357dcc08beb4d072b3bbd6c3043ab13a042'],
    // 'quadratic-early': ['0xfe863c7dc512ee02b6a0b6914df706bc968b8ce6d4ceb11ca0c824c780797c40'],
    // 'ranked-equal': ['0xb57deed43ed49a0e93e9c25b5989ab441500ff584458da6939292a6160c56ff1'],
    // 'ranked-early': ['0x73057e3018aa196a713795d8787a33586a18915e7748f9b4f773648b2d69f7d3']
  }

  const users = await ents.User.find({
    relations: ['pod'],
    where: { createdAt: MoreThan(considerDataAfterDate) }
  })
  const userAddressToId = users.reduce((acc, user) => {
    acc.set(user.address, user.id)
    return acc
  }, new Map<string, string>())

  const valueQuestions = await ents.ValueQuestion.find({ relations: ['pod'] }).then((valueQuestions) => {
    const valueQuestionMap = new Map<string, ents.ValueQuestion>()
    valueQuestions.forEach((valueQuestion) => {
      valueQuestionMap.set(valueQuestion.pod.slug, valueQuestion)
    })
    return valueQuestionMap
  })

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

  const dataPath = path.join(gitRootPath, 'server', 'exported-data')
  // const fdChat = await fs.open(path.join(dataPath, 'chats.csv'), 'rw')
  const fileStreamVotes = fs.createWriteStream(path.join(dataPath, 'votes.csv'))

  // aggregate user addresses into their respective pods
  const podUserAddresses = users.reduce((acc, user) => {
    if (!user.pod) return acc
    const podSlug = user.pod.slug
    if (!acc.has(podSlug)) acc.set(podSlug, [])
    acc.get(podSlug).push(user.address)
    return acc
  }, new Map<string, string[]>())

  const snapshotProposalIds = Object.keys(valueQuestionIds).reduce((acc, podSlug) => {
    if (!acc.has(podSlug)) acc.set(podSlug, [])
    const { snapshotId } = valueQuestions.get(podSlug)
    acc.get(podSlug).push(snapshotId)
    return acc
  }, new Map<string, string[]>())

  const voteChoices = new Map<string, { voter: string; choice: { [key: string]: number } }[]>()

  for (const [podSlug, userAddresses] of podUserAddresses.entries()) {
    // TODO: handle multiple proposals per pod
    let snapshotProposalId = snapshotProposalIds.get(podSlug)[0]
    if (overrideProposalIds[podSlug] && overrideProposalIds[podSlug].length > 0)
      snapshotProposalId = overrideProposalIds[podSlug][0]

    if (!userAddresses || !userAddresses.length || !snapshotProposalId)
      throw new Error('Missing user addresses or snapshot proposal ID')

    const proposalVoteChoices = await fetchUserVoteChoices(snapshotProposalId, userAddresses)
    console.log(proposalVoteChoices)

    voteChoices.set(podSlug, proposalVoteChoices)
  }

  const parsedVoteChoices = Array.from(voteChoices.entries())
    .map(([podSlug, voteChoices]) => {
      const valueQuestionId = valueQuestionIds[podSlug]
      return voteChoices.map((voteChoice) => {
        const choice_1 = voteChoice.choice['1'] || 0
        const choice_2 = voteChoice.choice['2'] || 0
        const choice_3 = voteChoice.choice['3'] || 0
        const choice_4 = voteChoice.choice['4'] || 0
        return {
          user: userAddressToId.get(voteChoice.voter) || 'unknown',
          address: voteChoice.voter,
          pod: podSlug,
          proposal: valueQuestionId,
          votes_given: choice_1 + choice_2 + choice_3 + choice_4,
          // snapshot is 1 indexed
          choice_1,
          choice_2,
          choice_3,
          choice_4
        }
      })
    })
    .flat()

  const parserVotes = new AsyncParser({
    fields: ['user', 'address', 'pod', 'proposal', 'votes_given', 'choice_1', 'choice_2', 'choice_3', 'choice_4']
  })
  const pipeVotes = parserVotes.parse(parsedVoteChoices).pipe(fileStreamVotes)

  await new Promise((resolve, reject) => {
    pipeVotes.on('finish', () => resolve(true))
    pipeVotes.on('error', (err) => reject(err))
  })

  console.log(`Votes counted: ${parsedVoteChoices.length}`)
}

exportVotes()
  .catch((err) => console.log(err))
  .finally(() => {
    process.exit()
  })
