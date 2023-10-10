import { ApolloClient, HttpLink, InMemoryCache, gql } from '@apollo/client/core' // need to import from `core` to avoid import React
import { loadErrorMessages, loadDevMessages } from '@apollo/client/dev'
import fetch from 'cross-fetch'

import { envVars } from '@/config'
import { SnapshotProposal } from '@/types'

const apolloClient = new ApolloClient({
  // need to use `cross-fetch` because default `fetch` is not available in node.js
  link: new HttpLink({ uri: 'https://hub.snapshot.org/graphql', fetch }),
  cache: new InMemoryCache()
})

export async function getSnapshotProposal(proposalId: string): Promise<SnapshotProposal> {
  if (envVars.NODE_ENV === 'local') {
    loadDevMessages()
    loadErrorMessages()
  }

  const { data } = await apolloClient.query<{ proposal: SnapshotProposal }>({
    query: gql`
      query Proposal($id: String!) {
        proposal(id: $id) {
          id
          title
          type
          symbol
          body
          choices
          created
          start
          end
          snapshot
          state
          author
          space {
            id
            name
          }
          votes
          quorum
          scores
          scores_state
          scores_total
          scores_updated
        }
      }
    `,
    variables: {
      id: proposalId
    }
  })

  return data.proposal
}
