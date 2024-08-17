import React, { useState, useEffect, useRef } from 'react'
import Header from '../components/Header/Header'
import { useNavigate } from 'react-router-dom'
import CustomButton from '../components/CustomButton/CustomButton'
import DynamicTable from '../components/DynamicTable/DynamicTable'
import GroupForm from '../components/GroupForm/GroupForm'
import { DatePicker } from '@mui/x-date-pickers'
import dayjs from 'dayjs'
import { useNavigation } from '../TestNavigationContext' // Adjust the path as necessary
import './TestGroups.css'
import { API_URL } from '../constants'
import { fetchWithErrorHandling } from '../utils/api'
import { useError } from '../ErrorContext.jsx'

// App Component
const TestGroups = () => {
    const groupFormRef = useRef(null)
    const { setTestGroup, setTestGroupId, globalDt, setGlobalDt } = useNavigation()
    const [submitMsg, setSubmitMsg] = useState("Add Group")
    const [showInputs, setShowInputs] = useState(false)
    const [editGroup, setEditGroup] = useState(false)
    const [formData, setFormData] = useState({
        id: '',
        Name: '',
        Machine: '',
        Port: '',
        Scheduled: '',
        TLS: false
    })
    const [startDate, setStartDate] = useState(null);
    const [latestDate, setLatestDate] = useState(null);
    const [missingDates, setMissingDates] = useState(new Set());
    const [tableData, setTableData] = useState([]);
    const [columnList, setColumnList] = useState([]);
    const [connectionValid, setConnectionValid] = useState(null)
    const [loading, setLoading] = useState(false);
    const [connectMessage, setConnectMessage] = useState('')
    const navigate = useNavigate();
    const { showError } = useError()

    useEffect(() => {
        async function fetchUniqueDates() {
            try {
                const data = await fetchWithErrorHandling(`${API_URL}get_unique_dates/`, {}, 'get_unique_dates', showError);
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
        fetchUniqueDates()
    }, [globalDt]);

    useEffect(() => {
        if (globalDt) {
            fetchGroupDetailsAndResults(globalDt);
        }
    }, [globalDt]);

    useEffect(() => {
        if (showInputs || editGroup) {
            groupFormRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [showInputs, editGroup]);
    
    const fetchGroupDetailsAndResults = async (selectedDate) => {
        if (selectedDate) {
            const formattedDate = selectedDate.replace(/\//g, '-');
            try {
                const data = await fetchWithErrorHandling(`${API_URL}get_test_result_summary/?date=${formattedDate}`, {}, 'get_test_result_summary', showError);
                setTableData(data.groups_data);
                setColumnList(data.columnList);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        }
    };

    const goToHomePage = () => {
        navigate('/');
    }

    const handleGroupNameClick = (test_group, date) => {
        setTestGroup(test_group);
        const group = tableData.find(group => group.Name === test_group);
        const group_id = group ? group.id : null;
        setTestGroupId(group_id);
        navigate(`/testgroup`)
    };

    const onCreateGroup = () => {
        setShowInputs(true);
        setEditGroup(false);
        setSubmitMsg("Add Group")
        setConnectionValid(null)
        setFormData({
            id: '',
            Name: '',
            Machine: '',
            Port: '',
            Scheduled: '',
            TLS: false
        });
    };
    
    const handleCloseClick = () => {
        setShowInputs(false);
        setEditGroup(false);
        setConnectionValid(null)
    };

    const onDateChange = (newDate) => {
        const formattedDate = newDate ? newDate.format('DD/MM/YYYY') : '';
        setGlobalDt(formattedDate);
        fetchGroupDetailsAndResults(formattedDate);
        setConnectionValid(null)
    };

    const handleInputChange = (field, value) => {
        setFormData(prevState => ({ ...prevState, [field]: value }));
        setConnectionValid(null)
    };

    const handleTestConnect = async () => {
        setLoading(true);
        try {
            const data = await fetchWithErrorHandling(
                `${API_URL}test_kdb_connection/`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        server: formData.Machine,
                        port: formData.Port,
                        tls: formData.TLS
                    }),
                },
                'test_kdb_connection',
                showError
            )
            if (data.message === "success") {
                setConnectionValid(true)
                setConnectMessage('')
            } else {
                setConnectionValid(false)
                setConnectMessage(data.details)
                // in future - might use error message in data.details - will require better handling on backend - right now details is a stack trace
            }
        } catch (error) {
            console.error('Error:', error);
            setConnectionValid(false)
            setConnectMessage(String(error));
        }
        setLoading(false);
    };

    const handleFormSubmit = async () => {
        try {
            const data = await fetchWithErrorHandling(
                editGroup ? `${API_URL}edit_test_group/${formData.id}/` : `${API_URL}add_test_group/`,
                {
                    method: editGroup ? 'PUT' : 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        name: formData.Name,
                        server: formData.Machine,
                        port: formData.Port,
                        schedule: formData.Scheduled,
                        tls: formData.TLS
                    }),
                },
                'edit_test_group',
                showError
            )
            fetchGroupDetailsAndResults(globalDt);
            handleCloseClick();

        } catch (error) {
            console.error('Error:', error);
        }
    };

    const handleEditButtonClick = (row) => {
        setSubmitMsg("Update Group")
        setShowInputs(false);
        setEditGroup(true);
        setFormData(row);
    };

    const isMissing = (date) => {
        return missingDates.has(dayjs(date).format('YYYY-MM-DD'));
    };
    
    return (
        <>
            <Header title={"Home Page"} onClick={goToHomePage} />
            <div className="dateSelector">
                <DatePicker
                    value={dayjs(globalDt, 'DD/MM/YYYY')}
                    onChange={onDateChange}
                    minDate={startDate}
                    shouldDisableDate={isMissing}
                    maxDate={latestDate}
                />
            </div>
            <div className="tableContainerGroups">
                <DynamicTable
                    data={tableData}
                    columnList={columnList}
                    showCircleButton={true}
                    onEditButtonClick={handleEditButtonClick}
                    currentDate={globalDt}
                    onGroupNameClick={handleGroupNameClick}
                />
            </div>
            <div className="createGroup">
                <CustomButton onClick={onCreateGroup}>Create Group</CustomButton>
            </div>
            {(showInputs || editGroup) && (
                <div ref={groupFormRef}>
                    <GroupForm
                        name={formData.Name}
                        machine={formData.Machine}
                        port={formData.Port}
                        schedule={formData.Scheduled}
		        tls={formData.TLS}
                        onChange={handleInputChange}
                        onClose={handleCloseClick}
                        onTestConnect={handleTestConnect}
                        onSubmit={handleFormSubmit}
                        finalButtonMsg={submitMsg}
                        connectionValid={connectionValid}
                        loading={loading}
                        connectMessage={connectMessage}
                    />
                </div>
            )}
        </>
    )
};

export default TestGroups;
