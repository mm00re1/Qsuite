import React, { useState, useEffect } from 'react'
import Header from '../components/Header/Header'
import { useNavigate } from 'react-router-dom'
import CustomButton from '../components/CustomButton/CustomButton'
import { DatePicker } from '@mui/x-date-pickers'
import dayjs from 'dayjs'
import { useNavigation } from '../TestNavigationContext' // Adjust the path as necessary
import './TestGroups.css'
import { fetchWithErrorHandling } from '../utils/api'
import { useError } from '../ErrorContext.jsx'
import TestGroupRow from '../components/TestGroupRow/TestGroupRow'
import NotificationPopup from '../components/NotificationPopup/NotificationPopup'

// App Component
const TestGroups = () => {
    const { env, setEnv, environments, setTestGroup, setTestGroupId, globalDt, setGlobalDt } = useNavigation()
    const [submitMsg, setSubmitMsg] = useState("Add Group")
    const [notification, setNotification] = useState(null)
    const [notificationSuccess, setNotificationSuccess] = useState(true)
    const [showInputs, setShowInputs] = useState(false)
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
    const [groupData, setGroupData] = useState({});
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { showError } = useError()

    useEffect(() => {
        async function fetchUniqueDates() {
            try {
                const data = await fetchWithErrorHandling(`${environments[env].url}get_unique_dates/`, {}, 'get_unique_dates', showError);
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
    
    const fetchGroupDetailsAndResults = async (selectedDate) => {
        if (selectedDate) {
            const formattedDate = selectedDate.replace(/\//g, '-');
            const results = {};
            for (const [envName, envData] of Object.entries(environments)) {
                try {
                    const data = await fetchWithErrorHandling(`${envData.url}get_test_result_summary/?date=${formattedDate}`, {}, 'get_test_result_summary', showError);
                    data.groups_data.forEach(group => {
                        if (!results[group.id]) {
                            results[group.id] = {}
                        }
                        results[group.id][envName] = group;
                    });
                    console.log(data)
                } catch (error) {
                    console.error(`Error fetching data for ${envName}:`, error);
                }
            }
            setGroupData(results);
        }
    };

    const goToHomePage = () => {
        navigate('/');
    }

    const handleGroupNameClick = (test_group, date) => {
        setTestGroup(test_group);
        const group = groupData.find(group => group.Name === test_group);
        const group_id = group ? group.id : null;
        setTestGroupId(group_id);
        navigate(`/testgroup`)
    };

    const onCreateGroup = () => {
        setShowInputs(true);
        setSubmitMsg("Add Group")
        const newFormData = {
            id: crypto.randomUUID(),
            Name: '',
            Machine: '',
            Port: '',
            Scheduled: '',
            TLS: false
        };        
        setGroupData(prevGroupData => ({
            ...prevGroupData,
            [newFormData.id]: environments.DEV ? { DEV: { ...newFormData } } : {}
        }));
    };

    const onDateChange = (newDate) => {
        const formattedDate = newDate ? newDate.format('DD/MM/YYYY') : '';
        setGlobalDt(formattedDate);
        fetchGroupDetailsAndResults(formattedDate);
    };

    const handleTestConnect = async (environment, testData) => {
        setLoading(true);
        setNotification("this will not display, it just to show the loading icon")
        setNotificationSuccess(true)
        try {
            const data = await fetchWithErrorHandling(
                `${environments[environment].url}test_kdb_connection/`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        server: testData.Machine,
                        port: testData.Port,
                        tls: testData.TLS
                    }),
                },
                'test_kdb_connection',
                showError
            )
            if (data.message === "success") {
                setNotification("Connection Successful")
                setNotificationSuccess(true)
            } else {
                setNotification("Connection Failed => " + data.details)
                setNotificationSuccess(false)
                // in future - might use error message in data.details - will require better handling on backend - right now details is a stack trace
            }
        } catch (error) {
            console.error('Error:', error);
            setNotification("Connection Failed => " + String(error))
            setNotificationSuccess(false)
        }
        setLoading(false);
    };

    const updateGroupEnv = async (groupId, env, data, groupName) => {
        if (!groupName) {
            setNotification("Group name is required.")
            setNotificationSuccess(false)
            return
        }

        try {
            const result = await fetchWithErrorHandling(
                `${environments[env].url}upsert_test_group/${groupId}/`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        id: groupId,
                        name: groupName,
                        server: data.Machine,
                        port: data.Port,
                        schedule: data.Scheduled,
                        tls: data.TLS
                    }),
                },
                'upsert_test_group',
                showError
            )
            // update groupData also
            setGroupData(prevState => ({ ...prevState, [groupId]: { ...prevState[groupId], [env]: data } }))
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const isMissing = (date) => {
        return missingDates.has(dayjs(date).format('YYYY-MM-DD'));
    };
    
    return (
        <>
            <Header title={"Home Page"} onClick={goToHomePage} />
            <div style = {{marginLeft: "7%"}}>
                <div className="dateSelector">
                    <DatePicker
                        value={dayjs(globalDt, 'DD/MM/YYYY')}
                        onChange={onDateChange}
                        minDate={startDate}
                        shouldDisableDate={isMissing}
                        maxDate={latestDate}
                    />
                </div>
                {Object.keys(groupData).map((groupId) => (
                    <TestGroupRow
                        key={groupId}
                        environments={environments}
                        group_data={groupData[groupId]}
                        handleTestConnect={handleTestConnect}
                        updateGroupEnv={(env, data, groupName) => updateGroupEnv(groupId, env, data, groupName)}
                    />
                ))}
                <div className="createGroup">
                    <CustomButton onClick={onCreateGroup}>Create Group</CustomButton>
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
        </>
    )
};

export default TestGroups;
