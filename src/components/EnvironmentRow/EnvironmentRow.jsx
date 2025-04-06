import React, { useState } from 'react'
import TextField from '@mui/material/TextField'
import EditIcon from '@mui/icons-material/Edit'
import SaveIcon from '@mui/icons-material/Save'
import DeleteIcon from '@mui/icons-material/Delete'
import Tooltip from '@mui/material/Tooltip'
import Paper from '@mui/material/Paper'
import { grey } from '@mui/material/colors';
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import InputAdornment from '@mui/material/InputAdornment'
import IconButton from '@mui/material/IconButton'
import Visibility from '@mui/icons-material/Visibility'
import VisibilityOff from '@mui/icons-material/VisibilityOff'
import CircularProgress from '@mui/material/CircularProgress'

const EnvironmentRow = ({
  environment,
  url,
  connMethod,
  connectionOptions,
  isEditing,
  onEdit,
  onSave,
  onDelete,
  isActive,
  onActivate,
  envCredentials,
  onCredentialChange,
  onConnMethodChange,
  loading
}) => {
  const [newUrl, setNewUrl] = useState(url)
  const [showPassword, setShowPassword] = useState(false)
  const [showClientSecret, setShowClientSecret] = useState(false)

  const handleClickShowPassword = () => setShowPassword(!showPassword);
  const handleClickShowClientSecret = () => setShowClientSecret(!showClientSecret);
  
  const handleSave = () => {
    onSave(newUrl);
  }

  const greyColor = '#f0f0f0'

  return (
    <>
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
        <FormControl variant="filled">
          <InputLabel style={{ fontFamily: 'Cascadia Code' }}>KDB Connection</InputLabel>
          <Select
              value={connMethod ? connMethod : ""}
              label="Sort By"
              onChange={(e) => onConnMethodChange(e.target.value)}
              disabled={!isEditing}
              style={{
                  backgroundColor: 'white',
                  borderRadius: 0,
                  fontFamily: 'Cascadia Code',
                  boxShadow: '0px 12px 18px rgba(0, 0, 0, 0.1)',
                  minWidth: '220px',
                  marginRight: '16px'
              }}
              MenuProps={{
                  PaperProps: {
                      style: {
                          backgroundColor: 'white', // Dropdown box color
                      }
                  }
              }}
          >
              {connectionOptions.map((option, index) => (
                  <MenuItem
                      key={index}
                      value={option}
                      style={{ fontFamily: 'Cascadia Code', display: 'flex', justifyContent: 'center' }}
                  >
                      {option}
                  </MenuItem>
              ))}
          </Select>
      </FormControl>
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
      {loading && (
        <div style={{ margin: 'auto' }}>
            <div style={{ marginBottom: '10px' }}/>
            <CircularProgress
                style={{ color: '#95B0F8', width: '33px', height: '33px' }}
                thickness={7}
            />
            <div style={{ marginBottom: '10px' }}/>
        </div>
      )}
      {(isEditing  && !loading) && (
        <div
          style={{
            backgroundColor: '#f0f0f0',
            display: 'flex',
            alignItems: 'center',
            paddingLeft: '15px',
            paddingRight: '15px',
            paddingTop: '7px',
            paddingBottom: '7px',
            borderRadius: '0',
            gap: '20px',
            boxShadow: '8px 8px 12px rgba(0, 0, 0, 0.3)'
          }}
        >
          <TextField
              label="KDB Username"
              variant="filled"
              value={envCredentials?.username || ""}
              onChange={(e) => onCredentialChange('username', e.target.value)}
              style={{
                  boxShadow: '0px 12px 18px rgba(0, 0, 0, 0.1)',
                  minWidth: '250px'
              }}
              InputLabelProps={{
                  style: {
                      fontFamily: 'Cascadia Code', // Set the font family of the label text
                  }
              }}
              InputProps={{
                  style: {
                      backgroundColor: greyColor,
                      fontFamily: 'Cascadia Code',
                  }
              }}
          />
          {(connMethod === "Azure Oauth") ? (
            <>
            <TextField
                label="Tenant ID"
                variant="filled"
                value={envCredentials?.tenant_id || ""}
                onChange={(e) => onCredentialChange('tenant_id', e.target.value)}
                style={{
                    boxShadow: '0px 12px 18px rgba(0, 0, 0, 0.1)',
                    minWidth: '250px'
                }}
                InputLabelProps={{
                    style: {
                        fontFamily: 'Cascadia Code', // Set the font family of the label text
                    }
                }}
                InputProps={{
                    style: {
                        backgroundColor: greyColor,
                        fontFamily: 'Cascadia Code',
                    }
                }}
              />
              <TextField
                label="Client ID"
                variant="filled"
                value={envCredentials?.client_id || ""}
                onChange={(e) => onCredentialChange('client_id', e.target.value)}
                style={{
                    boxShadow: '0px 12px 18px rgba(0, 0, 0, 0.1)',
                    minWidth: '250px'
                }}
                InputLabelProps={{
                    style: {
                        fontFamily: 'Cascadia Code', // Set the font family of the label text
                    }
                }}
                InputProps={{
                    style: {
                        backgroundColor: greyColor,
                        fontFamily: 'Cascadia Code',
                    }
                }}
              />
              <TextField
                label="Client Secret"
                variant="filled"
                type={showClientSecret ? 'text' : 'password'}
                value={envCredentials?.client_secret || ""}
                onChange={(e) => onCredentialChange('client_secret', e.target.value)}
                style={{
                  boxShadow: '0px 12px 18px rgba(0, 0, 0, 0.1)',
                  minWidth: '250px',
                }}
                InputLabelProps={{
                  style: {
                    fontFamily: 'Cascadia Code',
                  },
                }}
                InputProps={{
                  style: {
                    backgroundColor: greyColor,
                    fontFamily: 'Cascadia Code',
                  },
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={handleClickShowClientSecret} edge="end">
                        {showClientSecret ? <Visibility /> : <VisibilityOff />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </>
          ) : (
            <TextField
              label="KDB Password"
              variant="filled"
              type={showPassword ? 'text' : 'password'}
              value={envCredentials?.password || ""}
              onChange={(e) => onCredentialChange('password', e.target.value)}
              style={{
                boxShadow: '0px 12px 18px rgba(0, 0, 0, 0.1)',
                minWidth: '250px',
              }}
              InputLabelProps={{
                style: {
                  fontFamily: 'Cascadia Code',
                },
              }}
              InputProps={{
                style: {
                  backgroundColor: greyColor,
                  fontFamily: 'Cascadia Code',
                },
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={handleClickShowPassword} edge="end">
                      {showPassword ? <Visibility /> : <VisibilityOff />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          )}
        </div>
      )}
    </>
  )
}

export default EnvironmentRow
