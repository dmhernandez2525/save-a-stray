import React from 'react'
import { createRoot } from 'react-dom/client'
import {
  ApolloClient,
  ApolloLink,
  ApolloProvider,
  InMemoryCache,
  createHttpLink,
  makeVar,
} from '@apollo/client'
import { onError } from '@apollo/client/link/error'

import App from './components/App'
import Mutations from './graphql/mutations'
import { getApiUrl } from './config/env'
import { registerServiceWorker, captureInstallPrompt } from './lib/pwa'
import { initPwaAnalytics } from './lib/pwa-analytics'
import './index.css'

const { VERIFY_USER } = Mutations
const token = localStorage.getItem('auth-token')

export const isLoggedInVar = makeVar(Boolean(token))
export const userIdVar = makeVar('')

const cache = new InMemoryCache({
  typePolicies: {
    Query: {
      fields: {
        isLoggedIn: {
          read() {
            return isLoggedInVar()
          },
        },
        userId: {
          read() {
            return userIdVar()
          },
        },
      },
    },
  },
})

const httpLink = createHttpLink({
  uri: getApiUrl(),
  headers: {
    authorization: localStorage.getItem('auth-token') || '',
  },
})

const errorLink = onError(({ graphQLErrors }) => {
  const hasUnauthorizedError = graphQLErrors?.some((error) =>
    error.message.toLowerCase().includes('unauthorized'),
  )

  if (hasUnauthorizedError) {
    isLoggedInVar(false)
    userIdVar('')
    localStorage.removeItem('auth-token')
  }
})

const client = new ApolloClient({
  link: ApolloLink.from([errorLink, httpLink]),
  cache,
})

const verifyUser = async (): Promise<void> => {
  if (!token) {
    return
  }

  try {
    const { data } = await client.mutate({
      mutation: VERIFY_USER,
      variables: { token },
    })

    isLoggedInVar(Boolean(data?.verifyUser?.loggedIn))
    userIdVar(data?.verifyUser?._id ?? '')
  } catch {
    isLoggedInVar(false)
    userIdVar('')
    localStorage.removeItem('auth-token')
  }
}

const Root = (): React.JSX.Element => {
  return (
    <ApolloProvider client={client}>
      <App />
    </ApolloProvider>
  )
}

const container = document.getElementById('root')

if (!container) {
  throw new Error('Root element with id "root" was not found')
}

const root = createRoot(container)

registerServiceWorker()
captureInstallPrompt()
initPwaAnalytics()

verifyUser().then(() => {
  root.render(<Root />)
})
