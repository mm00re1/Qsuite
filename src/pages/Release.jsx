import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Header from '../components/Header/Header';
import DynamicTable from '../components/DynamicTable/DynamicTable';
import IconButton from '@mui/material/IconButton';
import ChevronLeft from '@mui/icons-material/ChevronLeft';
import ChevronRight from '@mui/icons-material/ChevronRight';
import { useNavigation } from '../TestNavigationContext'; // Adjust the path as necessary
import './TestGroupDetail.css';
import SearchTests from '../components/SearchTests/SearchTests';
import { fetchWithErrorHandling } from '../utils/api'
import { useError } from '../ErrorContext.jsx'
import { useParams } from 'react-router-dom';

const Release = () => {
    const { globalDt, env, setEnv, environments, deleteTestHistory } = useNavigation();
    const navigate = useNavigate();
    const { groupId } = useParams();
    const [testGroupId, setTestGroupId] = useState(groupId);
    const [testGroup, setTestGroup] = useState('');
    const [sortOption, setSortOption] = useState('');
    const [testGroups, setTestGroups] = useState([]);
    const [tableData, setTableData] = useState([]);
    const [columnList, setColumnList] = useState([]);
    const [totalPages, setTotalPages] = useState(1);
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedTests, setSelectedTests] = useState([]);
    const { showError } = useError()

    useEffect(() => {
        deleteTestHistory()
    }, []);

    useEffect(() => {
        async function fetchTestGroups() {
            try {
                const data = await fetchWithErrorHandling(`${environments[env].url}test_groups/`, {}, 'test_groups', showError)
                setTestGroups(data)
                setTestGroup(data.find(group => group.id === testGroupId).name)
            } catch (error) {
                console.error('Error fetching test groups:', error)
            }
        }
        fetchTestGroups();
    }, [env]);

    useEffect(() => {
        if (globalDt) {
            fetchTestRunResults(globalDt, testGroupId, sortOption, currentPage, true);
        }
    }, [testGroups,env]);

    const fetchTestRunResults = async (selectedDate, group_id, sortStyle, pageNumber = 1) => {
        const formattedDate = selectedDate.replace(/\//g, '-');

        if (selectedDate) {
            try {
                const data = await fetchWithErrorHandling(
                    `${environments[env].url}get_test_results_by_day/?date=${formattedDate}&group_id=${group_id}&page_number=${pageNumber}&sortOption=${sortStyle}`,
                    {},
                    'get_test_results_by_day',
                    showError
                )
                setTableData(data.test_data.map(item => ({
                    ...item,
                    'Creation Date': item['Creation Date'] ? item['Creation Date'].split('T')[0] : null,
                    'Status': null
                })))
                setColumnList(["Test Name", "Creation Date"])
                setTotalPages(data.total_pages)
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        }
    };

    const fetchTestsByIds = async (selectedDate, group_id, testIds) => {       
        const formattedDate = selectedDate.replace(/\//g, '-'); 
        try {
            const data = await fetchWithErrorHandling(
                `${environments[env].url}get_tests_by_ids/?date=${formattedDate}&group_id=${group_id}&test_ids=${testIds.join(',')}`,
                {},
                'get_tests_by_ids',
                showError
            )
            setTableData(data.test_data)
            setColumnList(data.columnList)
            setTotalPages(1)
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    const goToGroupsPage = () => {
        navigate('/testgroups');
    }

    const onGroupChange = (event) => {
        setTestGroup(event.target.value);
        const group = testGroups.find(group => group.name === event.target.value);
        const group_id = group ? group.id : null;
        setTestGroupId(group_id);
        setSortOption('');
        setCurrentPage(1);
        fetchTestRunResults(globalDt, group_id, '', 1);
    };
    
    const handlePrevPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
            fetchTestRunResults(globalDt, testGroupId, sortOption, currentPage - 1);
        }
    };

    const handleNextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
            fetchTestRunResults(globalDt, testGroupId, sortOption, currentPage + 1);
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

    return (
        <>
            <Header title={"All Test Groups"} onClick={goToGroupsPage} />
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
                <SearchTests
                    selectedTests={selectedTests}
                    handleLinkedTestChange={handleSelectedTestChange}
                    removeLinkedTest={removeSelectedTest}
                    renderChips={false}
                    message={"Search for test"}
                    group_id={testGroupId}
                />
            </div>
            <div style={{ marginLeft: "5%", marginTop: "80px" }}>
                <DynamicTable
                    columnList={columnList}
                    data={tableData}
                    showCircleButton={false}
                    currentDate={globalDt}
                    onTestNameClick={handleTestNameClick}
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
        </>
    );
};

export default Release;
