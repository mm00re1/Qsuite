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
    const [lines, setLines] = useState(['']); // Start with one empty line


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

    const executeCode = () => {
        console.log("Executing code:", lines); // keep lines seperate and join in the backend before being dispatched to kdb for execution, this way we can store it as multi line in the sql db
    
        // Example POST request using fetch
        /*fetch('http://your-backend-endpoint/execute', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ code: codeToExecute })
        })
        .then(response => response.json())
        .then(data => console.log(data))
        .catch(error => console.error('Error:', error));*/
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
                    variant="outlined"
                    value={name}
                    onChange={nameChange}
                    style={{
                        backgroundColor: '#D9D9D9',
                        borderRadius: 0,
                    }}
                    InputProps={{
                        style: {
                          fontFamily: 'Cascadia Code',
                        }
                      }}
                />
                <FormControl>
                    <InputLabel>Project</InputLabel>
                    <Select
                    value={project}
                    label="Project"
                    onChange={projectChange}
                    style={{
                        backgroundColor: '#D9D9D9',
                        borderRadius: 0,
                        fontFamily: 'Cascadia Code',
                    }}
                    MenuProps={{
                        PaperProps: {
                          style: {
                            backgroundColor: '#D9D9D9', // Dropdown box color
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

                <FormControl>
                    <InputLabel>Machine</InputLabel>
                    <Select
                    value={machine}
                    label="Machine"
                    onChange={machineChange}
                    style={{
                        backgroundColor: '#D9D9D9',
                        borderRadius: 0,
                        fontFamily: 'Cascadia Code',
                    }}
                    MenuProps={{
                        PaperProps: {
                          style: {
                            backgroundColor: '#D9D9D9', // Dropdown box color
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
            </div>
            <CodeTerminal lines={lines} onLinesChange={setLines} />
            <ActionButtons onExecute={executeCode} onAddTest={addTest}/>
            <Footer />
        </>
    )
};

export default AddTest;
