import { ethers } from 'ethers'
import { MoreThan } from 'typeorm'

import { TOKEN_ADDR_INCLQ, TOKEN_ADDR_INCLR, envVars } from '@/config'
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

export async function selectNewUsers(considerUsersAfterDate?: Date) {
  // select ("snapshotStartDate" - INTERVAL '10 Minutes') AT TIME ZONE 'UTC' from "value_question" where "id" = 1;
  // const softConsiderUsersAfterDate = new Date('2023-10-09T08:58:52.000Z')
  // const users = await User.find({ where: { createdAt: MoreThan(softConsiderUsersAfterDate) }, relations: ['pod'] })

  const softConsiderUsersAfterDate = considerUsersAfterDate ?? new Date('2023-09-10T00:00:00.000Z')

  let usersRaw = await User.find({
    where: { votingTokenReceivedBlockNumber: null, createdAt: MoreThan(softConsiderUsersAfterDate) },
    relations: ['pod']
  })

  usersRaw = usersRaw.filter((user) => !!user.pod && !!user.pod.slug)

  const usersFilter = await Promise.all(
    usersRaw.map(async (user) => {
      const hasReceivedTokens = await hasUserReceivedTokens(
        user.address,
        user.pod.slug.includes('quadratic') ? 'quadratic' : 'rank'
      )
      return {
        value: user,
        include: !hasReceivedTokens && !['contact@parkjongwon.com', 'jwp6@illinois.edu'].includes(user.id)
      }
    })
  )

  return usersFilter.filter((user) => user.include).map((user) => user.value)
}
