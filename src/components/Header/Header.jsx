import React from 'react'
import { AppBar, Toolbar, Typography, Box } from '@mui/material'
import BackButton from '../BackButton/BackButton'
import EnvSetingsIcon from '../UserProfile/EnvSetingsIcon'
import QsuiteLogo from '../../../assets/qsuite_logo.svg?react'

const Header = ({ title, onClick }) => (
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
        {title !== "disabled" && (
          <BackButton title={title} onClick={onClick} textColor={'white'} fontSize={'20px'} />
        )}
      </Box>
      <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
        <Typography variant="h6" component="div" sx={{ display: 'flex', alignItems: 'center', fontSize: '20px', fontFamily: 'Cascadia Code' }}>
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

export default Header