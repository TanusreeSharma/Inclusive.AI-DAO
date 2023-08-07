import { Magic } from 'magic-sdk'

const target = process.env.NEXT_PUBLIC_WEB3AUTH_TARGET as 'mainnet' | 'testnet'

const GNOSIS_CHAIN_TARGET = {
  mainnet: {
    chainId: 100,
    displayName: 'Gnosis',
    rpcUrl: process.env.NEXT_PUBLIC_GNOSIS_RPC_MAINNET as string,
    blockExplorer: 'https://gnosisscan.io/',
  },
  testnet: {
    chainId: 10200,
    displayName: 'Gnosis Chiado Testnet',
    rpcUrl: process.env.NEXT_PUBLIC_GNOSIS_RPC_TESTNET as string,
    blockExplorer: 'https://gnosis-chiado.blockscout.com/',
  },
}

export const magic = new Magic(process.env.NEXT_PUBLIC_MAGIC_PUBKEY as string, {
  network: {
    rpcUrl: GNOSIS_CHAIN_TARGET[target].rpcUrl,
    chainId: GNOSIS_CHAIN_TARGET[target].chainId,
  },
})
