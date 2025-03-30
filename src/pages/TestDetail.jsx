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
import { subscribeToKdb } from '../utils/websocketHelper'
import DataFrameTable from '../components/KdbDataDisplay/DataFrameTable';
import QDictionaryTable from '../components/KdbDataDisplay/QDictionaryTable';
import Tooltip from '@mui/material/Tooltip'
import DeleteIcon from '@mui/icons-material/Delete'
import './AddTest.css'
//import { useTestData } from '../contexts/TestDataContext'
import { useApi } from '../api/ApiContext'

  const TestDetail = () => {
    const { groupId, testCaseId, testResultId, date } = useParams();
    const { env, environments, testHistory, addTestToHistory, removeLastTestFromHistory } = useNavigation();
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
    const [testType, setTestType] = useState("Free-Form");
    const [functionalTest, setFunctionalTest] = useState('');
    const [testCode, setTestCode] = useState(['']);
    const [loading, setLoading] = useState(false);
    const [isBaseEnv, setIsBaseEnv] = useState(false);
    const [numberOfMessages, setNumberOfMessages] = useState('1');
    const [subTimeout, setSubTimeout] = useState('30');
    const [subParams, setSubParams] = useState([]);
    const [subscriptionTest, setSubscriptionTest] = useState(null);
    const navigate = useNavigate();
    const { fetchData, isAuthenticated, isLoading } = useApi()


    const fetchTestData = async (date, testCaseId, testResultId, testGroupsData) => {
        const formattedDate = date.replace(/\//g, '-');
        let url = `${environments[env].url}/get_test_info/?date=${formattedDate}&test_id=${testCaseId}`;

        if (testResultId && (testResultId !== 'none') && (testResultId !== "null")) {
            url += `&test_result_id=${testResultId}`;
        }
        const testData = await fetchData(url, {}, 'get_test_info');
        setTestData(testData);
        setGroup(testData.group_name);
        setName(testData.test_name);
        setTestType(testData.test_type);
        setLinkedTests(testData.dependent_tests);
        setColumnList(testData.dependent_tests_columns);
        setTableData(testData.dependent_tests);
        if (testData.test_type === "Free-Form") {
            setLines(testData.test_code.split('\n\n'));
        } else if (testData.test_type === "Functional") {
            setFunctionalTest((testData.test_type === "Functional") ? testData.test_code : '');
            const groupId = (testGroupsData.find(testGroup => testGroup.name === testData.group_name)).id;
            const testCodeData = await fetchData(`${environments[env].url}/view_test_code/?group_id=${groupId}&test_name=${testData.test_code}`, {}, 'view_test_code');
            if (testCodeData.success) {
                setTestCode(testCodeData.results.split('\n'));
            } else {
                setTestStatus(false);
                setMessage(testCodeData.message);
            }
        } else if (testData.test_type === "Subscription") {
            let parsedData = JSON.parse(testData.test_code);
            console.log("parsedData: ", parsedData);
            setSubParams(parsedData.subParams);
            setSubscriptionTest(parsedData.subscriptionTest);
            setNumberOfMessages(parsedData.numberOfMessages);
            setSubTimeout(parsedData.subTimeout);
        }
    };

    const fetchTestGroupsAndData = async (date, testCaseId, testResultId) => {
        try {
            const testGroupsData = await fetchData(`${environments[env].url}/test_groups/`, {}, 'test_groups');
            setTestGroups(testGroupsData);
            if (date && testCaseId) {
                await fetchTestData(date, testCaseId, testResultId, testGroupsData);
            }
        } catch (error) {
            console.error('Error fetching test data:', error);
        }
    };

    useEffect(() => {
        // order environments in the order ['DEV', 'TEST', 'PROD'] and then set isBaseEnv to true if the current env is the first one
        const envOrder = ['DEV', 'TEST', 'PROD'];
        const orderedEnvs = envOrder.filter(e => environments.hasOwnProperty(e));
        const baseEnv = orderedEnvs[0] === env;
        setIsBaseEnv(baseEnv);
        if (!isLoading && isAuthenticated) {
            fetchTestGroupsAndData(date, testCaseId, testResultId);
            addTestToHistory(testResultId === 'none' ? testCaseId : testResultId); // Use testCaseId if no result
        }
    }, [testCaseId, testResultId, date, env, isLoading]);

    const handleTestNameClick = (test_result_id, dt) => {
        addTestToHistory(test_result_id);
        navigate(`/testdetail/${groupId}/${testCaseId}/${test_result_id}/${dt}`);
    };

    const goToPrevTestPage = () => {
        removeLastTestFromHistory();
        if (testHistory.length > 1) {
            const prevTestId = testHistory[testHistory.length - 2];
            navigate(`/testdetail/${groupId}/${testCaseId}/${prevTestId}/${date.replace(/\//g, '-')}`);
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
        setShowResponse(false)
        let fetchPromise;
        const groupId = (testGroups.find(testGroup => testGroup.name === group)).id;

        try {
            setLoading(true);
            if (testType === "Functional") {
                fetchPromise = fetchData(
                    `${environments[env].url}/execute_q_function/?group_id=${groupId}&test_name=${functionalTest}`),
                    {},
                    'execute_q_function'
                } else if (testType === "Free-Form") {
                fetchPromise = fetchData(
                    `${environments[env].url}/execute_q_code/`,
                    {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ code: lines, group_id: groupId }),
                    },
                    'execute_q_code'
                );
            } else if (testType === "Subscription") {
                // We'll call our helper to open the WebSocket and wait.
                const wsResult = await subscribeToKdb(
                  environments[env].url, // baseUrl
                  groupId,
                  subParams,
                  numberOfMessages,
                  subTimeout,
                  onMessageHandler,
                  subscriptionTest
                );
          
                // Mimic how you handle the fetch response
                setTestStatus(wsResult.success);
                setMessage(wsResult.message);
                // Once done, we return here (or continue logic).
                return;
            }
    
            const data = await fetchPromise;
            setTestStatus(data.success);
            setMessage(data.message); // Update the message state
            setShowResponse(data.data.length > 0);
            if (data.type === "dataframe") {
                // response.data might look like { columns: [...], rows: [...] }
                setResponse({
                type: "dataframe",
                columns: data.data.columns,
                rows: data.data.rows,
                trimmed: data.data.trimmed,
                num_rows: data.data.num_rows,
                use_flash: false
                });
            } else {
                setResponse({
                type: data.type,
                data: data.data
                });
            }
        } catch (error) {
            console.error('Error:', error);
            setTestStatus(false);
            setMessage('Failed to execute code.');
            setResponse(null);
            setShowResponse(false);
        } finally {
            setLoading(false);
        }
    };
   
    const onMessageHandler = (wsMessage) => {
        setShowResponse(true)
        setResponse({
            type: "dataframe",
            columns: wsMessage.columns,
            rows: wsMessage.rows,
            trimmed: wsMessage.trimmed,
            num_rows: wsMessage.num_rows,
            use_flash: true
        })
    }

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

        let test_code_formatted = "";
        if (testType === "Functional") {
                test_code_formatted = functionalTest

        } else if (testType === "Free-Form") {
            test_code_formatted = lines.join('\n\n')

        } else if (testType === "Subscription") {
            const config = {
                // The inputs you need for your subscription
                subParams,
                subscriptionTest,
                numberOfMessages,
                subTimeout
            };
            test_code_formatted = JSON.stringify(config)
        }

        const editedTestData = {
            group_id: selectedGroup.id, // Use the ID instead of the name
            test_name: name,
            id: testData.id,
            test_type: testType, // "Functional" | "Free-Form" | "Subscription"
            test_code: test_code_formatted,
            dependencies: Object.values(linkedTests).map(test => test.test_case_id)
        };
        
        try {
            const data = await fetchData(
                `${environments[env].url}/upsert_test_case/`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(editedTestData),
                },
                'upsert_test_case' // Endpoint identifier for error handling
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

    const handleAddSubParam = () => {
        setSubParams((oldSubParams) => [...oldSubParams, ''])
      }

    const handleSubParamChange = (index, value) => {
        const newParams = [...subParams];
        newParams[index] = value;
        setSubParams(newParams);
    }

    const handleRemoveSubParam = (indexToRemove) => {
        setSubParams((oldParams) => 
          oldParams.filter((_, idx) => idx !== indexToRemove)
        );
    }

    return (
        <>
            <Header/>
            {(testHistory.length > 1) ? (
                <div style={{marginTop: "100px", marginLeft: "20px" }}>
                <BackButton title={"Previous Test"} onClick={goToPrevTestPage} textColor={'#3E0A66'} fontSize={'16px'} />
              </div>
            ) : (
                <div style={{ marginTop: "100px" }}/>
            )}
            <div style={{
                marginRight: "2%",
                display: 'flex',
                justifyContent: 'flex-end',
                fontFamily: 'Cascadia Code',
                color: '#A0A0A0'
            }}>
                {env}
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
                    disabled
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
            {(testType === "Free-Form") && (
                <CodeTerminal lines={lines} onLinesChange={setLines} />
            )}
            {(testType === "Functional") && (
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
            {(testType === "Subscription") && (
                <>
                <div style={{ marginLeft: '5%', display: 'flex', gap: '20px' }}>
                    <TextField
                        label="q Subscription"
                        variant="filled"
                        value={subscriptionTest}
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
                    <TextField
                        label="Number of messages"
                        variant="filled"
                        type="number"
                        value={numberOfMessages}
                        onChange={(e) => setNumberOfMessages(e.target.value)}
                        InputProps={{
                            inputProps: { min: 1 }, // restrict to non-negative
                            style: {
                            backgroundColor: 'white',
                            fontFamily: 'Cascadia Code',
                            },
                        }}
                        InputLabelProps={{
                            style: { fontFamily: 'Cascadia Code' },
                        }}
                        style={{
                            boxShadow: '0px 12px 18px rgba(0, 0, 0, 0.1)',
                            minWidth: '250px',
                            maxHeight: '56px'
                        }}
                    />
                    <TextField
                        label="Timeout (sec)"
                        variant="filled"
                        type="number"
                        value={subTimeout}
                        onChange={(e) => setSubTimeout(e.target.value)}
                        InputProps={{
                            inputProps: { min: 0, max: 300 }, // restrict to non-negative
                            style: {
                            backgroundColor: 'white',
                            fontFamily: 'Cascadia Code',
                            },
                        }}
                        InputLabelProps={{
                            style: { fontFamily: 'Cascadia Code' },
                        }}
                        style={{
                            boxShadow: '0px 12px 18px rgba(0, 0, 0, 0.1)',
                            minWidth: '250px',
                            maxHeight: '56px'
                        }}
                    />
                </div>
                <div style={{ marginLeft: '7%', marginTop: '20px' }}>
                    {subParams.map((param, index) => (
                        <div 
                            key={index}
                            style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            maxHeight: '57px', 
                            marginBottom: '5px',
                            gap: '8px', // adds a small space between TextField and icon 
                            }}
                        >
                        <TextField
                          label={`Param ${index + 1}`}
                          variant="filled"
                          value={param}
                          onChange={(e) => handleSubParamChange(index, e.target.value)}
                          style={{
                            boxShadow: '0px 12px 18px rgba(0, 0, 0, 0.1)',
                            minWidth: '250px',
                          }}
                          InputLabelProps={{
                            style: {
                              fontFamily: 'Cascadia Code', 
                            },
                          }}
                          InputProps={{
                            style: {
                              backgroundColor: 'white',
                              fontFamily: 'Cascadia Code',
                            },
                          }}
                        />
                        <Tooltip title="Delete Param" arrow>
                          <DeleteIcon
                            onClick={() => handleRemoveSubParam(index)}
                            style={{
                              cursor: 'pointer',
                              fontSize: '26px',
                            }}
                          />
                        </Tooltip>
                      </div>
                    ))}
                    <CustomButton 
                        height={0.7} 
                        width={0.8} 
                        onClick={handleAddSubParam}
                        >
                        + Param
                    </CustomButton>
                </div>
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
                    {response.type === "dictionary" && (
                        <QDictionaryTable data={response.data} />
                    )}
                    {response && response.type === "dataframe" && (
                        <DataFrameTable columns={response.columns} rows={response.rows} trimmed={response.trimmed} numRows={response.num_rows} useFlash={response.use_flash} />
                    )}
                    {response && response.type === "string" && (
                        JSON.stringify(response.data, null, 2)
                    )}
                </div>
            )}
            <div className="actionButtons">
                <CustomButton onClick={executeCode}>Execute</CustomButton>
                <CustomButton disabled={!isBaseEnv} onClick={editTest}>Push Changes</CustomButton>
            </div>
        </>
    )
};


export default TestDetail;
