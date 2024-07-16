import React, { useState, useEffect, useRef } from 'react';
import Header from '../components/Header/Header.js'
import { useNavigate } from 'react-router-dom';
import CustomButton from '../components/CustomButton/CustomButton.js';
import DynamicTable from '../components/DynamicTable/DynamicTable.js';
import GroupForm from '../components/GroupForm/GroupForm.js';
import { DatePicker } from '@mui/x-date-pickers';
import dayjs, { Dayjs } from 'dayjs';
import { useNavigation } from '../TestNavigationContext'; // Adjust the path as necessary
import './TestGroups.css'

// App Component
const TestGroups = () => {
    const groupFormRef = useRef(null);
    const { setTestGroup, setTestGroupId, globalDt, setGlobalDt } = useNavigation();
    const [submitMsg, setSubmitMsg] = useState("Add Group");
    const [showInputs, setShowInputs] = useState(false);
    const [editGroup, setEditGroup] = useState(false);
    const [formData, setFormData] = useState({
        id: '',
        name: '',
        server: '',
        port: '',
        schedule: ''
    });
    const [startDate, setStartDate] = useState(null);
    const [latestDate, setLatestDate] = useState(null);
    const [missingDates, setMissingDates] = useState(new Set());
    const [tableData, setTableData] = useState([]);
    const [columnList, setColumnList] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        fetch('http://127.0.0.1:5000/get_unique_dates/')
            .then(response => response.json())
            .then(data => {
                setStartDate(dayjs(data.start_date));
                setLatestDate(dayjs(data.latest_date));
                const missingDatesSet = new Set(data.missing_dates.map(date => dayjs(date, 'YYYY-MM-DD').format('YYYY-MM-DD')));
                setMissingDates(missingDatesSet);
                if (!globalDt && data.latest_date) {
                    setGlobalDt(dayjs(data.latest_date).format('DD/MM/YYYY')); // Set to the latest date if no date is passed
                }
            })
            .catch(error => console.error('Error fetching dates:', error));
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
    
    const fetchGroupDetailsAndResults = (selectedDate) => {
        if (selectedDate) {
            // Adjust the date format before sending it to the API
            const formattedDate = selectedDate.replace(/\//g, '-');
            fetch(`http://127.0.0.1:5000/get_test_result_summary/?date=${formattedDate}`)
                .then(response => response.json())
                .then(data => {
                    setTableData(data.groups_data);
                    setColumnList(data.columnList); // New state to store column list
                })
                .catch(error => console.error('Error fetching data:', error));
        }
    };

    const greyColor = '#f0f0f0';

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
        setFormData({
            id: '',
            Name: '',
            Machine: '',
            Port: '',
            Scheduled: ''
        });
    };
    
    const handleCloseClick = () => {
        setShowInputs(false);
        setEditGroup(false);
    };

    const onDateChange = (newDate) => {
        const formattedDate = newDate ? newDate.format('DD/MM/YYYY') : '';
        setGlobalDt(formattedDate);
        fetchGroupDetailsAndResults(formattedDate);
    };

    const handleInputChange = (field, value) => {
        setFormData(prevState => ({ ...prevState, [field]: value }));
    };

    const handleTestConnect = () => {
        console.log("test connection later")
    };

    const handleFormSubmit = () => {
        const url = editGroup 
            ? `http://127.0.0.1:5000/edit_test_group/${formData.id}/`
            : 'http://127.0.0.1:5000/add_test_group/';
        const method = editGroup ? 'PUT' : 'POST';

        fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name: formData.Name,
                server: formData.Machine,
                port: formData.Port,
                schedule: formData.Scheduled
            }),
        })
        .then(response => response.json())
        .then(data => {
            fetchGroupDetailsAndResults(globalDt);
            handleCloseClick();
        })
        .catch(error => {
            console.error('Error:', error);
        });
    };

    const handleEditButtonClick = (row) => {
        setSubmitMsg("Update Group")
        setShowInputs(false);
        setEditGroup(true);
        setFormData(row);
    };

    const isMissing = (date: Dayjs) => {
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
                        onChange={handleInputChange}
                        onClose={handleCloseClick}
                        onTestConnect={handleTestConnect}
                        onSubmit={handleFormSubmit}
                        finalButtonMsg={submitMsg}
                    />
                </div>
            )}
        </>
    )
};

export default TestGroups;
