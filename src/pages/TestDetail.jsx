import React, { useState, useEffect } from 'react';
import Header from '../components/Header/Header';
import CodeTerminal from '../components/CodeTerminal/CodeTerminal';
import CodeDisplay from '../components/CodeDisplay/CodeDisplay';
import CustomButton from '../components/CustomButton/CustomButton';
import RedCircle from '../assets/red_circle.svg?react'
import KdbQueryStatus from '../components/KdbQueryStatus/KdbQueryStatus';
import { useParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import SingleTestHistoryChart from '../components/Charts/SingleTestHistoryChart';
import DynamicTable from '../components/DynamicTable/DynamicTable';
import BackButton from '../components/BackButton/BackButton';
import { useNavigation } from '../TestNavigationContext'; // Adjust the path as necessary
import CustomSwitchButton from '../components/CustomButton/CustomSwitchButton';
import SearchTests from '../components/SearchTests/SearchTests';
import './AddTest.css'
import { fetchWithErrorHandling } from '../utils/api'
import { useError } from '../ErrorContext.jsx'

const ActionButtons = ({ onExecute, onAddTest }) => (
    <div className="actionButtons">
      <CustomButton onClick={onExecute}>Execute</CustomButton>
      <CustomButton onClick={onAddTest}>Push Changes</CustomButton>
    </div>
  );

  const TestDetail = () => {
    const { groupId, testId, date } = useParams();
    const { env, setEnv, environments, testHistory, addTestToHistory, removeLastTestFromHistory } = useNavigation();

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
    const [FreeForm, setFreeForm] = useState(true);
    const [functionalTest, setFunctionalTest] = useState('');
    const [testCode, setTestCode] = useState(['']);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { showError } = useError()
    
    const fetchTestGroupsAndData = async (date, testId) => {
        try {
            const testGroupsData = await fetchWithErrorHandling(`${environments[env].url}test_groups/`, {}, 'test_groups', showError);
            setTestGroups(testGroupsData);
            if (date && testId) {
                const formattedDate = date.replace(/\//g, '-');
                const testData = await fetchWithErrorHandling(`${environments[env].url}get_test_info/?date=${formattedDate}&test_id=${testId}`, {}, 'get_test_info', showError)
                setTestData(testData);
                setGroup(testData.group_name);
                setName(testData.test_name);
                setFreeForm(testData.free_form);
                setLinkedTests(testData.dependent_tests);
                setLines(testData.test_code.split('\n\n'));
                setFunctionalTest(testData.free_form ? '' : testData.test_code);
                setColumnList(testData.dependent_tests_columns);
                setTableData(testData.dependent_tests);

                if (!testData.free_form) {
                    const groupId = (testGroupsData.find(testGroup => testGroup.name === testData.group_name)).id;
                    const testCodeData = await fetchWithErrorHandling(`${environments[env].url}view_test_code/?group_id=${groupId}&test_name=${testData.test_code}`, {}, 'view_test_code', showError)
                    if (testCodeData.success) {
                        setTestCode(testCodeData.results.split('\n'))
                    } else {
                        setTestStatus(false)
                        setMessage(testCodeData.message)
                    }
                }
            }

        } catch (error) {
            console.error('Error fetching test data:', error);
        }
    };

    const addTestToContext = (testId) => {
        addTestToHistory(testId);
    };
    
    useEffect(() => {
        fetchTestGroupsAndData(date, testId);
        addTestToHistory(testId);
    }, [testId, date, env]);

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
        navigate(`/testgroup/${groupId}`);
    }

    const nameChange = (event) => {
        setName(event.target.value);
    };

    const groupChange = (event) => {
        setGroup(event.target.value);
    };

    const executeCode = async () => {
        let fetchPromise;
        const groupId = (testGroups.find(testGroup => testGroup.name === group)).id;

        try {
            setLoading(true);
            if (!FreeForm) {
                fetchPromise = fetchWithErrorHandling(
                    `${environments[env].url}execute_q_function/?group_id=${groupId}&test_name=${functionalTest}`),
                    {},
                    'execute_q_function',
                    showError
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
    
    const editTest = async () => {
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
            test_code: FreeForm ? lines.join('\n\n') : functionalTest, // Combine the lines into a single string
            dependencies: Object.values(linkedTests).map(test => test.test_case_id)
        };
        
        try {
            const data = await fetchWithErrorHandling(
                `${environments[env].url}edit_test_case/`,
                {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(editedTestData),
                },
                'edit_test_case', // Endpoint identifier for error handling
                showError // Pass the error handling function
            );
    
            setTestStatus(true);
            setMessage(data.message);
        } catch (error) {
            console.error('Error:', error);
            setTestStatus(false);
            setMessage('Failed to edit test case.');
        }
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
                <div className="tableContainerLinkedTests">
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
            {(!((testData.pass_status !== null && testData.pass_status !== undefined) ? testData.pass_status : true)) && (
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
                            <span style={{ marginLeft: '10px' }}>
                                {`[Error on ${date.replace(/\//g, '-')} ] ${testData.error_message}`}
                            </span>
                        </>
                    )}
                </div>
            )}
            {(FreeForm) && (
                <CodeTerminal lines={lines} onLinesChange={setLines} />
            )}
            {(!FreeForm) && (
                <>
                <div style={{marginLeft: '5%' }}>
                    <TextField
                        label="q Function"
                        variant="filled"
                        value={functionalTest}
                        disabled
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
                <CodeDisplay lines={testCode} />
                </>
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
