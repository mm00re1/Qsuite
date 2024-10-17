import React, { useState } from 'react'
import TextField from '@mui/material/TextField'
import EditIcon from '@mui/icons-material/Edit'
import SaveIcon from '@mui/icons-material/Save'
import DeleteIcon from '@mui/icons-material/Delete'
import Tooltip from '@mui/material/Tooltip'
import Paper from '@mui/material/Paper'
import grey from '@mui/material/colors/grey'

const EnvironmentRow = ({ environment, url, isEditing, onEdit, onSave, onDelete, isActive, onActivate }) => {
  const [newUrl, setNewUrl] = useState(url)
  
  const handleSave = () => {
    onSave(newUrl);
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
      {isActive ? (
        <div
          style={{
            width: '12px',
            height: '12px',
            borderRadius: '50%',
            backgroundColor: '#4CAF50',
            boxShadow: '0 0 10px #4CAF50',
            marginRight: '16px',
          }}
        />
      ) : (
        <div
          style={{
            width: '12px',
            height: '12px',
            borderRadius: '50%',
            backgroundColor: 'white',
            marginRight: '16px',
          }}
        />
      )}
      <Paper
        elevation={3}
        component="button"
        onClick={onActivate}
        style={{
          padding: '16px',
          fontFamily: 'Cascadia Code',
          //backgroundColor: isActive ? '#e0e0e0' : 'white',
          boxShadow: '0px 12px 18px rgba(0, 0, 0, 0.1)',
          minWidth: '250px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '56px', // Match the height of TextField
          boxSizing: 'border-box', // Ensure padding is included in the height
          cursor: 'pointer',
          border: 'none',
        }}
      >
        {environment}
      </Paper>
      <TextField
        label="URL"
        variant="filled"
        value={isEditing ? newUrl : url}
        onChange={(e) => setNewUrl(e.target.value)}
        disabled={!isEditing}
        style={{
          boxShadow: '0px 12px 18px rgba(0, 0, 0, 0.1)',
          minWidth: '300px',
          marginRight: '16px',
          backgroundColor: isEditing ? 'white' : grey[200],
          height: '56px', // Explicitly set height to match Paper
        }}
        InputLabelProps={{
          style: {
            fontFamily: 'Cascadia Code',
          },
        }}
        InputProps={{
          style: {
            backgroundColor: isEditing ? 'white' : grey[200],
            fontFamily: 'Cascadia Code',
            height: '100%', // Ensure input takes full height of TextField
          },
        }}
      />
      {isEditing ? (
        <Tooltip title="Save Changes" arrow>
          <SaveIcon
            onClick={handleSave}
            style={{ cursor: 'pointer', color: isEditing ? 'black' : grey[400] }}
          />
        </Tooltip>
      ) : (
        <Tooltip title="Edit Environment URL" arrow>
          <EditIcon
            onClick={onEdit}
            style={{ cursor: 'pointer', width: '24px', height: '24px' }}
          />
        </Tooltip>
      )}
      <Tooltip title="Delete Environment" arrow>
        <DeleteIcon
          onClick={onDelete}
          style={{ cursor: 'pointer', width: '24px', height: '24px', marginLeft: '16px' }}
        />
      </Tooltip>
    </div>
  )
}

export default EnvironmentRow
