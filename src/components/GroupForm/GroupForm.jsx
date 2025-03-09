import React from 'react'
import TextField from '@mui/material/TextField'
import Checkbox from '@mui/material/Checkbox'
import FormControlLabel from '@mui/material/FormControlLabel'
import Typography from '@mui/material/Typography'
import CustomButton from '../CustomButton/CustomButton'
import EditIcon from '@mui/icons-material/Edit'
import SaveIcon from '@mui/icons-material/Save'
import UndoIcon from '@mui/icons-material/Undo'
import { TimePicker } from '@mui/x-date-pickers/TimePicker'
import Paper from '@mui/material/Paper'
import grey from '@mui/material/colors/grey'
import dayjs from 'dayjs'
import '../../pages/TestGroups.css'

const greyColor = '#f0f0f0';

const GroupForm = ({
  env,
  connMethod,
  machine,
  port,
  schedule,
  tls,
  scope,
  onChange,
  onEdit,
  onTestConnect,
  updateGroupEnv,
  editing,
  editButton = true,
  onUndo,
}) => {

    const isOAuth = connMethod === 'Azure Oauth';

    return (
      <div className="inputs-container">
        <div className="grey-container">
        {/* Left Column (ENV) */}
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Paper
            elevation={3}
            style={{
              padding: '16px',
              fontFamily: 'Cascadia Code',
              boxShadow: '0px 12px 18px rgba(0, 0, 0, 0.1)',
              backgroundColor: 'transparent',
              textAlign: 'center',
              height: '56px',
              boxSizing: 'border-box',
              minWidth: '80px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {env}
          </Paper>
        </div>
  
        {/* Middle Column */}
        {isOAuth ? (
          /* ---------------------------
             2-row layout for Azure Oauth
          ----------------------------*/
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              marginRight: '20px'
            }}
          >
            {/* Row 1: Machine & Port */}
            <div style={{ display: 'flex', gap: '16px' }}>
              <TextField
                label="Machine"
                variant="filled"
                value={machine}
                disabled={!editing}
                onChange={(e) => onChange('Machine', e.target.value)}
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
                }}
              />
              <TextField
                label="Port"
                variant="filled"
                value={port}
                disabled={!editing}
                onChange={(e) => onChange('Port', e.target.value)}
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
                }}
              />
            </div>
  
            {/* Row 2: Scope & Schedule */}
            <div style={{ display: 'flex', gap: '16px' }}>
              <TextField
                label="Scope"
                variant="filled"
                value={scope}
                disabled={!editing}
                onChange={(e) => onChange('Scope', e.target.value)}
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
                }}
              />
              <TimePicker
                label="Scheduled"
                value={dayjs(schedule, 'HH:mm')}
                onChange={(newValue) => {
                  if (newValue) {
                    onChange('Scheduled', newValue.format('HH:mm'));
                  }
                }}
                disabled={!editing}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    variant="filled"
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
                    }}
                  />
                )}
              />
            </div>
          </div>
        ) : (
          /* ----------------------------------
             1-row layout for other connections
          -----------------------------------*/
          <div style={{ display: 'flex', gap: '16px' }}>
            <TextField
              label="Machine"
              variant="filled"
              value={machine}
              disabled={!editing}
              onChange={(e) => onChange('Machine', e.target.value)}
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
              }}
            />
            <TextField
              label="Port"
              variant="filled"
              value={port}
              disabled={!editing}
              onChange={(e) => onChange('Port', e.target.value)}
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
              }}
            />
            <TimePicker
              label="Scheduled"
              value={dayjs(schedule, 'HH:mm')}
              onChange={(newValue) => {
                if (newValue) {
                  onChange('Scheduled', newValue.format('HH:mm'));
                }
              }}
              disabled={!editing}
              renderInput={(params) => (
                <TextField
                  {...params}
                  variant="filled"
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
                  }}
                />
              )}
            />
          </div>
        )}
  
        {/* Right Column: TLS + Test Button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <FormControlLabel
            control={
              <Checkbox
                checked={tls}
                onChange={(e) => onChange('TLS', e.target.checked)}
                color="primary"
                disabled={!editing}
              />
            }
            label={
              <Typography
                style={{
                  fontFamily: 'Cascadia Code',
                  color: editing ? 'inherit' : grey[400],
                }}
              >
                TLS
              </Typography>
            }
          />
          <div className="button-stack">
            <CustomButton
                disabled={!editing}
                height={0.7}
                width={0.9}
                onClick={onTestConnect}
            >
                Test Connection
            </CustomButton>
          </div>
          </div>
          </div>
          {/* Edit / Undo / Save Icons */}
          {editButton &&
            (editing ? (
              <UndoIcon
                onClick={onUndo}
                style={{ cursor: 'pointer', color: 'black' }}
              />
            ) : (
              <EditIcon
                onClick={onEdit}
                style={{ cursor: 'pointer', width: '24px', height: '24px' }}
              />
            ))}
          <SaveIcon
            onClick={editing ? updateGroupEnv : undefined}
            disabled={!editing}
            style={{
              cursor: editing ? 'pointer' : 'default',
              color: editing ? 'black' : grey[400],
            }}
          />
      </div>
    );
  };

export default GroupForm;
