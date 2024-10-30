import React, { useEffect } from 'react'
import { useAuth0 } from '@auth0/auth0-react'

const Login = () => {
  const { loginWithRedirect } = useAuth0()

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
