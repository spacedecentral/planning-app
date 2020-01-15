import { useEffect, useState } from 'react'
import { useAragonApi } from '../api-react'
import { useApolloClient } from '../utils/apollo-client'
import { CURRENT_USER } from '../utils/gql-queries'

const useGithubAuth = () => {
  const { appState } = useAragonApi()
  const client = useApolloClient()
  const token = appState.github && appState.github.token

  const [ githubCurrentUser, setGithubCurrentUser ] = useState({})

  useEffect(() => {
    if (!token) return

    client
      .query({ query: CURRENT_USER })
      .then(res => setGithubCurrentUser(res.data.viewer))
  }, [token])

  return githubCurrentUser
}

export default useGithubAuth
