import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Header from '../components/Header/Header';
import { DatePicker } from '@mui/x-date-pickers';
import dayjs from 'dayjs';
import Tooltip from '@mui/material/Tooltip';
import DeleteIcon from '@mui/icons-material/Delete';
import DynamicTable from '../components/DynamicTable/DynamicTable';
import IconButton from '@mui/material/IconButton';
import ChevronLeft from '@mui/icons-material/ChevronLeft';
import ChevronRight from '@mui/icons-material/ChevronRight';
import { PieChart } from '@mui/x-charts/PieChart';
import { useNavigation } from '../TestNavigationContext'; // Adjust the path as necessary
import TestGroupDetailChart from '../components/Charts/TestGroupDetailChart';
import './TestGroupDetail.css';
import SearchTests from '../components/SearchTests/SearchTests';
import BackButton from '../components/BackButton/BackButton';
import { useError } from '../ErrorContext.jsx'
import { useParams } from 'react-router-dom'
import ConfirmationPopup from '../components/ConfirmationPopup/ConfirmationPopup'
import NotificationPopup from '../components/NotificationPopup/NotificationPopup'
import { useAuth0 } from "@auth0/auth0-react"
import { useAuthenticatedApi } from "../hooks/useAuthenticatedApi"

const TestGroupDetail = () => {
    const { globalDt, setGlobalDt, env, environments, deleteTestHistory } = useNavigation();
    const navigate = useNavigate();
    const { groupId } = useParams();
    const [testGroupId, setTestGroupId] = useState(groupId);
    const [testGroup, setTestGroup] = useState('');
    const [sortOption, setSortOption] = useState('');
    const [testGroups, setTestGroups] = useState([]);
    const [startDate, setStartDate] = useState(null);
    const [latestDate, setLatestDate] = useState(null);
    const [missingDates, setMissingDates] = useState(new Set());
    const [tableData, setTableData] = useState([]);
    const [columnList, setColumnList] = useState([]);
    const [totalPages, setTotalPages] = useState(1);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPassed, setTotalPassed] = useState(0);
    const [totalFailed, setTotalFailed] = useState(0);
    const [graphData, setGraphData] = useState([]);
    const [selectedTests, setSelectedTests] = useState([]);
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [loading, setLoading] = useState(false);
    const [notification, setNotification] = useState(null)
    const [notificationSuccess, setNotificationSuccess] = useState(true)
    const [isFinalEnv, setIsFinalEnv] = useState(false)
    const { showError } = useError()
    const sortOptions = ["Failed", "Passed", "Time Taken"]
    const { isAuthenticated, isLoading } = useAuth0()
    const { fetchWithAuth } = useAuthenticatedApi(showError)

    useEffect(() => {
        deleteTestHistory()
    }, [])

    useEffect(() => {
        async function fetchTestGroups() {
            try {
                const data = await fetchWithAuth(`${environments[env].url}test_groups/`, {}, 'test_groups')
                setTestGroups(data)
                setTestGroup(data.find(group => group.id === testGroupId).name)
            } catch (error) {
                console.error('Error fetching test groups:', error)
            }
        }
        if (!isLoading && isAuthenticated) {
            fetchTestGroups()
        }
    }, [env, isLoading])

    useEffect(() => {
        async function fetchUniqueDates() {
            try {
                const data = await fetchWithAuth(`${environments[env].url}get_unique_dates/`, {}, 'get_unique_dates');
                setStartDate(dayjs(data.start_date));
                setLatestDate(dayjs(data.latest_date));
                const missingDatesSet = new Set(data.missing_dates.map(date => dayjs(date, 'YYYY-MM-DD').format('YYYY-MM-DD')));
                setMissingDates(missingDatesSet);
                if (!globalDt && data.latest_date) {
                    setGlobalDt(dayjs(data.latest_date).format('DD/MM/YYYY')); // Set to the latest date if no date is passed
                } else if (!globalDt && !data.latest_date) {
                    setGlobalDt(dayjs().format('DD/MM/YYYY'));
                }
            } catch (error) {
                console.error('Error fetching dates:', error);
            }
        }
        if (!isLoading && isAuthenticated) {
            fetchUniqueDates()
        }
    }, [globalDt,env,isLoading]);

    useEffect(() => {
        const envOrder = ['DEV', 'TEST', 'PROD']
        const orderedEnvs = envOrder.filter(e => environments.hasOwnProperty(e))
        let finalEnv = orderedEnvs[orderedEnvs.length - 1] === env
        // if we have more than one env (e.g. a dev and prod env), we want to first delete tests in dev and then release the changes to prod
        finalEnv = orderedEnvs.length > 1 && finalEnv
        setIsFinalEnv(finalEnv)

        if (globalDt && !isLoading && isAuthenticated) {
            fetchGroupStats(globalDt, testGroupId)
            fetchExecutionTimes(globalDt, testGroupId)
            fetchTestRunResults(globalDt, testGroupId, sortOption, currentPage, true, finalEnv)
        }
    }, [testGroups,env,isLoading]);

    const fetchGroupStats = async (selectedDate, group_id) => {
        const formattedDate = selectedDate.replace(/\//g, '-');
        try {
            const data = await fetchWithAuth(
                `${environments[env].url}get_test_group_stats/?date=${formattedDate}&group_id=${group_id}`,
                {},
                'get_test_group_stats'
            )
            setTotalPassed(data.total_passed)
            setTotalFailed(data.total_failed)
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    }

    const fetchExecutionTimes = async (selectedDate, group_id) => {
        const formattedDate = selectedDate.replace(/\//g, '-');
        try {
            const data = await fetchWithAuth(
                `${environments[env].url}get_test_results_by_day/?date=${formattedDate}&group_id=${group_id}&page_number=1&sortOption=${"Time Taken"}`,
                {},
                'get_test_results_by_day'
            )
            setGraphData(data.test_data)
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    }

    const fetchTestRunResults = async (selectedDate, group_id, sortStyle, pageNumber = 1, finalEnv) => {
        const formattedDate = selectedDate.replace(/\//g, '-');

        if (selectedDate) {
            try {
                const data = await fetchWithAuth(
                    `${environments[env].url}get_test_results_by_day/?date=${formattedDate}&group_id=${group_id}&page_number=${pageNumber}&sortOption=${sortStyle}`,
                    {},
                    'get_test_results_by_day'
                )
                // add 'Selected': false to each row
                if (!finalEnv) {
                    data.test_data = data.test_data.map(row => ({...row, Selected: false}));
                }
                setTableData(data.test_data)
                setColumnList(data.columnList)
                setTotalPages(data.total_pages)
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        }
    };

    const fetchTestsByIds = async (selectedDate, group_id, testIds) => {       
        const formattedDate = selectedDate.replace(/\//g, '-'); 
        try {
            const data = await fetchWithAuth(
                `${environments[env].url}get_tests_by_ids/?date=${formattedDate}&group_id=${group_id}&test_ids=${testIds.join(',')}`,
                {},
                'get_tests_by_ids'
            )
            setTableData(data.test_data)
            setColumnList(data.columnList)
            setTotalPages(1)
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    const onGroupChange = (event) => {
        setTestGroup(event.target.value);
        const group = testGroups.find(group => group.name === event.target.value);
        const group_id = group ? group.id : null;
        setTestGroupId(group_id);
        setSortOption('');
        setCurrentPage(1);
        fetchGroupStats(globalDt, group_id);
        fetchExecutionTimes(globalDt, group_id);
        fetchTestRunResults(globalDt, group_id, '', 1, isFinalEnv);
    };

    const onSortChange = (event) => {
        setSortOption(event.target.value);
        setCurrentPage(1);
        fetchTestRunResults(globalDt, testGroupId, event.target.value, 1, isFinalEnv);
    };

    const onDateChange = (newDate) => {
        const formattedDate = newDate ? newDate.format('DD/MM/YYYY') : '';
        setGlobalDt(formattedDate);
        setSortOption('');
        setCurrentPage(1);
        fetchGroupStats(formattedDate, testGroupId);
        fetchExecutionTimes(formattedDate, testGroupId);
        fetchTestRunResults(formattedDate, testGroupId, '', 1, isFinalEnv);
    };

    const isMissing = (date) => {
        return missingDates.has(dayjs(date).format('YYYY-MM-DD'));
    };
    
    const handlePrevPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
            fetchTestRunResults(globalDt, testGroupId, sortOption, currentPage - 1, isFinalEnv);
        }
    };

    const handleNextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
            fetchTestRunResults(globalDt, testGroupId, sortOption, currentPage + 1, isFinalEnv);

        }
    };

    const handleTestNameClick = (test_case_id, date) => {
        navigate(`/testdetail/${testGroupId}/${test_case_id}/${date}`);
    };

    const handleSelectedTestChange = (event, newValue) => {
        // Avoid adding duplicates
        console.log("existing tests: ", selectedTests);
        console.log("adding test: ", newValue);
        setCurrentPage(1);

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

    const backToAllTests = () => {
        setSelectedTests([]);
        setSortOption('');
        setCurrentPage(1);
        fetchTestRunResults(globalDt, testGroupId, '', 1, isFinalEnv);
    }

    const handleCheckboxChange = (id) => {
        // set tableData row with this id to the opposite of its previous Selected value
        const updatedTableData = tableData.map(row => 
            row.test_case_id === id ? { ...row, Selected: !row.Selected } : row
        )
        setTableData(updatedTableData)
        // if any row is not selected, set selectAll to false
        //const anyNotSelected = updatedTableData.some(row => !row.Selected);
        //setSelectAll(!anyNotSelected);
    }

    const handleDeleteClick = () => {
        setShowConfirmation(true);
    }

    const confirmDelete = async () => {
        // get the test_ids with test => test.Selected
        setShowConfirmation(false)
        setLoading(true)
        showPopupWithMessage("this will not display, it just to show the loading icon", true)
        
        let deleteTestSuccess = true
        const selectedTests = tableData.filter(test => test.Selected)
        for (const test of selectedTests) {
            try {
                await deleteTest(test)
            } catch (error) {
                console.error('Error deleting test case:', error)
                deleteTestSuccess = false
                break
            }
        }
        if (deleteTestSuccess) {
            showPopupWithMessage('All tests deleted successfully', true)
            fetchTestRunResults(globalDt, testGroupId, sortOption, currentPage, isFinalEnv)
        }

        setLoading(false)
    }

    const cancelDelete = () => {
        setShowConfirmation(false);
    }

    const showPopupWithMessage = (message, success) => {
        setNotification(message)
        setNotificationSuccess(success)
    }

    const deleteTest = async (test) => {
        try {
            await fetchWithAuth(
                `${environments[env].url}delete_test_case/${test.test_case_id}/`,
                {
                    method: 'DELETE',
                },
                'delete_test_case'
            );
        } catch (error) {
            console.error('Error:', error);
            showPopupWithMessage(`Failed to delete test case "${test['Test Name']}".`, false)
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
                <DatePicker
                    value={dayjs(globalDt, 'DD/MM/YYYY')}
                    onChange={onDateChange}
                    minDate={startDate}
                    maxDate={latestDate}
                    shouldDisableDate={isMissing}
                />
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
            </div>
            <div style={{ display: 'flex', width: '100%', marginTop: '10px' }}>
                <div
                    style={{
                        width: '40%',
                        minWidth: '560px',
                        display: 'flex',
                        justifyContent: 'flex-start',
                        marginTop: '80px',
                    }}>
                    <PieChart
                        colors={['#60F82A', '#F11414']}
                        series={[
                            {
                            data: [
                                { id: 0, value: totalPassed, label: 'Passed' },
                                { id: 1, value: totalFailed, label: 'Failed' },
                            ],
                            innerRadius: 70,
                            outerRadius: 100,
                            },
                        ]}
                        width={300}
                        height={200}
                        slotProps={{ legend: { hidden: true } }}
                    />
                </div>
                <div
                    style={{
                        width: '60%',
                        minWidth: '840px',
                        display: 'flex',
                        justifyContent: 'center',
                    }}>
                    <TestGroupDetailChart data={graphData} />
                </div>
            </div>
            <div className="groupAndDate">
                {(!selectedTests.length > 0) && (
                    <FormControl variant="filled">
                        <InputLabel style={{ fontFamily: 'Cascadia Code' }}>Sort By</InputLabel>
                        <Select
                            value={sortOption}
                            label="Sort By"
                            onChange={onSortChange}
                            style={{
                                backgroundColor: 'white',
                                borderRadius: 0,
                                fontFamily: 'Cascadia Code',
                                boxShadow: '0px 12px 18px rgba(0, 0, 0, 0.1)',
                                minWidth: '220px'
                            }}
                            MenuProps={{
                                PaperProps: {
                                    style: {
                                        backgroundColor: 'white', // Dropdown box color
                                    }
                                }
                            }}
                        >
                            {sortOptions.map((option, index) => (
                                <MenuItem
                                    key={index}
                                    value={option}
                                    style={{ fontFamily: 'Cascadia Code', display: 'flex', justifyContent: 'center' }}
                                >
                                    {option}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                )}
                <SearchTests
                    selectedTests={selectedTests}
                    handleLinkedTestChange={handleSelectedTestChange}
                    removeLinkedTest={removeSelectedTest}
                    renderChips={false}
                    message={"Search for test"}
                    group_id={testGroupId}
                />
                {!isFinalEnv && (
                    <Tooltip title="Delete Selected" arrow>
                        <DeleteIcon 
                        onClick={tableData.some(test => test.Selected) ? handleDeleteClick : undefined}
                        style={{ 
                            marginTop: '16px',
                            marginLeft: '40px',
                            cursor: tableData.some(test => test.Selected) ? 'pointer' : '',
                            fontSize: '26px',
                            opacity: tableData.some(test => test.Selected) ? 1 : 0.5,
                        }}
                        />
                    </Tooltip>
                )}
            </div>
            {(selectedTests.length > 0) && (
                <div style={{ marginLeft: '5%', marginBottom: '20px', marginTop: '1px' }}>
                    <BackButton title={"All Tests"} onClick={backToAllTests} textColor={'#3E0A66'} fontSize={'16px'} />
                </div>
            )}
            <div className="tableContainer">
                <DynamicTable
                    columnList={columnList}
                    data={tableData}
                    showCircleButton={false}
                    currentDate={globalDt}
                    onTestNameClick={handleTestNameClick}
                    showCheckbox={!isFinalEnv}
                    onCheckboxChange={handleCheckboxChange}
                />
            </div>
            <div className="paginationControls">
                <IconButton onClick={handlePrevPage} disabled={currentPage === 1}>
                    <ChevronLeft />
                </IconButton>
                <span>{currentPage} / {totalPages}</span>
                <IconButton onClick={handleNextPage} disabled={currentPage === totalPages}>
                    <ChevronRight />
                </IconButton>
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
                    message={`Are you sure you want to delete the selected tests?
                    \n\n${(() => {
                        const selectedTests = tableData.filter(test => test.Selected).map(test => test["Test Name"]);
                        if (selectedTests.length > 15) {
                            return selectedTests.slice(0, 15).join('\n') + '\n...';
                        }
                        return selectedTests.join('\n');
                    })()}`}
                    onConfirm={confirmDelete}
                    onCancel={cancelDelete}
                />
            )}  
        </>
    );
};

export default TestGroupDetail;
