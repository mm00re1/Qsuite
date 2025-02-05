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
import TripleSwitchButton from '../components/CustomButton/TripleSwitchButton';
import { useApi } from '../api/ApiContext'
import { subscribeToKdb } from '../utils/websocketHelper'
import Tooltip from '@mui/material/Tooltip'
import DeleteIcon from '@mui/icons-material/Delete'
import StorageIcon from '@mui/icons-material/Storage'
import MailIcon from '@mui/icons-material/Mail'

function DataFrameTable({ columns, rows, trimmed, numRows }) {
    return (
      <div style={{ width: "100%" }}>
        <table
          style={{
            border: "2px solid #0C0C0C",
            borderCollapse: "collapse",
            width: "100%",
            textAlign: "left",
          }}
        >
          <thead>
            <tr>
              {columns.map((col) => (
                <th
                  key={col}
                  style={{
                    border: "1px solid gray",
                    padding: "8px",
                  }}
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIndex) => (
              <tr key={rowIndex} style={{ borderBottom: "1px solid lightgray" }}>
                {columns.map((col) => (
                  <td
                    key={col}
                    style={{
                      border: "1px solid gray",
                      padding: "8px",
                    }}
                  >
                    {String(row[col])}
                  </td>
                ))}
              </tr>
            ))}
  
            {/* Show dots if the data has been trimmed */}
            {trimmed && (
              <tr>
                <td colSpan={columns.length} style={{ textAlign: "center", padding: "12px" }}>
                  <span style={{ fontSize: "24px" }}>...</span>
                </td>
              </tr>
            )}
            {trimmed && (
                <tr>
                    <td colSpan={columns.length} style={{ textAlign: "right", padding: "12px", fontWeight: "bold" }}>
                    Total rows: {numRows}
                    </td>
                </tr>
            )}
          </tbody>
        </table>
      </div>
    );
  }

  function QDictionaryTable({ data }) {
    // Find the longest key for alignment
    const longestKeyLength = data.reduce((max, item) => Math.max(max, item.key.length), 0);
  
    return (
      <div style={{ fontFamily: 'monospace' }}>
        {data.map((item, index) => {
          // Pad the key to align with the longest key length
          const paddedKey = item.key.padEnd(longestKeyLength, ' ');
  
          // Display the key-value pair with aligned "|"
          return (
            <div key={index}>
              {paddedKey} | {item.value}
            </div>
          );
        })}
      </div>
    );
  }

  
