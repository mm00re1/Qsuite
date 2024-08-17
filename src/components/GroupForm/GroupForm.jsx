import React, { useEffect, useRef } from 'react';
import TextField from '@mui/material/TextField';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import Typography from '@mui/material/Typography';
import CustomButton from '../CustomButton/CustomButton';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import dayjs from 'dayjs'
import KdbQueryStatus from '../KdbQueryStatus/KdbQueryStatus';
import '../../pages/TestGroups.css'

const greyColor = '#f0f0f0';

const GroupForm = ({
  name,
  machine,
  port,
  schedule,
  tls,
  onChange,
  onClose,
  onTestConnect,
  onSubmit,
  finalButtonMsg,
  connectionValid,
  loading,
  connectMessage,
}) => {
    const messageRef = useRef(null);

    useEffect(() => {
        if (connectionValid !== null && messageRef.current) {
            messageRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [connectionValid]);

    return (
        <div className = "create-edit-group-footer">
            <div className="inputs-container">
                <div className="grey-container">
                    <TextField
                        label="Name"
                        variant="filled"
                        value={name}
                        onChange={(e) => onChange('Name', e.target.value)}
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
                        label="Machine"
                        variant="filled"
                        value={machine}
                        onChange={(e) => onChange('Machine', e.target.value)}
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
                        label="Port"
                        variant="filled"
                        value={port}
                        onChange={(e) => onChange('Port', e.target.value)}
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
                    <TimePicker
                        label="Scheduled"
                        value={dayjs(schedule, 'HH:mm')}
                        onChange={(newValue) => {
                            if (newValue) {
                            onChange('Scheduled', newValue.format('HH:mm'));
                            }
                        }}
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
                                    fontFamily: 'Cascadia Code', // Set the font family of the label text
                                }
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
                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={tls}
                                onChange={(e) => onChange('TLS', e.target.checked)}
                                color="primary"
                            />}
                        label={<Typography style={{ fontFamily: 'Cascadia Code' }}>TLS</Typography>}
                    />
                    <div className="button-stack">
                        <CustomButton height={0.7} width={0.9} onClick={onTestConnect}>Test Connection</CustomButton>
                        <CustomButton height={0.7} width={0.9} onClick={onSubmit}>{finalButtonMsg}</CustomButton>
                    </div>
                </div>
                <IconButton
                    onClick={onClose}
                    style={{
                        width: '25px',
                        height: '25px',
                        borderRadius: '50%',
                        backgroundColor: '#D9D9D9',
                        color: 'white',
                        font: 'bold',
                    }}
                >
                    <CloseIcon />
                </IconButton>
            </div>
            <KdbQueryStatus
                queryStatus={connectionValid}
                loading={loading}
                message={connectionValid ? "Connection Successful" : "Connection Failed => " + connectMessage}
            />
        </div>
    );
};

export default GroupForm;
