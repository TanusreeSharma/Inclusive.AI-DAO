import { AsyncParser } from '@json2csv/node'
import { exec } from 'child_process'
import { ethers } from 'ethers'
import * as fs from 'node:fs'
import * as path from 'node:path'
import { MoreThan } from 'typeorm'

import { TOKEN_ADDR_INCLQ, TOKEN_ADDR_INCLR, envVars } from '@/config'
import AppDataSource from '@/database/data-source'
import { User } from '@/database/entity'
import erc20MintableAbi from '@/data/erc20-mintable-abi'

const provider = new ethers.JsonRpcProvider(envVars.OPTIMISM_RPC_URL)
const deployerSigner = new ethers.Wallet(envVars.TOKEN_DEPLOYER_PRIVATE_KEY, provider)

export async function hasUserReceivedTokens(userAddr: string, type: 'quadratic' | 'rank') {
  if (!ethers.isAddress(userAddr)) throw new Error('Invalid address')

  const token = new ethers.Contract(
    type === 'quadratic' ? TOKEN_ADDR_INCLQ : TOKEN_ADDR_INCLR,
    erc20MintableAbi,
    deployerSigner
  )

  const userBalance = (await token.balanceOf(userAddr)) as BigInt
  // console.log(userAddr, userBalance)

  return userBalance.valueOf() > 0
}

async function selectNewUsers() {
  await AppDataSource.initialize()

  // select ("snapshotStartDate" - INTERVAL '10 Minutes') AT TIME ZONE 'UTC' from "value_question" where "id" = 1;
  // const softConsiderUsersAfterDate = new Date('2023-10-09T08:58:52.000Z')
  // const users = await User.find({ where: { createdAt: MoreThan(softConsiderUsersAfterDate) }, relations: ['pod'] })

  const softConsiderUsersAfterDate = new Date('2023-10-09T00:00:00.000Z')

  const usersRaw = await User.find({
    where: { votingTokenReceivedBlockNumber: null, createdAt: MoreThan(softConsiderUsersAfterDate) },
    relations: ['pod']
  })

  const usersFilter = await Promise.all(
    usersRaw.map(async (user) => {
      const hasReceivedTokens = await hasUserReceivedTokens(
        user.address,
        user.pod.slug.includes('quadratic') ? 'quadratic' : 'rank'
      )
      return {
        value: user,
        include: !hasReceivedTokens && !['contact@parkjongwon.com', 'jwpark0882@gmail.com', 'jwp6@illinois.edu'].includes(user.id)
      }
    })
  )

  const users = usersFilter.filter((user) => user.include).map((user) => user.value)

  console.log('============================================')
  console.log(`New User Count: ${users.length}`)
  console.log('============================================')

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
  const fileStreamUsers = fs.createWriteStream(path.join(dataPath, 'new-users.csv'))

  const parsedUsers = users.map((user) => ({
    id: user.id,
    address: user.address,
    createdAt: user.createdAt,
    pod: user.pod.slug
  }))

  const parserUsers = new AsyncParser({
    fields: ['id', 'address', 'createdAt', 'pod']
  })
  const pipeUsers = parserUsers.parse(parsedUsers).pipe(fileStreamUsers)

  await new Promise((resolve, reject) => {
    pipeUsers.on('finish', () => resolve(true))
    pipeUsers.on('error', (err) => reject(err))
  })
}

selectNewUsers()
  .then(() => {
    console.log('Done')
    process.exit(0)
  })
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