const AddTestPage = () => {
    const { env, environments } = useNavigation();
    const [name, setName] = React.useState('');
    const [group, setGroup] = useState('');
    const [lines, setLines] = useState(['']); // Start with one empty line
    const [message, setMessage] = useState('');
    const [response, setResponse] = useState({});
    const [showResponse, setShowResponse] = useState(false);
    const [testStatus, setTestStatus] = useState(null);
    const [testGroups, setTestGroups] = useState([]);
    const [linkedTests, setLinkedTests] = useState([]);
    const [testType, setTestType] = useState("Free-Form");
    const [functionalTest, setFunctionalTest] = useState(null);
    const [subscriptionTest, setSubscriptionTest] = useState(null);
    const [groupMissing, setGroupMissing] = useState(true);
    const [testCode, setTestCode] = useState(['']);
    const [loading, setLoading] = useState(false);
    const [isBaseEnv, setIsBaseEnv] = useState(false);
    const [numberOfMessages, setNumberOfMessages] = useState('1');
    const [subTimeout, setSubTimeout] = useState('30');
    const [subParams, setSubParams] = useState([]);
    const [ws, setWs] = useState(null)
    const navigate = useNavigate();
    const { fetchData, isAuthenticated, isLoading } = useApi()


    useEffect(() => {
        async function fetchTestGroups() {
            if (!environments[env] || !environments[env].url) {
                // If there's no environment set yet, just return.
                return;
            }
            try {
                const data = await fetchData(`${environments[env].url}/test_groups/`, {}, 'test_groups');
                setTestGroups(data);
            } catch (error) {
                console.error('Error fetching test groups:', error);
            }
        }
        const envOrder = ['DEV', 'TEST', 'PROD'];
        const orderedEnvs = envOrder.filter(e => environments.hasOwnProperty(e));
        const isBaseEnv = orderedEnvs[0] === env;
        setIsBaseEnv(isBaseEnv);
        if (!isLoading && isAuthenticated) {
            fetchTestGroups()
        }
    }, [isLoading, isAuthenticated, environments]);

    // Cleanup the WebSocket on unmount
    useEffect(() => {
        return () => {
        if (ws) {
            ws.close();
        }
        };
    }, [ws]);

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
        setShowResponse(false)
        let fetchPromise;
        const groupId = (testGroups.find(testGroup => testGroup.name === group)).id;
    
        try {
            setLoading(true);
    
            if (testType === "Functional") {
                fetchPromise = fetchData(
                    `${environments[env].url}/execute_q_function/?group_id=${groupId}&test_name=${functionalTest}`,
                    {},
                    'execute_q_function'
                );
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
                // necessary data for the url params will be in subParams. Example subParams values ["trade", "TSLA"]
                // websocket should stay open till "numberOfMessages" are received or "subTimeout" is passed (max num of secs to allow for test)
    
            const data = await fetchPromise;
            setTestStatus(data.success);
            setMessage(data.message); // Update the message state
            setShowResponse(data.type === "dataframe" || data.data.length > 0);
            // Check type to decide how to display
            if (data.type === "dataframe") {
                // response.data might look like { columns: [...], rows: [...] }
                setResponse({
                type: "dataframe",
                columns: data.data.columns,
                rows: data.data.rows,
                trimmed: data.data.trimmed,
                num_rows: data.data.num_rows
                });
            } else {
                setResponse({
                type: data.type,
                data: data.data
                });
            }
            console.log("response: ",response)
            //setResponse(data.data); // Update the data state
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
        console.log(wsMessage)
        setShowResponse(true)
        setResponse({
            type: "dataframe",
            columns: wsMessage.columns,
            rows: wsMessage.rows,
            trimmed: wsMessage.trimmed,
            num_rows: wsMessage.num_rows
        })
    }

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
            id: crypto.randomUUID(),
            group_id: selectedGroup.id,
            test_name: name,
            test_code: (testType === "Free-Form") ? lines.join('\n\n') : functionalTest, // Combine the lines into a single string
            dependencies: Object.values(linkedTests).map(test => test.test_case_id),
            free_form: (testType === "Free-Form"),
        };
    
        try {
            const data = await fetchData(
                `${environments[env].url}/upsert_test_case/`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(testData),
                },
                'upsert_test_case' // Endpoint identifier for error handling
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
            const data = await fetchData(
                `${environments[env].url}/view_test_code/?group_id=${groupId}&test_name=${newValue}`,
                {},
                'view_test_code'
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

    const handleSubTestChange = async (event, newValue) => {
        if (name === '') {
            setName(newValue);
        }
        if (newValue === '') {
            setSubscriptionTest(null)
        } else {
            setSubscriptionTest(newValue)
        }
    }

    const removeLinkedTest = (testToDelete) => {
        const updatedTests = linkedTests.filter(test => test.test_case_id !== testToDelete.test_case_id);
        setLinkedTests(updatedTests);
    };

    const handleSwitchClick = (test_type) => {
        setTestType(test_type)
        setTestStatus(null)
        setMessage('')
        setShowResponse(false)
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
            <div style={{
                marginTop: "90px",
                marginRight: "2%",
                display: 'flex',
                justifyContent: 'flex-end',
                fontFamily: 'Cascadia Code',
                color: '#A0A0A0'
            }}>
                {env}
            </div>
            <div className="AddTestFields">
                <div style={{ maxHeight: '57px' }}>
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
                <TripleSwitchButton
                    leftMessage={"Free-Form"}
                    middleMessage={"Functional"}
                    rightMessage={"Subscription"}
                    onClick={handleSwitchClick}
                />
            </div>
            {((testType === "Free-Form")) && (
                <CodeTerminal lines={lines} onLinesChange={setLines} />
            )}
            {(testType === "Functional") && (
                <div style={{ marginLeft: '5%', marginTop: '20px' }}>
                <SearchFunctionalTests
                    selectedTest={functionalTest}
                    all_tests={"all_functional_tests"}
                    search_tests={'search_functional_tests'}
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
            {(((testType === "Functional")) && (Array.isArray(testCode) && (testCode.length !== 1 || testCode[0] !== ''))) && (
                <CodeDisplay lines={testCode} />
            )}
            {(testType === "Subscription") && (
                <>
                <div style={{ marginLeft: '5%', marginTop: '20px', display: 'flex', gap: '20px' }}>
                    <SearchFunctionalTests
                        selectedTest={subscriptionTest}
                        all_tests={"all_subscription_tests"}
                        search_tests={'search_subscription_tests'}
                        group={group}
                        testGroups={testGroups}
                        handleTestChange={handleSubTestChange}
                        message={"q subscription"}
                        groupMissing={groupMissing}
                        setMessage={setMessage}
                        setTestStatus={setTestStatus}
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
                        maxWidth: '58.5%',
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
                        <DataFrameTable columns={response.columns} rows={response.rows} trimmed={response.trimmed} numRows={response.num_rows} />
                    )}
                    {response && response.type === "string" && (
                        JSON.stringify(response.data, null, 2)
                    )}
                </div>
            )}
            <div className="actionButtons">
                <CustomButton onClick={executeCode} disabled={groupMissing}>Execute</CustomButton>
                <CustomButton onClick={addTest} disabled={groupMissing || !isBaseEnv}>Save Test</CustomButton>
                {((testType === "Free-Form") && groupMissing && (Array.isArray(lines) && (lines.length !== 1 || lines[0] !== ''))) && (
                    <Typography color="error" style={{ marginTop: '10px', fontFamily: 'Cascadia Code' }}>
                        A group must be selected to execute q code.
                    </Typography>
                )}
            </div>
        </>
    )
};

export default AddTestPage;
