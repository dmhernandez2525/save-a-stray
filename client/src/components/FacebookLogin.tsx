import { gql, useMutation } from '@apollo/client'
import { useCallback, useEffect, useMemo } from 'react'
import type { JSX, MouseEvent } from 'react'

import { Button } from './ui/button'

interface FacebookSignInResponse {
  facebookSignIn: {
    session?: {
      token: string
    } | null
    user?: {
      id: string
      email: string
      name: string
    } | null
  }
}

interface FacebookSignInVariables {
  code: string
}

const FACEBOOK_SIGN_IN = gql`
  mutation facebookSignIn($code: String!) {
    facebookSignIn(code: $code) {
      user {
        id
        email
        name
      }
      session {
        token
      }
    }
  }
`

function FacebookSignIn(): JSX.Element {
  const [facebookSignIn, { loading }] = useMutation<
    FacebookSignInResponse,
    FacebookSignInVariables
  >(FACEBOOK_SIGN_IN)

  const code = useMemo(() => {
    if (window.location.pathname !== '/') {
      return null
    }

    const params = new URLSearchParams(window.location.search)
    return params.get('code')
  }, [])

  useEffect(() => {
    if (!code) {
      return
    }

    const signInWithFacebook = async (): Promise<void> => {
      try {
        const response = await facebookSignIn({
          variables: { code },
        })

        const receivedToken = response.data?.facebookSignIn?.session?.token

        if (!receivedToken) {
          localStorage.removeItem('auth-token')
          return
        }

        localStorage.setItem('auth-token', receivedToken)
        window.location.replace('/')
      } catch {
        localStorage.removeItem('auth-token')
      }
    }

    void signInWithFacebook()
  }, [code, facebookSignIn])

  const onFacebookLogin = useCallback((event: MouseEvent<HTMLAnchorElement>): void => {
    event.preventDefault()
    window.location.href = '/facebooklogin'
  }, [])

  return (
    <Button
      asChild
      variant='default'
      className='w-full bg-[rgb(66,103,178)] hover:bg-[rgb(124,152,207)]'
    >
      <a href='/facebooklogin' onClick={onFacebookLogin}>
        {loading ? <span className='mr-2 animate-spin'>...</span> : <span className='mr-2'>f</span>}
        Sign in with Facebook
      </a>
    </Button>
  )
}

export default FacebookSignIn
