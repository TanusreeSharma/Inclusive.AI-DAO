import { AsyncParser } from '@json2csv/node'
import { exec } from 'child_process'
import * as fs from 'node:fs'
import * as path from 'node:path'
import { MoreThan } from 'typeorm'

import AppDataSource from '@/database/data-source'
import * as ents from '@/database/entity'
import { sha256 } from '@/utils'

export async function exportData() {
  // export data of all users
  // const users = await ents.User.find({ relations: ['profile', 'pod', 'pod.valueQuestion'] })
  // const users = await ents.User.find({ relations: ['profile'] })
  await AppDataSource.initialize()

  // const considerDataAfterDate = new Date('2023-09-01T12:00:00.000Z')
  const considerDataAfterDate = new Date('2023-10-07T00:00:00.000Z')

  const users = await ents.User.find({
    // relations: ['profile', 'pod'],
    relations: ['pod'],
    where: { createdAt: MoreThan(considerDataAfterDate) }
  })
  const surveys = await ents.Survey.find({ relations: ['user'], where: { createdAt: MoreThan(considerDataAfterDate) } })
  const chats = await ents.Chat.find({
    relations: ['user', 'aiResponse'],
    where: { createdAt: MoreThan(considerDataAfterDate) }
  })
  const pods = await ents.Pod.find({ relations: ['valueQuestion'] })
  // const aiResponses = await ents.AiResponse.find()

  // console.log(chats)
  // console.log(aiResponses)
  const usersMap = new Map<string, ents.User>()
  const podsMap = new Map<number, ents.Pod>()

  for (const user of users) {
    usersMap.set(user.id, user)
  }
  // console.log(usersMap)

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

  const dataPath = path.join(gitRootPath, 'server', 'exported-data')
  // const fdChat = await fs.open(path.join(dataPath, 'chats.csv'), 'rw')
  const fileStreamChatAi = fs.createWriteStream(path.join(dataPath, 'chats-ai.csv'))
  const fileStreamChatDiscuss = fs.createWriteStream(path.join(dataPath, 'chats-discuss.csv'))
  const fileStreamChatVote = fs.createWriteStream(path.join(dataPath, 'chats-vote.csv'))
  const fileStreamUser = fs.createWriteStream(path.join(dataPath, 'users.csv'))
  const fileStreamSurvey = fs.createWriteStream(path.join(dataPath, 'surveys.csv'))

  const fieldUsers = [
    'id',
    'name',
    'createdAt',
    'pod',
    // profile
    // 'ageRange',
    // 'genderIdentity',
    // 'genderIdentityOther',
    // 'ethnicBackground',
    // 'ethnicBackgroundOther',
    // 'countryResideIn',
    // 'isEnrolledInEducation',
    // 'highestLevelEducation',
    // 'employmentStatus',
    // 'employmentStatusOther',
    // 'deviceUsageFrequency',
    // 'householdIncome',
    // 'primaryLanguage',
    // 'primaryLanguageOther',
    // 'studyHear'
  ]

  const podUsers = new Map<string, string>()

  const usersCleaned = users.map((user) => {
    podUsers.set(user.id, user.pod.slug)

    return {
      id: user.id,
      name: user.name,
      createdAt: user.createdAt,
      pod: user.pod?.id || null,
      // ageRange: user.profile.ageRange,
      // genderIdentity: user.profile.genderIdentity,
      // genderIdentityOther: user.profile.genderIdentityOther,
      // ethnicBackground: user.profile.ethnicBackground,
      // ethnicBackgroundOther: user.profile.ethnicBackgroundOther,
      // countryResideIn: user.profile.countryResideIn,
      // isEnrolledInEducation: user.profile.isEnrolledInEducation,
      // highestLevelEducation: user.profile.highestLevelEducation,
      // employmentStatus: user.profile.employmentStatus,
      // employmentStatusOther: user.profile.employmentStatusOther,
      // deviceUsageFrequency: user.profile.deviceUsageFrequency,
      // householdIncome: user.profile.householdIncome,
      // primaryLanguage: user.profile.primaryLanguage,
      // primaryLanguageOther: user.profile.primaryLanguageOther,
      // studyHear: user.profile.studyHear
    }
  })

  const fieldSurveys = [
    'id',
    'user',
    'pod',
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
  const surveysCleaned = surveys.map((survey) => ({
    id: survey.id,
    user: survey.user.id,
    pod: podUsers.get(survey.user.id),
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
  const fieldChats = ['id', 'user', 'text', 'aiResponse', 'createdAt', 'connection']

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

  const parserChats = new AsyncParser({ fields: fieldChats })
  const parserUsers = new AsyncParser({ fields: fieldUsers })
  const parserSurveys = new AsyncParser({ fields: fieldSurveys })

  const pipeChatsAi = parserChats.parse(chatsAi).pipe(fileStreamChatAi)
  const pipeChatsDiscuss = parserChats.parse(chatsDiscuss).pipe(fileStreamChatDiscuss)
  const pipeChatsVote = parserChats.parse(chatsVote).pipe(fileStreamChatVote)
  const pipeUsers = parserUsers.parse(usersCleaned).pipe(fileStreamUser)
  const pipeSurveys = parserSurveys.parse(surveysCleaned).pipe(fileStreamSurvey)

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

  await Promise.all([pipePromChatsAi, pipePromChatsDiscuss, pipePromChatsVote, pipePromUsers, pipePromSurveys])

  // const csvChats = await parserChats.parse(chatsCleaned).promise()
  // await new Promise<any>((resolve, reject) => {
  //   fileStreamChat.write(csvChats, (err) => {
  //     if (err) {
  //       reject(err)
  //     } else {
  //       resolve(true)
  //     }
  //   })
  // })

  // console.log(users)
  // console.log(profiles)
}

exportData()
  .catch((err) => console.log(err))
  .finally(() => {
    process.exit()
  })
