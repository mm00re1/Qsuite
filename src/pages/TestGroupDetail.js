import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Header from '../components/Header/Header.js';
import { DatePicker } from '@mui/x-date-pickers';
import dayjs, { Dayjs } from 'dayjs';
import DynamicTable from '../components/DynamicTable/DynamicTable.js';
import IconButton from '@mui/material/IconButton';
import ChevronLeft from '@mui/icons-material/ChevronLeft';
import ChevronRight from '@mui/icons-material/ChevronRight';
import { PieChart } from '@mui/x-charts/PieChart';
import CustomSwitchButton from '../components/CustomButton/CustomSwitchButton.js';
import { useNavigation } from '../TestNavigationContext'; // Adjust the path as necessary
import './TestGroupDetail.css';

const TestGroupDetail = () => {
    const { date } = useParams();
    const { testGroup, setTestGroup, deleteTestHistory } = useNavigation();
    const navigate = useNavigate();
    const [sortOption, setSortOption] = useState('');
    const [dt, setDt] = useState(date || '');
    const [testGroups, setTestGroups] = useState([]);
    const [startDate, setStartDate] = useState(null);
    const [latestDate, setLatestDate] = useState(null);
    const [missingDates, setMissingDates] = useState(new Set());
    const [tableData, setTableData] = useState([]);
    const [columnList, setColumnList] = useState([]);
    const [totalPages, setTotalPages] = useState(1);
    const [currentPage, setCurrentPage] = useState(1);
    const [all_tests, setAll_tests] = useState(false);
    const [totalPassed, setTotalPassed] = useState(0);
    const [totalFailed, setTotalFailed] = useState(0);
    const greyColor = '#f0f0f0';
    const sortOptions = ["Failed", "Passed", "Time Taken"];

    useEffect(() => {
        deleteTestHistory()
    }, []);

    useEffect(() => {
        fetch('http://127.0.0.1:5000/test_groups/')
            .then(response => response.json())
            .then(data => {
                setTestGroups(data);
            })
            .catch(error => console.error('Error fetching test groups:', error));
    }, []);

    useEffect(() => {
        fetch('http://127.0.0.1:5000/get_unique_dates/')
            .then(response => response.json())
            .then(data => {
                setStartDate(dayjs(data.start_date));
                setLatestDate(dayjs(data.latest_date));
                const missingDatesSet = new Set(data.missing_dates.map(date => dayjs(date, 'YYYY-MM-DD').format('YYYY-MM-DD')));
                setMissingDates(missingDatesSet);
                if (!date && data.latest_date) {
                    setDt(dayjs(data.latest_date).format('DD/MM/YYYY')); // Set to the latest date if no date is passed
                }
            })
            .catch(error => console.error('Error fetching dates:', error));
    }, [date]);

    useEffect(() => {
        if (dt) {
            fetchTestRunResults(dt, testGroup, sortOption, currentPage, false);
        }
    }, [testGroups]);

    const fetchTestRunResults = (selectedDate, groupName, sortStyle, pageNumber = 1, all_test_view) => {
        const group = testGroups.find(group => group.name === groupName);
        const group_id = group ? group.id : null;
        let fetchUrl;

        if (all_test_view) {
            fetchUrl = `http://127.0.0.1:5000/get_tests_by_group/?group_id=${group_id}&page_number=${pageNumber}`
        } else if (selectedDate) {
            // Adjust the date format before sending it to the API
            const formattedDate = selectedDate.replace(/\//g, '-');
            fetchUrl = `http://127.0.0.1:5000/get_test_results_by_day/?date=${formattedDate}&group_id=${group_id}&page_number=${pageNumber}&sortOption=${sortStyle}`;
        }
        if (all_test_view || selectedDate) {
            fetch(fetchUrl)
                .then(response => response.json())
                .then(data => {
                    setTableData(data.test_data);
                    setColumnList(data.columnList);
                    setTotalPages(data.total_pages);
                    setCurrentPage(data.current_page);
                    setTotalPassed(data.total_passed);
                    setTotalFailed(data.total_failed);
                })
                .catch(error => console.error('Error fetching data:', error));
        }
    };

    const goToGroupsPage = () => {
        navigate('/testgroups');
    }

    const onGroupChange = (event) => {
        setTestGroup(event.target.value);
        setSortOption('');
        setCurrentPage(1);
        fetchTestRunResults(dt, event.target.value, '', currentPage, all_tests);
    };

    const onSortChange = (event) => {
        setSortOption(event.target.value);
        setCurrentPage(1);
        fetchTestRunResults(dt, testGroup, event.target.value, 1, all_tests);
    };

    const onDateChange = (newDate) => {
        const formattedDate = newDate ? newDate.format('DD/MM/YYYY') : '';
        setDt(formattedDate);
        setSortOption('');
        setCurrentPage(1);
        fetchTestRunResults(formattedDate, testGroup, '', 1, all_tests);

    };

    const isMissing = (date: Dayjs) => {
        return missingDates.has(dayjs(date).format('YYYY-MM-DD'));
    };
    
    const handlePrevPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
            fetchTestRunResults(dt, testGroup, sortOption, currentPage - 1, all_tests);
        }
    };

    const handleNextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
            fetchTestRunResults(dt, testGroup, sortOption, currentPage + 1, all_tests);

        }
    };

    const handleSwitchClick = (button) => {
        setSortOption('');
        setCurrentPage(1);
        let all_test_view = button === "right" ? true : false;
        setAll_tests(all_test_view)
        fetchTestRunResults(dt, testGroup, '', 1, all_test_view);
    };

    const handleTestNameClick = (test_case_id, date) => {
        navigate(`/testdetail/${test_case_id}/${date}`);
    };

    return (
        <>
            <Header title={"All Test Groups"} onClick={goToGroupsPage} />
            <div className="switchButton">
                <CustomSwitchButton
                    leftMessage={"Test Results"}
                    rightMessage={"All Tests"}
                    onClick={handleSwitchClick}
                />
            </div>
            <div className="pie-chart">
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
            <div className="groupAndDate">
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
                {!all_tests && (
                <>
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
                    <DatePicker
                        value={dayjs(dt, 'DD/MM/YYYY')}
                        onChange={onDateChange}
                        minDate={startDate}
                        maxDate={latestDate}
                        shouldDisableDate={isMissing}
                    />
                </>
                )}
            </div>
            <div className="tableContainer">
                <DynamicTable
                    columnList={columnList}
                    data={tableData}
                    showCircleButton={false}
                    currentDate={dt}
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

export default TestGroupDetail;
