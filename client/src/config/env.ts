const PRODUCTION_GRAPHQL_URL = 'https://save-a-stray-api.onrender.com/graphql'
const LOCAL_GRAPHQL_URL = 'http://localhost:5000/graphql'

const normalizeGraphqlUrl = (value: string): string => {
  const trimmedValue = value.trim()

  if (!trimmedValue) {
    return ''
  }

  const withoutTrailingSlash = trimmedValue.endsWith('/')
    ? trimmedValue.slice(0, -1)
    : trimmedValue

  if (withoutTrailingSlash.endsWith('/graphql')) {
    return withoutTrailingSlash
  }

  return `${withoutTrailingSlash}/graphql`
}

export const isDemoMode = (): boolean => import.meta.env.VITE_DEMO_MODE === 'true'

export const getApiUrl = (): string => {
  const configuredApiUrl = import.meta.env.VITE_API_URL
  const normalizedConfiguredApiUrl = configuredApiUrl
    ? normalizeGraphqlUrl(configuredApiUrl)
    : ''

  if (normalizedConfiguredApiUrl) {
    return normalizedConfiguredApiUrl
  }

  return import.meta.env.PROD ? PRODUCTION_GRAPHQL_URL : LOCAL_GRAPHQL_URL
}

export const config = {
  isDemoMode: isDemoMode(),
  apiUrl: getApiUrl(),
  mode: import.meta.env.MODE,
} as const

export default config
