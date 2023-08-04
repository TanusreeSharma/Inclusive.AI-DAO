import { useContext } from 'react'

import { AuthProviderContext } from '@/components/Providers/Web3AuthProvider'

export default () => useContext(AuthProviderContext)
