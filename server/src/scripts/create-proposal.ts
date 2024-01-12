import { JsonRpcProvider } from '@ethersproject/providers'
import { Wallet } from '@ethersproject/wallet'
import snapshot from '@snapshot-labs/snapshot.js'
import type { ProposalType } from '@snapshot-labs/snapshot.js/dist/sign/types'

import { envVars } from '@/config'
import { snapshotSpaces, valueQuestionIds } from '@/scripts/initialize'
import { assignSnapshotProposal } from '@/utils'

const snapshotHub = 'https://hub.snapshot.org' // testnet: https://testnet.snapshot.org

export interface CreateProposalParams {
  space: string
  type: ProposalType
  title: string
  body: string
  discussion: string
  choices: string[]
  start: number
  end: number
}

export async function createProposal({
  space,
  type,
  title,
  body,
  discussion,
  choices,
  start,
  end
}: CreateProposalParams) {
  const snapshotClient = new snapshot.Client712(snapshotHub)

  const provider = new JsonRpcProvider(envVars.OPTIMISM_RPC_URL)
  const deployerSigner = new Wallet(envVars.TOKEN_DEPLOYER_PRIVATE_KEY, provider)
  const signerAddr = await deployerSigner.getAddress()

  // Make sure that the 'Strategies' is set to "Arbitrum One" because the chain has
  // more blocks than "Optimism", so the snapshot server gets tricked into creating
  // a proposal with snapshot value in the future Optimism block (which is still the
  // the past in Arbitrum One).
  //
  // Then, MAKE SURE to change it back to "Optimism" before deploying to production.
  // const snapshotBlock = isTest ? blockHeight + 5_000_000 : blockHeight

  const receipt = (await snapshotClient.proposal(deployerSigner, signerAddr, {
    space,
    type,
    title,
    body,
    discussion,
    choices,
    start,
    end,
    snapshot: await provider.getBlockNumber(),
    // network: 10,
    plugins: JSON.stringify({}),
    app: 'inclusive-ai' // provide the name of your project which is using this snapshot.js integration
  })) as { id: string; ipfs: string; relayer: { address: string; receipit: string } }

  return receipt.id
}

export async function createProposals() {
  console.log('...creating proposals...')

  const proposalIds = {}

  const proms = Object.keys(valueQuestionIds).map(async (podSlug) => {
    console.log(`>>> ${podSlug}`)
    const startTimestamp = Math.floor(Date.now() / 1000)
    const endTimestamp = startTimestamp + 60 * 60 * 24 * 3 // 3 day

    // const proposal = valueQuestionProposal[podSlug]

    console.log('... creating proposal ...')

    const proposalId = await createProposal({
      space: snapshotSpaces[podSlug],
      type: podSlug.startsWith('quadratic') ? 'quadratic' : 'weighted',
      title: 'How should AI models balance between diverse or homogeneous outputs?',
      body: `**Objective**: To improve AI models such as, Midjourney and DALL-E that automatically generate images based on user requests, we want to find ways to make these AI models generate high-quality content without potential biases.
      \n
      **Example Context**:
      Imagine you asked an AI system to generate an image using a simple prompt like "CEO" or "nurse." Sometimes, the AI might not offer a wide range of different images or generate content that you prefer. We want to improve this. 
      \n
      **Please vote on how to update the AI model**:
      1. **Use the current model as is**: This means that the AI will continue to generate images the way it does now.
      2. **Use additional user information**: This means that the AI will use additional user information (e.g., the demographics of the user who’s making the request) to generate a more diverse range of images.
      3. **Track and apply user preferences**: Here, the AI will keep track of user preferences as they use the AI system (e.g., which one of the generated images they prefer given a specific request).  The AI will use these preferences to generate a wider variety of images.
      4. **Add specific flags or tags in the requests**: This allows users to add specific flags (e.g., excluding any additional objects in the generated images) or tags (e.g., different art styles) to their requests, guiding the AI to either personalize the results or offer a broader range of images.
      `,
      discussion: '',
      choices: [
        'Use the current model as is',
        'Use additional user information',
        'Track and apply user preferences',
        'Add specific flags/tags in requests'
      ],
      start: startTimestamp,
      end: endTimestamp
    })

    proposalIds[podSlug] = proposalId

    console.log(`<<< created proposal ${proposalId} for ${podSlug}`)
  })

  await Promise.all(proms)
  // Wait 3 seconds for snanpshot backend to process
  await new Promise((resolve) => setTimeout(resolve, 3000))

  // Assign proposal IDs to each value question
  const promsAssign = Object.keys(valueQuestionIds).map(async (podSlug) => {
    const id = valueQuestionIds[podSlug]
    const proposal = proposalIds[podSlug]

    if (!proposal) return

    try {
      await assignSnapshotProposal(id, proposal)
    } catch (err) {
      console.log(err)
    }
  })

  await Promise.all(promsAssign)
}
