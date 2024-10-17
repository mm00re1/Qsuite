import React from 'react'
import { AppBar, Toolbar, Typography, Box } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import MenuDropdown from '../MenuDropdown'
import QsuiteLogo from '../../../assets/qsuite_logo.svg?react'
import { useAuth0 } from "@auth0/auth0-react";


const LoginButton = () => {
  const { loginWithRedirect } = useAuth0();

  return <button style={{ padding: '5px' }} onClick={() => loginWithRedirect()}>Log In</button>;
};

const Header = () => {
  const navigate = useNavigate()
  const { isAuthenticated, logout } = useAuth0()

  const menuItems = [
    {
      name: 'Environment Settings',
      onChange: () => navigate('/settings')
    },
    {
      name: 'Test Groups',
      onChange: () => navigate('/testgroups')
    },
    {
      name: 'Create Test',
      onChange: () => navigate('/addtest')
    },
    /*...(isAuthenticated ? [{
      name: 'Log out',
      onChange: () => logout({ logoutParams: { returnTo: window.location.origin } })
    }] : [])*/
    {
      name: 'Log out',
      onChange: () => logout({ logoutParams: { returnTo: window.location.origin } })
    }
  ];

  const handleTitleClick = () => {
    navigate('/')
  }

  return (
    <AppBar 
      position="fixed" 
      sx={{ 
        bgcolor: '#22023A', 
        padding: '5px 20px',
        width: '100%',
        left: 0,
        right: 0,
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between', padding: '0 !important' }}>
        <Box sx={{ flex: 1, display: 'flex', justifyContent: 'flex-start' }}>
        </Box>
        <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
          <Typography 
            variant="h6" 
            component="div" 
            onClick={handleTitleClick}
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              fontSize: '20px', 
              fontFamily: 'Cascadia Code',
              cursor: 'pointer'
            }}
          >
            Qsuite
            <QsuiteLogo style={{ width: '52px', height: '52px', marginLeft: '10px' }} />
          </Typography>
        </Box>
        <Box sx={{ flex: 1, display: 'flex', justifyContent: 'flex-end', cursor: 'pointer' }}>
          {!isAuthenticated && (<LoginButton />)}
          <div style={{ width: '40px' }} />
          <MenuDropdown menuItems={menuItems} />
        </Box>
      </Toolbar>
    </AppBar>
  )
}

export default Header
