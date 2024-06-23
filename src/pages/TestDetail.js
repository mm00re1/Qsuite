import React, { useState, useEffect } from 'react';
import Header from '../components/Header/Header.js';
import CodeTerminal from '../components/CodeTerminal/CodeTerminal.js';
import CustomButton from '../components/CustomButton/CustomButton.js';
import { ReactComponent as RedCircle } from '../assets/red_circle.svg';
import { ReactComponent as GreenCircle } from '../assets/green_circle.svg';
import { useParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import SingleTestHistoryChart from '../components/SingleTestHistoryChart/SingleTestHistoryChart.js';
import DynamicTable from '../components/DynamicTable/DynamicTable.js';
import BackButton from '../components/BackButton/BackButton.js';
import { useNavigation } from '../TestNavigationContext'; // Adjust the path as necessary
import CustomSwitchButton from '../components/CustomButton/CustomSwitchButton.js';
import MultiDropdown from '../components/MultiDropdown/MultiDropdown.js';
import './AddTest.css'


const ActionButtons = ({ onExecute, onAddTest }) => (
    <div className="actionButtons">
      <CustomButton onClick={onExecute}>Execute</CustomButton>
      <CustomButton onClick={onAddTest}>Push Changes</CustomButton>
    </div>
  );

  const TestDetail = () => {
    const { testId, date } = useParams();
    const { testHistory, addTestToHistory, removeLastTestFromHistory } = useNavigation();

    const [name, setName] = React.useState('');
    const [group, setGroup] = useState('');
    const [lines, setLines] = useState(['']); // Start with one empty line
    const [message, setMessage] = useState('');
    const [response, setResponse] = useState("");
    const [showResponse, setShowResponse] = useState(false);
    const [testStatus, setTestStatus] = useState(null);
    const [testData, setTestData] = useState({});
    const [testGroups, setTestGroups] = useState([]);
    const [linkedTests, setLinkedTests] = useState([]);
    const [columnList, setColumnList] = useState([]);
    const [tableData, setTableData] = useState([]);
    const [showingStatusHistory, setShowingStatusHistory] = useState(true);
    const navigate = useNavigate();
    
    const fetchTestGroups = () => {
        fetch('http://127.0.0.1:5000/test_groups/')
            .then(response => response.json())
            .then(data => {
                setTestGroups(data);
            })
            .catch(error => console.error('Error fetching test groups:', error));
    };

    const fetchTestData = (date, testId) => {
        if (date && testId) {
            const formattedDate = date.replace(/\//g, '-');
            fetch(`http://127.0.0.1:5000/get_test_info/?date=${formattedDate}&test_id=${testId}`)
                .then(response => response.json())
                .then(data => {
                    setTestData(data);
                    setGroup(data.group_name);
                    setName(data.test_name);
                    setLinkedTests(data.dependent_tests);
                    setLines(data.test_code.split('\n\n'));
                    setColumnList(data.dependent_tests_columns);
                    setTableData(data.dependent_tests);
                })
                .catch(error => console.error('Error fetching data:', error));
        }
    };

    const addTestToContext = (testId) => {
        addTestToHistory(testId);
    };
    
    useEffect(() => {
        fetchTestGroups();
        addTestToHistory(testId);
        fetchTestData(date, testId);
    }, [testId, date]);

    const handleTestNameClick = (test_case_id, dt) => {
        addTestToHistory(testId);
        navigate(`/testdetail/${test_case_id}/${dt}`);

    };

    const goToPrevTestPage = () => {
        removeLastTestFromHistory();
        if (testHistory.length > 1) {
            navigate(`/testdetail/${testHistory[testHistory.length - 2]}/${date.replace(/\//g, '-')}`);
        }
    };

    const goToGroupDetailPage = () => {
        navigate(`/testgroup/${date.replace(/\//g, '-')}`);
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

        const editedTestData = {
            group_id: selectedGroup.id, // Use the ID instead of the name
            test_name: name,
            id: testData.id,
            test_code: lines.join('\n\n'), // Combine the lines into a single string
            expected_output: true, // Adjust based on your requirements
            dependencies: Object.values(linkedTests).map(test => test.test_case_id)
        };
        
        fetch('http://127.0.0.1:5000/edit_test_case/', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(editedTestData)
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

    const removeLinkedTest = (testToDelete) => {
        const updatedTests = linkedTests.filter(test => test.test_case_id !== testToDelete.test_case_id);
        console.log(updatedTests);
        setLinkedTests(updatedTests);
    };

    const handleSwitchClick = () => {
        setShowingStatusHistory(!showingStatusHistory);
    };

    return (
        <>
            <Header title={"All Test Runs"} onClick={goToGroupDetailPage}/>
            {(testHistory.length > 1) && (
                <div className="prev-test">
                <BackButton title={"Previous Test"} onClick={goToPrevTestPage} textColor={'#3E0A66'} fontSize={'16px'} />
              </div>
            )}
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
                <MultiDropdown
                    linkedTests={linkedTests}
                    handleLinkedTestChange={handleLinkedTestChange}
                    removeLinkedTest={removeLinkedTest}
                />
            </div>
            <div className="switchButton-TestDetail">
                <CustomSwitchButton
                    leftMessage={"Status"}
                    rightMessage={"Time Taken"}
                    onClick={handleSwitchClick}
                />
            </div>
            <SingleTestHistoryChart
                x_values={testData.last_30_days_dates}
                y_values={showingStatusHistory ? testData.last_30_days_statuses: testData.last_30_days_timeTaken}
                statusHistory={showingStatusHistory}
            />
            {!(tableData.length === 0) && (
                <div className="tableContainer">
                    <DynamicTable
                        columnList={columnList}
                        data={tableData}
                        showCircleButton={false}
                        currentDate={date}
                        onTestNameClick={handleTestNameClick}
                    />
                </div>
            )}
            <div style={{marginBottom: '100px'}} />
            {(!(testData.pass_status !== null ? testData.pass_status : true)) && (
                <div
                    style={{
                        display: 'inline-flex',    // Changed to flex to enable flexbox properties
                        alignItems: 'center', 
                        padding: '10px 50px 10px 10px',
                        backgroundColor: '#0C0C0C',
                        color: '#FF4242',
                        borderRadius: '6px',
                        font: 'Cascadia Code',
                        marginLeft: '5%',
                        marginTop: '40px',
                        marginBottom: '20px',
                        fontSize: '17px',
                        boxShadow: '0px 24px 36px rgba(0, 0, 0, 0.2)',
                        }}
                >
                    {(
                        <>
                        <RedCircle style={{ width: '33px', height: '33px' }} />
                        <span style={{ marginLeft: '10px' }}>{"[Previous Error] "} {testData.error_message}</span>
                        </>
                    )}
                </div>
            )}
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
