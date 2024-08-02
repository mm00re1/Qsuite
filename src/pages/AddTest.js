import React, { useState, useEffect } from 'react';
import Header from '../components/Header/Header.js'
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Typography from '@mui/material/Typography';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import { useNavigate } from 'react-router-dom';
import CodeTerminal from '../components/CodeTerminal/CodeTerminal.js';
import CodeDisplay from '../components/CodeDisplay/CodeDisplay.js';
import CustomButton from '../components/CustomButton/CustomButton.js';
import './AddTest.css'
import KdbQueryStatus from '../components/KdbQueryStatus/KdbQueryStatus.js';
import SearchTests from '../components/SearchTests/SearchTests.js';
import SearchFunctionalTests from '../components/SearchFunctionalTests/SearchFunctionalTests.js';
import CustomSwitchButton from '../components/CustomButton/CustomSwitchButton.js';

// App Component
const AddTestPage = () => {
    const [name, setName] = React.useState('');
    const [group, setGroup] = useState('');
    const [lines, setLines] = useState(['']); // Start with one empty line
    const [message, setMessage] = useState('');
    const [response, setResponse] = useState("");
    const [showResponse, setShowResponse] = useState(false);
    const [testStatus, setTestStatus] = useState(null);
    const [testGroups, setTestGroups] = useState([]);
    const [linkedTests, setLinkedTests] = useState([]);
    const [FreeForm, setFreeForm] = useState(true);
    const [functionalTest, setFunctionalTest] = useState(null);
    const [groupMissing, setGroupMissing] = useState(true);
    const [testCode, setTestCode] = useState(['']);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const url = 'http://127.0.0.1:8000/';

    useEffect(() => {
        fetch(`${url}test_groups/`)
            .then(response => response.json())
            .then(data => {
                setTestGroups(data);
            })
            .catch(error => console.error('Error fetching test groups:', error));
    }, []);

    const goToHomePage = () => {
        navigate('/');
    }

    const nameChange = (event) => {
        setName(event.target.value);
    };

    const groupChange = (event) => {
        setGroup(event.target.value);
        setGroupMissing(false);
    };

    const executeCode = () => {
        let fetchPromise;
        const groupId = (testGroups.find(testGroup => testGroup.name === group)).id;

        if (!FreeForm) {
            fetchPromise = fetch(`${url}execute_q_function?group_id=${groupId}&test_name=${functionalTest}`);
        } else {
            fetchPromise = fetch(`${url}execute_q_code/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ code: lines, group_id: groupId })  // Pass group_id here
            });
        }
    
        setLoading(true);
        fetchPromise
            .then(response => response.json())
            .then(data => {
                setTestStatus(data.success);
                setMessage(data.message); // Update the message state
                setResponse(data.data); // Update the data state
                setShowResponse(data.data.length > 0);
                setLoading(false);
            })
            .catch(error => {
                console.error('Error:', error);
                setTestStatus(false);
                setMessage('Failed to execute code.');
                setResponse([]);
                setShowResponse(false);
                setLoading(false);
            });
    };
    
    const addTest = () => {
        setShowResponse(false)
        // Check if any of the fields are empty
        if (!name || !group) {
            setTestStatus(false);
            if (!name) setMessage('Name is required.');
            else if (!group) setMessage('Group is required.');
            return;
        }
        
        // Find the group object by name
        const selectedGroup = testGroups.find(testGroup => testGroup.name === group);

        // If group not found, show an error
        if (!selectedGroup) {
            setTestStatus(false);
            setMessage('Selected group not found.');
            return;
        }

        const testData = {
            group_id: selectedGroup.id, // Use the ID instead of the name
            test_name: name,
            test_code: FreeForm ? lines.join('\n\n') : functionalTest, // Combine the lines into a single string
            dependencies: Object.values(linkedTests).map(test => test.test_case_id),
            free_form: FreeForm
        };
        
        fetch(`${url}add_test_case/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(testData)
        })
        .then(response => response.json())
        .then(data => {
            setTestStatus(true);
            setMessage(data.message);
        })
        .catch(error => {
            console.error('Error:', error);
            setTestStatus(false);
            setMessage('Failed to add test case.');
        });
    };

    const handleLinkedTestChange = (event, newValue) => {
        // Avoid adding duplicates
        if (!linkedTests.some(test => test.test_case_id === newValue.test_case_id)) {
            const updatedLinkedTests = [...linkedTests, newValue];
            setLinkedTests(updatedLinkedTests);
        }
    };

    const handleFunctionalTestChange = (event, newValue) => {
        setFunctionalTest(newValue);
        if(name === '') {
            setName(newValue);
        }
        const groupId = (testGroups.find(testGroup => testGroup.name === group)).id;
        fetch(`${url}view_test_code?group_id=${groupId}&test_name=${newValue}`)
        .then(response => response.json())
        .then(data => {
            setTestCode(data.split('\n'));
        })
        .catch(error => console.error('Error fetching data:', error));
    };

    const removeLinkedTest = (testToDelete) => {
        const updatedTests = linkedTests.filter(test => test.test_case_id !== testToDelete.test_case_id);
        setLinkedTests(updatedTests);
    };

    const handleSwitchClick = () => {
        setFreeForm(!FreeForm);
        console.log("testCode: ", testCode)
    };

    return (
        <>
            <Header title={"All Test Runs"} onClick={goToHomePage}/>
            <div className="AddTestFields">
                <div className="name-input-container">
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
                </div>
                <FormControl variant="filled">
                <InputLabel style={{ fontFamily: 'Cascadia Code' }}> Test Group </InputLabel>
                    <Select
                    value={group}
                    label="Group"
                    onChange={groupChange}
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
                    {testGroups.map((option, index) => (
                        <MenuItem
                            key={index}
                            value={option.name} // Use option.name for the value
                            style={{fontFamily: 'Cascadia Code', display: 'flex', justifyContent: 'center'}}
                        >
                            {option.name}
                        </MenuItem>
                    ))}
                    </Select>
                </FormControl>
                <SearchTests
                    linkedTests={linkedTests}
                    handleLinkedTestChange={handleLinkedTestChange}
                    removeLinkedTest={removeLinkedTest}
                    renderChips={true}
                    message={"Add a Linked Test..."}
                />
            </div>
            <div style={{ marginTop: '100px' }}/>
            <div className="switchButton-TestDetail">
                <CustomSwitchButton
                    leftMessage={"Free-Form"}
                    rightMessage={"Functional"}
                    onClick={handleSwitchClick}
                />
            </div>
            {(FreeForm) && (
                <CodeTerminal lines={lines} onLinesChange={setLines} />
            )}
            {(!FreeForm) && (
                <div style={{ marginLeft: '5%', marginTop: '20px' }}>
                <SearchFunctionalTests
                    selectedTest={functionalTest}
                    group={group}
                    testGroups={testGroups}
                    handleTestChange={handleFunctionalTestChange}
                    message={"Use existing q test"}
                    groupMissing={groupMissing}
                />
                </div>
            )}
            {((!FreeForm) && (Array.isArray(testCode) && (testCode.length !== 1 || testCode[0] !== ''))) && (
                <CodeDisplay lines={testCode} />
            )}
            <div style={{ marginLeft: '5%', marginBottom: '20px'}}>
                <KdbQueryStatus
                    queryStatus={testStatus}
                    loading={loading}
                    message={message}
                />
            </div>
            {showResponse && (
                <div
                    style={{
                        background: '#0C0C0C',
                        color: 'white', 
                        padding: '15px',
                        font: 'Cascadia Code',
                        whiteSpace: 'pre-wrap',
                        overflow: 'auto',
                        maxWidth: '58.5%',
                        borderRadius: '6px',
                        marginLeft: '5%',
                        fontSize: '15px',
                        boxShadow: '0px 24px 36px rgba(0, 0, 0, 0.2)',
                        }}
                >
                    {JSON.stringify(response, null, 2)}
                </div>
            )}
            <div className="actionButtons">
                <CustomButton onClick={executeCode} disabled={groupMissing}>Execute</CustomButton>
                <CustomButton onClick={addTest} disabled={groupMissing}>Save Test</CustomButton>
                {(FreeForm && groupMissing && (Array.isArray(lines) && (lines.length !== 1 || lines[0] !== ''))) && (
                    <Typography color="error" style={{ marginTop: '10px', fontFamily: 'Cascadia Code' }}>
                        A group must be selected to execute q code.
                    </Typography>
                )}
            </div>
        </>
    )
};

export default AddTestPage;
