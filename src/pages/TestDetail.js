import React, { useState, useEffect, useCallback } from 'react';
import Header from '../components/Header/Header.js';
import CodeTerminal from '../components/CodeTerminal/CodeTerminal.js';
import CustomButton from '../components/CustomButton/CustomButton.js';
import { ReactComponent as RedCircle } from '../assets/red_circle.svg';
import { ReactComponent as GreenCircle } from '../assets/green_circle.svg';
import { useParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import './AddTest.css'
import Autocomplete from '@mui/material/Autocomplete';
import debounce from 'lodash.debounce';
import CircularProgress from '@mui/material/CircularProgress';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';

const ActionButtons = ({ onExecute, onAddTest }) => (
    <div className="actionButtons">
      <CustomButton onClick={onExecute}>Execute</CustomButton>
      <CustomButton onClick={onAddTest}>Edit Test</CustomButton>
    </div>
  );

  const TestDetail = () => {
    const { testId, date } = useParams();
    const [name, setName] = React.useState('');
    const [group, setGroup] = useState('');
    const [lines, setLines] = useState(['']); // Start with one empty line
    const [message, setMessage] = useState('');
    const [response, setResponse] = useState("");
    const [showResponse, setShowResponse] = useState(false);
    const [testStatus, setTestStatus] = useState(null);
    const [testData, setTestData] = useState({});
    const [testGroups, setTestGroups] = useState([]);
    const [testNames, setTestNames] = useState([]);
    const [testInputValue, setTestInputValue] = useState('');
    const [loading, setLoading] = useState(false);
    const [linkedTests, setLinkedTests] = useState([]);
    const navigate = useNavigate();
    
    useEffect(() => {
        if (date && testId) {
            // Adjust the date format before sending it to the API
            const formattedDate = date.replace(/\//g, '-');
            fetch(`http://127.0.0.1:5000/get_test_info/?date=${formattedDate}&test_id=${testId}`)
                .then(response => response.json())
                .then(data => {
                    setTestData(data);
                })
                .catch(error => console.error('Error fetching data:', error));
            }
    }, []);

    const goToGroupDetailPage = () => {
        navigate(`/testgroup/${"Trayport"}/${date.replace(/\//g, '-')}`);  // ***********  fix later
    }

    const nameChange = (event) => {
        setName(event.target.value);
    };

    const groupChange = (event) => {
        setGroup(event.target.value);
    };

    const executeCode = () => {
        fetch('http://127.0.0.1:5000/executeQcode/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ code: lines })
        })
        .then(response => response.json())
        .then(data => {
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
    
    const editTest = () => {
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
            test_code: lines.join(''), // Combine the lines into a single string
            expected_output: true // Adjust based on your requirements
        };
        
        fetch('http://127.0.0.1:5000/add_test_case/', {
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

    const fetchTestOptions = async (inputValue) => {
        setLoading(true);
        const response = await fetch(`http://127.0.0.1:5000/search_tests?query=${inputValue}&limit=10`);
        const data = await response.json();
        setTestNames(data.map(test => ({ id: test.id, test_name: test.test_name })));
        setLoading(false);
    };

    const debouncedFetchOptions = useCallback(debounce(fetchTestOptions, 300), []);

    const handleTestInputChange = (event, newTestInputValue) => {
        setTestInputValue(newTestInputValue);
        if (newTestInputValue.length > 0) {
            debouncedFetchOptions(newTestInputValue);
        } else {
            setTestNames([]);
        }
    };

    const handleLinkedTestChange = (event, newValues) => {
        setLinkedTests(newValues);
    };

    return (
        <>
            <Header title={"All Test Runs"} onClick={goToGroupDetailPage}/>
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
                <Autocomplete
                    multiple
                    id="test-search-dropdown"
                    options={testNames}
                    getOptionLabel={(option) => option.test_name}
                    value={linkedTests}
                    onChange={handleLinkedTestChange}
                    inputValue={testInputValue}
                    onInputChange={handleTestInputChange}
                    loading={loading}
                    renderInput={(params) => (
                        <TextField
                            {...params}
                            label="Add a Linked Test..."
                            variant="filled"
                            style={{
                                boxShadow: '0px 12px 18px rgba(0, 0, 0, 0.1)',
                                width: '250px'
                            }}
                            InputLabelProps={{
                                style: {
                                    fontFamily: 'Cascadia Code', // Set the font family of the label text
                                }
                            }}
                            InputProps={{
                                ...params.InputProps,
                                style: {
                                    backgroundColor: 'white',
                                    fontFamily: 'Cascadia Code',
                                },
                                endAdornment: (
                                    <>
                                        {loading ? <CircularProgress color="inherit" size={20} /> : null}
                                        {params.InputProps.endAdornment}
                                    </>
                                ),
                            }}
                        />
                    )}
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
            <ActionButtons onExecute={executeCode} onAddTest={editTest}/>
        </>
    )
};


export default TestDetail;
