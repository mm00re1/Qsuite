import React from 'react'
import Paper from '@mui/material/Paper'

const ReleaseBox = ({ environment, isDone }) => {
  
  return (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      <Paper
        elevation={3}
        style={{
          padding: '16px',
          fontFamily: 'Cascadia Code',
          backgroundColor: 'white',
          boxShadow: isDone ? '0px 12px 18px rgba(0, 255, 0, 0.3)' : '0px 12px 18px rgba(0, 0, 0, 0.3)',
          border: isDone ? '1px solid #00FF00' : 'none',
          borderRadius: '0px',
          minWidth: '250px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '56px', // Match the height of TextField
          boxSizing: 'border-box', // Ensure padding is included in the height
          color: isDone ? '#00FF00' : 'inherit'
        }}
      >
        {environment}
      </Paper>
    </div>
  )
}

export default ReleaseBox
