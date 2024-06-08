import React from 'react';
import TextField from '@mui/material/TextField';
import CustomButton from '../CustomButton/CustomButton.js';
import '../../pages/TestGroups.css'

const greyColor = '#f0f0f0';

const GroupForm = ({ name, machine, port, schedule, onChange, onClose, onTestConnect, onSubmit, finalButtonMsg }) => {
    return (
        <div className="inputs-container">
            <div className="grey-container">
                <TextField
                    label="Name"
                    variant="filled"
                    value={name}
                    onChange={(e) => onChange('name', e.target.value)}
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
                    onChange={(e) => onChange('machine', e.target.value)}
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
                    onChange={(e) => onChange('port', e.target.value)}
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
                    onChange={(e) => onChange('schedule', e.target.value)}
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
                <div className="button-stack">
                    <CustomButton height={0.7} width={0.9} onClick={onTestConnect}>Test Connection</CustomButton>
                    <CustomButton height={0.7} width={0.9} onClick={onSubmit}>{finalButtonMsg}</CustomButton>
                </div>
            </div>
            <button className="close-button" onClick={onClose}>x</button>
        </div>
    );
};

export default GroupForm;
