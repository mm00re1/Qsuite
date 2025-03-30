import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import dayjs from 'dayjs';
import Header from '../components/Header/Header';
import DynamicTable from '../components/DynamicTable/DynamicTable';
import { useNavigation } from '../TestNavigationContext'; // Adjust the path as necessary
import './TestGroupDetail.css';
import { useError } from '../ErrorContext.jsx'
import { useParams } from 'react-router-dom';
import ReleaseEnvPipeline from '../components/ReleaseEnvPipeline'
import NotificationPopup from '../components/NotificationPopup/NotificationPopup'
import ConfirmationPopup from '../components/ConfirmationPopup/ConfirmationPopup'
import { useApi } from '../api/ApiContext'

const Release = () => {
    const { globalDt, setGlobalDt, env, environments } = useNavigation();
    const navigate = useNavigate();
    const { groupId } = useParams();
    const [testGroupId, setTestGroupId] = useState(groupId);
    const [testGroup, setTestGroup] = useState('');
    const [testGroups, setTestGroups] = useState([]);
    const [tableData, setTableData] = useState([]);
    const [columnList, setColumnList] = useState(["Test Name", "Creation Date", "Release Status"]);
    const [selectedTests, setSelectedTests] = useState([]);
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [notification, setNotification] = useState(null)
    const [notificationSuccess, setNotificationSuccess] = useState(true)
    const [releaseEnvironments, setReleaseEnvironments] = useState({});
    const [releaseEnv, setReleaseEnv] = useState(null);
    const [environmentTarget, setEnvironmentTarget] = useState(null);
    const [selectAll, setSelectAll] = useState(false);
    const [loading, setLoading] = useState(false);
    const { showError } = useError()
    const { fetchData, isAuthenticated, isLoading } = useApi()


    async function fetchTestGroups(baseEnv) {
        try {
            const data = await fetchData(`${environments[baseEnv].url}/test_groups/`, {}, 'test_groups')
            setTestGroups(data)
            setTestGroup(data.find(group => group.id === testGroupId).name)
        } catch (error) {
            console.error('Error fetching test groups:', error)
        }
    }

    const handleTargetEnvFetchError = (endpoint, errorMessage) => {
        console.log("custom error message: ", errorMessage)
        // if "TestGroup not found" is in the error message, show popup with message "TestGroup not found"
        if (errorMessage.includes("TestGroup not found")) {
            showPopupWithMessage("Test group not found in target environment. You can add it on the test group config page", false)
            return
        }
        showError(endpoint, errorMessage)
    }

    const fetchReleaseTests = async (group_id, baseEnv, targetEnv) => {
        try {
            if (baseEnv && targetEnv) {
                const baseData = await fetchData(
                    `${environments[baseEnv].url}/get_tests_per_group/?group_id=${group_id}`,
                    {},
                    'get_tests_per_group'
                );

                const targetData = await fetchData(
                    `${environments[targetEnv].url}/get_tests_per_group/?group_id=${group_id}`,
                    {},
                    'get_tests_per_group',
                    handleTargetEnvFetchError
                );

                const baseTestMap = new Map(baseData.test_data.map(item => [item.test_case_id, item]));
                const targetTestMap = new Map(targetData.test_data.map(item => [item.test_case_id, item]));
                
                let filteredData = baseData.test_data.map(baseItem => {
                    const targetItem = targetTestMap.get(baseItem.test_case_id);
                    let releaseStatus = "NEW";
                    
                    if (targetItem) {
                        if (baseItem['Test Name'] !== targetItem['Test Name']) {
                            releaseStatus = "Test name changed";
                        } else if (baseItem.test_code !== targetItem.test_code) {
                            releaseStatus = "Test code changed";
                        } else if (JSON.stringify(baseItem.dependencies) !== JSON.stringify(targetItem.dependencies)) {
                            releaseStatus = "Dependencies changed";
                        } else {
                            return null; // No changes, don't include in filtered data
                        }
                    }

                    return {
                        'test_case_id': baseItem.test_case_id,
                        'id': 'none',
                        'free_form': baseItem.free_form,
                        'test_code': baseItem.test_code,
                        'dependencies': baseItem.dependencies,
                        'Test Name': baseItem['Test Name'],
                        'Creation Date': baseItem['Creation Date'] ? baseItem['Creation Date'].split('T')[0] : null,
                        'Release Status': releaseStatus,
                        'Selected': false,
                        'Status': null
                    };
                }).filter(Boolean); // Remove null entries

                // Add tests that exist in targetData but not in baseData
                const deletedTests = targetData.test_data.filter(targetItem => !baseTestMap.has(targetItem.test_case_id))
                    .map(targetItem => ({
                        'test_case_id': targetItem.test_case_id,
                        'free_form': targetItem.free_form,
                        'test_code': targetItem.test_code,
                        'dependencies': targetItem.dependencies,
                        'Test Name': targetItem['Test Name'],
                        'Creation Date': targetItem['Creation Date'] ? targetItem['Creation Date'].split('T')[0] : null,
                        'Release Status': "Deleted",
                        'Selected': false,
                        'Status': null
                    }));

                // Append deletedTests to filteredData
                filteredData = [...filteredData, ...deletedTests];

                setTableData(filteredData);
                if (filteredData.length === 0) {
                    showPopupWithMessage(`${targetEnv} is up to date with ${baseEnv}. No new or changed tests to release`, true)
                }
            } else {
                showPopupWithMessage("You have only 1 environment configured, there is no environment to release into", false);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    useEffect(() => {
        const envOrder = ['DEV', 'TEST', 'PROD'];
        const orderedEnvs = envOrder.filter((e) => environments.hasOwnProperty(e));
        console.log("orderedEnvs: ", orderedEnvs)
        // Drop the last key if there is more than one environment
        const releaseEnvsKeys =
          orderedEnvs.length > 1 ? orderedEnvs.slice(0, -1) : orderedEnvs;
        const releaseEnvs = releaseEnvsKeys.reduce((acc, key) => {
          acc[key] = environments[key];
          return acc;
        }, {});
    
        console.log("releaseEnvs: ", releaseEnvs)
        // baseEnv becomes last key IF env has been dropped ie if user was looking at PROD env, we pick TEST as base
        const baseEnv = releaseEnvs.hasOwnProperty(env)
          ? env
          : releaseEnvsKeys[releaseEnvsKeys.length - 1];
    
        console.log("baseEnv: ", baseEnv)
        // Determine targetEnv
        const baseEnvIndex = envOrder.indexOf(baseEnv);
        const targetEnv =
          baseEnvIndex !== -1 && baseEnvIndex + 1 < orderedEnvs.length
            ? orderedEnvs[baseEnvIndex + 1]
            : null;
    
        console.log("targetEnv: ", targetEnv)
        setReleaseEnv(baseEnv)
        setReleaseEnvironments(releaseEnvs)
        setEnvironmentTarget(targetEnv)

        if (!isLoading && isAuthenticated) {
            fetchTestGroups(baseEnv)
            fetchReleaseTests(testGroupId, baseEnv, targetEnv)
        }

    }, [environments, env, isLoading]);

    useEffect(() => {
        async function fetchUniqueDates() {
            if (!globalDt) {
                try {
                    const data = await fetchData(`${environments[env].url}/get_unique_dates/`, {}, 'get_unique_dates');
                    if (data.latest_date) {
                        setGlobalDt(dayjs(data.latest_date).format('DD/MM/YYYY')); // Set to the latest date if no date is passed
                    } else {
                        setGlobalDt(dayjs().format('DD/MM/YYYY'));
                    }
                } catch (error) {
                    console.error('Error fetching dates:', error);
                }
            }
        }
        if (!isLoading && isAuthenticated) {
            fetchUniqueDates()
        }
    }, [globalDt, isLoading]);

    const fetchTestsByIds = async (selectedDate, group_id, testIds) => {       
        const formattedDate = selectedDate.replace(/\//g, '-'); 
        try {
            const data = await fetchData(
                `${environments[env].url}/get_tests_by_ids/?date=${formattedDate}&group_id=${group_id}&test_ids=${testIds.join(',')}`,
                {},
                'get_tests_by_ids'
            )
            setTableData(data.test_data)
            setColumnList(data.columnList)
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    const showPopupWithMessage = (message, success) => {
        setNotification(message)
        setNotificationSuccess(success)
    }

    const handleCheckboxChange = (id) => {
        // set tableData row with this id to the opposite of its previous Selected value
        const updatedTableData = tableData.map(row => 
            row.test_case_id === id ? { ...row, Selected: !row.Selected } : row
        )
        setTableData(updatedTableData)
        // if any row is not selected, set selectAll to false
        const anyNotSelected = updatedTableData.some(row => !row.Selected);
        setSelectAll(!anyNotSelected);
    }

    const handleSelectAllChange = () => {
        // if selectAll is not true, set all rows to selected
        if (!selectAll) {
            const updatedTableData = tableData.map(row => ({ ...row, Selected: true }))
            setTableData(updatedTableData)
        } else {
            const updatedTableData = tableData.map(row => ({ ...row, Selected: false }))
            setTableData(updatedTableData)
        }
        setSelectAll(!selectAll)
    }

    const onGroupChange = (event) => {
        setTestGroup(event.target.value)
        const group = testGroups.find(group => group.name === event.target.value)
        const group_id = group ? group.id : null
        setTestGroupId(group_id)
        setSortOption('')
        fetchReleaseTests(testGroupId, releaseEnv, environmentTarget)
    };

    const handleTestNameClick = (test_result_id, test_case_id, date) => {
        navigate(`/testdetail/${testGroupId}/${test_case_id}/${test_result_id}/${date}`);
    };

    const handleSelectedTestChange = (event, newValue) => {
        // Avoid adding duplicates
        console.log("existing tests: ", selectedTests);
        console.log("adding test: ", newValue);

        if (!selectedTests.some(test => test.test_case_id === newValue.test_case_id)) {
            const updatedTests = [...selectedTests, newValue];
            setSelectedTests(updatedTests);
            const testIds = updatedTests.map(test => test.test_case_id);
            fetchTestsByIds(globalDt, testGroupId, testIds)
        }
    };

    const removeSelectedTest = (testToDelete) => {
        const updatedTests = selectedTests.filter(test => test.test_case_id !== testToDelete.test_case_id);
        setSelectedTests(updatedTests);
    };

    const handleRelease = () => {
        setShowConfirmation(true);
    }
    
    const confirmRelease = async () => {
        // get the test_ids with test => test.Selected
        setShowConfirmation(false)
        setLoading(true)
        showPopupWithMessage("this will not display, it just to show the loading icon", true)
        
        let pushTestSuccess = true
        const selectedTests = tableData.filter(test => test.Selected)
        for (const test of selectedTests) {
            try {
                await pushTest(testGroupId, test)
            } catch (error) {
                console.error('Error adding test case:', error)
                pushTestSuccess = false
                break
            }
        }
        if (pushTestSuccess) {
            showPopupWithMessage('All tests released successfully', true)
            fetchReleaseTests(testGroupId, releaseEnv, environmentTarget)
        }

        setLoading(false)
    }

    const cancelRelease = () => {
        setShowConfirmation(false);
    }

    const pushTest = async (group_id, test) => {        
        const testData = {
            id: test.test_case_id,
            group_id: group_id,
            test_name: test['Test Name'],
            test_code: test.test_code,
            dependencies: test.dependencies,
            free_form: test.free_form,
        };
        console.log("testData: ", testData)

        try {
            if (test["Release Status"] === "Deleted") {
                await fetchData(
                    `${environments[environmentTarget].url}/delete_test_case/${test.test_case_id}/`,
                    {
                        method: 'DELETE',
                    },
                    'delete_test_case'
                );
            } else {
                await fetchData(
                    `${environments[environmentTarget].url}/upsert_test_case/`,
                    {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(testData),
                    },
                    'upsert_test_case' // Endpoint identifier for error handling
                );
            }
        } catch (error) {
            console.error('Error:', error);
            showPopupWithMessage(`Failed to release test case "${test['Test Name']}".`, false)
            throw error
        }
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
            <div className="dateGroupPicker">
                <FormControl variant="filled">
                    <InputLabel style={{ fontFamily: 'Cascadia Code' }}>Group</InputLabel>
                    <Select
                        value={testGroup}
                        label="Group"
                        onChange={onGroupChange}
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
                                value={option.name}
                                style={{ fontFamily: 'Cascadia Code', display: 'flex', justifyContent: 'center' }}
                            >
                                {option.name}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
                <FormControlLabel
                    control={
                        <Checkbox
                            checked={selectAll}
                            onChange={handleSelectAllChange}
                            color="primary"
                        />
                    }
                    label={<span style={{ fontFamily: 'Cascadia Code' }}>All</span>}
                    style={{ marginTop: '10px', marginLeft: '50px'  }}
                />
            </div>
            <div style={{ marginLeft: '5%',display: 'flex', marginTop: "80px", marginBottom: "100px" }}>
                    <div>
                        <DynamicTable
                            columnList={columnList}
                            data={tableData}
                            showCheckbox={true}
                            onCheckboxChange={handleCheckboxChange}
                            currentDate={globalDt}
                            onTestNameClick={handleTestNameClick}
                        />
                    </div>
                    <div style={{ marginLeft: '150px' }}>
                        <ReleaseEnvPipeline
                            handleRelease={handleRelease}
                            environmentTarget={environmentTarget}
                            env={env}
                            environments={environments}
                            releaseEnabled={tableData.filter(item => item.Selected).length > 0}
                        />
                    </div>
            </div>
            {notification && (
                <NotificationPopup
                    message={notification}
                    status={notificationSuccess}
                    onClose={() => setNotification(null)}
                    loading={loading}
                />
            )}
            {showConfirmation && (
                <ConfirmationPopup
                    message={`Are you sure you want to release to ${environmentTarget} environment?
                    \nTests chosen for release are:\n\n${(() => {
                        const selectedTests = tableData.filter(test => test.Selected).map(test => test["Test Name"]);
                        if (selectedTests.length > 15) {
                            return selectedTests.slice(0, 15).join('\n') + '\n...';
                        }
                        return selectedTests.join('\n');
                    })()}`}
                    onConfirm={confirmRelease}
                    onCancel={cancelRelease}
                />
            )}  
        </>
    );
};

export default Release;
