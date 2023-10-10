// import { JsonRpcProvider } from '@ethersproject/providers'
// import { Wallet } from '@ethersproject/wallet'
// import snapshot from '@snapshot-labs/snapshot.js'

// import { envVars } from '@/config'

// const snapshotHub = 'https://hub.snapshot.org' // testnet: https://testnet.snapshot.org

// async function createProposal() {
//   const snapshotClient = new snapshot.Client712(snapshotHub)

//   const provider = new JsonRpcProvider(envVars.OPTIMISM_RPC_URL)
//   const deployerSigner = new Wallet(envVars.DOMAIN_OWNER_PRIVATE_KEY, provider)
//   const signerAddr = await deployerSigner.getAddress()

//   const receipt = await snapshotClient.space(deployerSigner, signerAddr, {
//     space: 'qe.inclusiveai.eth',
//     settings: JSON.stringify({
//       name: 'Inclusive AI - Pod 1',
//       network: '10',
//       symbol: 'INCLQ',
//       private: true,
//       admins: ['0x5ff62b12af8ff7198e1822fe8cf007b0fe0623cd', '0x83c91e282e28d54d2b1aafdcfa0a9d8a7b0c55b2'],
//       moderators: [],
//       members: [],
//       categories: ['social'],
//       plugins: {},
//       children: [],
//       voting: { hideAbstain: false },
//       strategies: [
//         {
//           name: 'erc20-balance-of',
//           network: '10',
//           params: {
//             symbol: 'INCLQ',
//             address: '0x4dAE977efb94843837E932cedCB689E338288e6e',
//             network: '10',
//             decimals: 18
//           }
//         }
//       ],
//       validation: { name: 'any', params: {} },
//       voteValidation: { name: 'any', params: {} },
//       filters: { minScore: 0, onlyMembers: true },
//       treasuries: []
//     })
//   })

//   console.log(receipt)
// }

// createProposal()
//   .catch(console.error)
//   .finally(() => process.exit())
