import React, { useState, useEffect } from 'react';
import Header from '../components/Header/Header'
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Typography from '@mui/material/Typography';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import { useNavigate } from 'react-router-dom';
import { useNavigation } from '../TestNavigationContext';
import CodeTerminal from '../components/CodeTerminal/CodeTerminal';
import CodeDisplay from '../components/CodeDisplay/CodeDisplay';
import CustomButton from '../components/CustomButton/CustomButton';
import './AddTest.css'
import KdbQueryStatus from '../components/KdbQueryStatus/KdbQueryStatus';
import SearchTests from '../components/SearchTests/SearchTests';
import SearchFunctionalTests from '../components/SearchFunctionalTests/SearchFunctionalTests';
import CustomSwitchButton from '../components/CustomButton/CustomSwitchButton';
import { fetchWithErrorHandling } from '../utils/api'
import { useError } from '../ErrorContext.jsx'


const AddTestPage = () => {
    const { env, setEnv, environments } = useNavigation();
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
    const { showError } = useError()

    useEffect(() => {
        async function fetchTestGroups() {
            try {
                const data = await fetchWithErrorHandling(`${environments[env].url}test_groups/`, {}, 'test_groups', showError);
                setTestGroups(data);
            } catch (error) {
                console.error('Error fetching test groups:', error);
            }
        }
        fetchTestGroups();
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

    const executeCode = async () => {
        let fetchPromise;
        const groupId = (testGroups.find(testGroup => testGroup.name === group)).id;
    
        try {
            setLoading(true);
    
            if (!FreeForm) {
                fetchPromise = fetchWithErrorHandling(
                    `${environments[env].url}execute_q_function/?group_id=${groupId}&test_name=${functionalTest}`,
                    {},
                    'execute_q_function',
                    showError
                );
            } else {
                fetchPromise = fetchWithErrorHandling(
                    `${environments[env].url}execute_q_code/`,
                    {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ code: lines, group_id: groupId }),
                    },
                    'execute_q_code',
                    showError
                );
            }
    
            const data = await fetchPromise;
            setTestStatus(data.success);
            setMessage(data.message); // Update the message state
            setResponse(data.data); // Update the data state
            setShowResponse(data.data.length > 0);
        } catch (error) {
            console.error('Error:', error);
            setTestStatus(false);
            setMessage('Failed to execute code.');
            setResponse([]);
            setShowResponse(false);
        } finally {
            setLoading(false);
        }
    };
    
    const addTest = async () => {
        setShowResponse(false);
    
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
            group_id: selectedGroup.id,
            test_name: name,
            test_code: FreeForm ? lines.join('\n\n') : functionalTest, // Combine the lines into a single string
            dependencies: Object.values(linkedTests).map(test => test.test_case_id),
            free_form: FreeForm,
        };
    
        try {
            const data = await fetchWithErrorHandling(
                `${environments[env].url}add_test_case/`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(testData),
                },
                'add_test_case', // Endpoint identifier for error handling
                showError // Pass the error handling function
            );
    
            setTestStatus(true);
            setMessage(data.message);
        } catch (error) {
            console.error('Error:', error);
            setTestStatus(false);
            setMessage('Failed to add test case.');
        }
    };

    const handleLinkedTestChange = (event, newValue) => {
        // Avoid adding duplicates
        if (!linkedTests.some(test => test.test_case_id === newValue.test_case_id)) {
            const updatedLinkedTests = [...linkedTests, newValue];
            setLinkedTests(updatedLinkedTests);
        }
    };

    const handleFunctionalTestChange = async (event, newValue) => {
        setFunctionalTest(newValue);
        if (name === '') {
            setName(newValue);
        }
        if (newValue === '' || newValue == null) {
            setTestCode([''])
            setFunctionalTest(null)
            return
        }
        const groupId = (testGroups.find(testGroup => testGroup.name === group)).id;
        try {
            const data = await fetchWithErrorHandling(
                `${environments[env].url}view_test_code/?group_id=${groupId}&test_name=${newValue}`,
                {},
                'view_test_code',
                showError
            );
            if (data.success) {
                setTestCode(data.results.split('\n'))
            } else {
                setTestStatus(false)
                setMessage(data.message)
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    const removeLinkedTest = (testToDelete) => {
        const updatedTests = linkedTests.filter(test => test.test_case_id !== testToDelete.test_case_id);
        setLinkedTests(updatedTests);
    };

    const handleSwitchClick = () => {
        setFreeForm(!FreeForm);
        setTestStatus(null)
        setMessage('')
    };

    return (
        <>
            <Header title={"All Test Runs"} onClick={goToHomePage}/>
            <div style={{ marginTop: "100px", marginRight: "2%", display: 'flex', justifyContent: 'flex-end' }}>
                <FormControl variant="standard" sx={{ m: 1}} >
                    <Select
                        value={env}
                        label="env"
                        onChange={(event) => setEnv(event.target.value)}
                        style={{
                            backgroundColor: 'white',
                            borderRadius: 0,
                            fontFamily: 'Cascadia Code',
                            boxShadow: '0px 6px 9px rgba(0, 0, 0, 0.1)',
                            minWidth: '80px',
                        }}
                        MenuProps={{
                            PaperProps: {
                            style: {
                                backgroundColor: 'white', // Dropdown box color
                            }
                            }
                        }}
                        inputProps={{
                            style: {
                              height: '20px', // Adjust the height here
                              padding: '2px 5px', // Adjust the padding to control content space
                            },
                          }}
                        >
                        {Object.keys(environments).map((env) => (
                            <MenuItem
                                key={env}
                                value={env}
                                style={{fontFamily: 'Cascadia Code', display: 'flex', justifyContent: 'center', height: '25px' }}
                            >
                                {env}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </div>
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
                    setMessage={setMessage}
                    setTestStatus={setTestStatus}
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
