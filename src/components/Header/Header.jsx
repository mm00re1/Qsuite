import React from 'react'
import { AppBar, Toolbar, Typography, Box } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import EnvSetingsIcon from '../UserProfile/EnvSetingsIcon'
import QsuiteLogo from '../../../assets/qsuite_logo.svg?react'

const Header = () => {
  const navigate = useNavigate()

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
          <EnvSetingsIcon />
        </Box>
      </Toolbar>
    </AppBar>
  )
}

export default Header