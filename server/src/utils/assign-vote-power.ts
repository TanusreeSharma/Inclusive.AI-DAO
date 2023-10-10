import { ethers } from 'ethers'

import { TOKEN_ADDR_INCLQ, TOKEN_ADDR_INCLR, envVars } from '@/config'
import { User } from '@/database/entity'
import erc20MintableAbi from '@/data/erc20-mintable-abi'

const provider = new ethers.JsonRpcProvider(envVars.OPTIMISM_RPC_URL)
const deployerSigner = new ethers.Wallet(envVars.TOKEN_DEPLOYER_PRIVATE_KEY, provider)

export async function assignVotePowerToUser(user: User, type: 'quadratic' | 'rank', amount: number) {
  console.log('... assigning vote power ...')

  const userAddr = user.address
  console.log(userAddr, type, amount)

  if (!ethers.isAddress(userAddr)) throw new Error('Invalid address')

  const token = new ethers.Contract(
    type === 'quadratic' ? TOKEN_ADDR_INCLQ : TOKEN_ADDR_INCLR,
    erc20MintableAbi,
    deployerSigner
  )

  // const decimals = (await token.decimals()) as BigInt
  const decimals = 18
  const amountExpo = BigInt(amount) * BigInt(10 ** Number(decimals.valueOf()))

  const userBalance = (await token.balanceOf(userAddr)) as BigInt

  console.log(userBalance.valueOf(), amountExpo.valueOf())
  if (userBalance.valueOf() < amountExpo) {
    const leftover = amountExpo.valueOf() - userBalance.valueOf()
    console.log('... minting tokens ...')
    const tx = (await token.mint(userAddr, leftover)) as ethers.TransactionResponse
    console.log('>>> ', tx.hash)

    // don't wait for receipt
    // const receipt = await tx.wait()
    // console.log(receipt)

    // wait one block
    await new Promise((resolve) => {
      provider.once('block', async (blockNumber) => resolve(blockNumber))
    })

    // TODO: batch save
    user.votingTokenReceivedBlockNumber = await provider.getBlockNumber()
    await user.save()
  }
}
