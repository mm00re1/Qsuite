import React, { useState } from 'react';
import Header from '../components/Header/Header.js'
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import CodeTerminal from '../components/CodeTerminal/CodeTerminal.js';
import CustomButton from '../components/CustomButton/CustomButton.js';
import './AddTest.css'
import { ReactComponent as RedCircle } from '../assets/red_circle.svg';
import { ReactComponent as GreenCircle } from '../assets/green_circle.svg';

  const ActionButtons = ({ onExecute, onAddTest }) => (
    <div className="actionButtons">
      <CustomButton onClick={onExecute}>Execute</CustomButton>
      <CustomButton onClick={onAddTest}>Save Test</CustomButton>
    </div>
  );

// Footer Component
const Footer = () => (
  <footer className="footer">
    <a href="#">Test Creation Tutorial</a>
  </footer>
);

// App Component
const AddTest = () => {
    const [name, setName] = React.useState('');
    const [project, setProject] = useState('');
    const [machine, setMachine] = useState('');
    const [port, setPort] = React.useState('');
    const [lines, setLines] = useState(['']); // Start with one empty line
    const [message, setMessage] = useState('');
    const [response, setResponse] = useState("");
    const [showResponse, setShowResponse] = useState(false);
    const [testStatus, setTestStatus] = useState(null);

    const projectOptions = ["options", "equities", "+"];
    const machineOptions = ["kdb-dev-01", "kdb-dev-02", "+"];

    const nameChange = (event) => {
        setName(event.target.value);
    };

    const projectChange = (event) => {
        setProject(event.target.value);
    };
    
    const machineChange = (event) => {
        setMachine(event.target.value);
    };

    const portChange = (event) => {
        setPort(event.target.value);
    };

    const executeCode = () => {
        console.log("Executing code");
        console.log(lines);
        fetch('http://127.0.0.1:5000/executeQcode/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ code: lines })
        })
        .then(response => response.json())
        .then(data => {
            console.log(data);
            setTestStatus(data.success);
            setMessage(data.message); // Update the message state
            setResponse(data.data); // Update the data state
            setShowResponse(data.data.length > 0);
        })
        .catch(error => {
            console.error('Error:', error);
            setTestStatus(false);
            setMessage('Failed to execute code.');
            setResponse([]);
            setShowResponse(false);
        });
    };
    
    const addTest = () => {
        console.log("Adding Test"); // For debugging
    }

    return (
        <>
            <Header title={"All Test Runs"}/>
            <div className="AddTestFields">
                <TextField
                    label="Name"
                    variant="filled"
                    value={name}
                    onChange={nameChange}
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
                          backgroundColor: 'white',
                          fontFamily: 'Cascadia Code',
                        }
                      }}
                />
                <FormControl variant="filled">
                <InputLabel style={{ fontFamily: 'Cascadia Code' }}> Project </InputLabel>
                    <Select
                    value={project}
                    label="Project"
                    onChange={projectChange}
                    style={{
                        backgroundColor: 'white',
                        borderRadius: 0,
                        fontFamily: 'Cascadia Code',
                        boxShadow: '0px 12px 18px rgba(0, 0, 0, 0.1)',
                        minWidth: '250px'
                    }}
                    MenuProps={{
                        PaperProps: {
                          style: {
                            backgroundColor: 'white', // Dropdown box color
                          }
                        }
                      }}
                    >
                        {projectOptions.map((option, index) => (
                            <MenuItem
                                key={index}
                                value={option}
                                style={{fontFamily: 'Cascadia Code', display: 'flex', justifyContent: 'center'}}
                            >
                                {option}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>

                <FormControl variant="filled">
                <InputLabel style={{ fontFamily: 'Cascadia Code' }}> Machine </InputLabel>
                    <Select
                    value={machine}
                    label="Machine"
                    onChange={machineChange}
                    style={{
                        backgroundColor: 'white',
                        borderRadius: 0,
                        fontFamily: 'Cascadia Code',
                        boxShadow: '0px 12px 18px rgba(0, 0, 0, 0.1)',
                        minWidth: '250px'
                    }}
                    MenuProps={{
                        PaperProps: {
                          style: {
                            backgroundColor: 'white', // Dropdown box color
                          }
                        }
                      }}
                    >
                        {machineOptions.map((option, index) => (
                            <MenuItem
                                key={index}
                                value={option}
                                style={{fontFamily: 'Cascadia Code', display: 'flex', justifyContent: 'center'}}
                            >
                                {option}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
                <TextField
                    label="Port"
                    variant="filled"
                    value={port}
                    onChange={portChange}
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
                          backgroundColor: 'white',
                          fontFamily: 'Cascadia Code',
                        }
                      }}
                />
            </div>
            <CodeTerminal lines={lines} onLinesChange={setLines} />
            {testStatus !== null && (
                <div
                    style={{
                        display: 'inline-flex',    // Changed to flex to enable flexbox properties
                        alignItems: 'center', 
                        padding: '10px 50px 10px 10px',
                        backgroundColor: '#0C0C0C',
                        color: testStatus ? '#60F82A' : '#FF4242',
                        borderRadius: '6px',
                        font: 'Cascadia Code',
                        marginLeft: '5%',
                        marginTop: '40px',
                        marginBottom: '20px',
                        fontSize: '17px',
                        boxShadow: '0px 24px 36px rgba(0, 0, 0, 0.2)',
                        }}
                >
                    {testStatus ? (
                        <>
                        <GreenCircle style={{ width: '33px', height: '33px' }} />
                        <span style={{ marginLeft: '10px' }}>{message}</span>
                        </>
                    ) : (
                        <>
                        <RedCircle style={{ width: '33px', height: '33px' }} />
                        <span style={{ marginLeft: '10px' }}>{message}</span>
                        </>
                    )}
                </div>
            )}
            {showResponse && (
                <div
                    style={{
                        background: '#0C0C0C',
                        color: 'white', 
                        padding: '15px',
                        font: 'Cascadia Code',
                        whiteSpace: 'pre-wrap',
                        overflow: 'auto',
                        maxWidth: '68.5%',
                        borderRadius: '6px',
                        marginLeft: '5%',
                        fontSize: '15px',
                        boxShadow: '0px 24px 36px rgba(0, 0, 0, 0.2)',
                        }}
                >
                    {JSON.stringify(response, null, 2)}
                </div>
            )}
            <ActionButtons onExecute={executeCode} onAddTest={addTest}/>
        </>
    )
};

export default AddTest;
