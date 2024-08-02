import React, { useEffect, useRef } from 'react';
import TextField from '@mui/material/TextField';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import Typography from '@mui/material/Typography';
import CustomButton from '../CustomButton/CustomButton.js';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import KdbQueryStatus from '../KdbQueryStatus/KdbQueryStatus.js';
import '../../pages/TestGroups.css'

const greyColor = '#f0f0f0';

const GroupForm = ({ name, machine, port, schedule, onChange, onClose, onTestConnect, onSubmit, finalButtonMsg, connectionValid, loading, connectMessage }) => {
    const [checked, setChecked] = React.useState(false);
    const messageRef = useRef(null);

    useEffect(() => {
        if (connectionValid !== null && messageRef.current) {
            messageRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [connectionValid]);

    const handleCheckboxChange = (event) => {
        setChecked(event.target.checked);
        onChange('TLS', event.target.checked)
    };

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
                    <TextField
                        label="Schedule"
                        variant="filled"
                        value={schedule}
                        onChange={(e) => onChange('Scheduled', e.target.value)}
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
                    <FormControlLabel
                        control={<Checkbox checked={checked} onChange={handleCheckboxChange} color="primary" />}
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
