import React, { useEffect } from 'react'
import { useApi } from '../api/ApiContext'

const Login = () => {
  const { loginWithRedirect } = useApi()

  useEffect(() => {
    // Use window.location.search to access query parameters
    const query = new URLSearchParams(window.location.search)
    const invitation = query.get('invitation')
    const organization = query.get('organization')

    // Prepare options for loginWithRedirect
    const options = {}

    if (invitation && organization) {
      options.invitation = invitation
      options.organization = organization
    }

    loginWithRedirect(options)
  }, [loginWithRedirect])

  return null // Optionally, return a loading spinner or message
};

export default Login
