import React, { useState, useEffect } from 'react'
import Header from '../components/Header/Header'
import { useNavigate } from 'react-router-dom'
import CustomButton from '../components/CustomButton/CustomButton'
import { DatePicker } from '@mui/x-date-pickers'
import dayjs from 'dayjs'
import { useNavigation } from '../TestNavigationContext'
import './TestGroups.css'
import TestGroupRow from '../components/TestGroupRow/TestGroupRow'
import NewTestGroupRow from '../components/NewTestGroupRow'
import NotificationPopup from '../components/NotificationPopup/NotificationPopup'
import ConfirmationPopup from '../components/ConfirmationPopup/ConfirmationPopup'
import { useApi } from '../api/ApiContext'

const TestGroups = () => {
    const { env, environments, globalDt, setGlobalDt, groupData, setGroupData } = useNavigation()
    const [notification, setNotification] = useState(null)
    const [notificationSuccess, setNotificationSuccess] = useState(true)
    const [startDate, setStartDate] = useState(null);
    const [latestDate, setLatestDate] = useState(null);
    const [missingDates, setMissingDates] = useState(new Set());
    const [newGroupData, setNewGroupData] = useState({});
    const [loading, setLoading] = useState(false);
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [groupToDelete, setGroupToDelete] = useState(null);
    const [isFinalEnv, setIsFinalEnv] = useState(false);
    const navigate = useNavigate();
    const { fetchData, isAuthenticated, isLoading } = useApi()


    useEffect(() => {
        async function fetchUniqueDates() {
            try {
                if (!environments[env] || !environments[env].url) {
                    return
                }
                const data = await fetchData(`${environments[env].url}/get_unique_dates/`, {}, 'get_unique_dates');
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
        const envOrder = ['DEV', 'TEST', 'PROD'];
        const orderedEnvs = envOrder.filter(e => environments.hasOwnProperty(e));
        const finalEnv = orderedEnvs[orderedEnvs.length - 1] === env;
        setIsFinalEnv(finalEnv);
        if (!isLoading && isAuthenticated) {
            fetchUniqueDates()
        }
    }, [globalDt, env, isLoading]);

    useEffect(() => {
        if (globalDt && !isLoading && isAuthenticated) {
            fetchGroupDetailsAndResults(globalDt, null);
        }
    }, [globalDt, isLoading]);
    
    const fetchGroupDetailsAndResults = async (selectedDate, group_id) => {
        if (selectedDate) {
            const formattedDate = selectedDate.replace(/\//g, '-');
            const results = {};
            for (const [envName, envData] of Object.entries(environments)) {
                try {
                    const data = await fetchData(`${envData.url}/get_test_result_summary/?date=${formattedDate}`, {}, 'get_test_result_summary');
                    data.groups_data.forEach(group => {
                        if (!results[group.id]) {
                            results[group.id] = {}
                        }
                        results[group.id][envName] = group;
                    });
                } catch (error) {
                    console.error(`Error fetching data for ${envName}:`, error);
                }
            }
            // if group_id is not null, update only that group
            if (group_id) {
                setGroupData(prevState => ({ ...prevState, [group_id]: results[group_id] }))
            } else {
                setGroupData(results);
            }
        }
    };

    const handleReleaseClick = (groupId) => {
        navigate(`/release/${groupId}`)
    }

    const onCreateGroup = () => {
        const newFormData = {
            Name: '',
            Machine: '',
            Port: '',
            Scheduled: '',
            TLS: false,
            Scope: ''
        };        
        setNewGroupData(environments.DEV ? { DEV: { ...newFormData } } : {})
    };

    const onDateChange = (newDate) => {
        const formattedDate = newDate ? newDate.format('DD/MM/YYYY') : '';
        setGlobalDt(formattedDate);
        fetchGroupDetailsAndResults(formattedDate, null);
    };

    const showPopupWithMessage = (message, success) => {
        setNotification(message)
        setNotificationSuccess(success)
    }

    const handleTestConnect = async (environment, testData) => {
        setLoading(true);
        showPopupWithMessage("this will not display, it just to show the loading icon", true)
        try {
            const data = await fetchData(
                `${environments[environment].url}/test_kdb_connection/`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        server: testData.Machine,
                        port: testData.Port,
                        tls: testData.TLS,
                        scope: testData.Scope
                    }),
                },
                'test_kdb_connection'
            )
            if (data.message === "success") {
                showPopupWithMessage("Connection Successful", true)
            } else {
                showPopupWithMessage("Connection Failed => " + data.details, false)
                // in future - might use error message in data.details - will require better handling on backend - right now details is a stack trace
            }
        } catch (error) {
            console.error('Error:', error);
            showPopupWithMessage("Connection Failed => " + String(error), false)
        }
        setLoading(false);
    };

    const handleDeleteClick = (groupId) => {
        setGroupToDelete(groupId);
        setShowConfirmation(true);
    }

    const confirmDelete = async () => {
        setGroupData(prevState => {
            const newState = { ...prevState };
            delete newState[groupToDelete];
            return newState;
        });
        for (const env in groupData[groupToDelete]) {
            if (groupData[groupToDelete].hasOwnProperty(env)) {
                try {
                    await fetchData(
                        `${environments[env].url}/delete_test_group/${groupToDelete}/`,
                        {
                            method: 'DELETE',
                        },
                        'delete_test_group'
                    );
                } catch (error) {
                    console.error(`Error deleting test group for ${env}:`, error);
                }
            }
        }
        setShowConfirmation(false);
        setGroupToDelete(null);
    }
    
    const cancelDelete = () => {
        setShowConfirmation(false);
        setGroupToDelete(null);
    }

    const updateGroupEnv = async (groupId, env, data, groupName, newGroup) => {
        if (!groupName) {
            showPopupWithMessage("Group name is required.", false)
            return
        }
        if (!data.Machine) {
            showPopupWithMessage("Machine is required.", false)
            return
        }
        if (!data.Port) {
            showPopupWithMessage("Port is required.", false)
            return
        }
        if (!data.Scheduled) {
            showPopupWithMessage("Schedule is required.", false)
            return
        }
        if (newGroup) {
            groupId = crypto.randomUUID()
        }

        try {
            await fetchData(
                `${environments[env].url}/upsert_test_group/${groupId}/`,
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
                        tls: data.TLS,
                        scope: data.Scope
                    }),
                },
                'upsert_test_group'
            )
            
            // Manually update the groupData
            setGroupData(prevState => ({
                ...prevState,
                [groupId]: {
                    [env]: {
                        id: groupId,
                        Name: groupName,
                        Machine: data.Machine,
                        Port: data.Port,
                        Scheduled: data.Scheduled,
                        TLS: data.TLS,
                        Scope: data.Scope
                    }
                }
            }))

            if (newGroup) {
                setNewGroupData({})
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const isMissing = (date) => {
        return missingDates.has(dayjs(date).format('YYYY-MM-DD'));
    };
    
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
            <div style = {{marginLeft: "7%", marginBottom: "100px"}}>
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
                        currentEnv={env} // for status card
                        environments={environments}
                        group_data={groupData[groupId]}
                        handleTestConnect={handleTestConnect}
                        updateGroupEnv={(env, data, groupName) => updateGroupEnv(groupId, env, data, groupName, false)}
                        goToTestGroupDetails={() => navigate(`/testgroup/${groupId}`)}
                        handleDeleteClick={() => handleDeleteClick(groupId)}
                        handleReleaseClick={() => handleReleaseClick(groupId)}
                        isFinalEnv={isFinalEnv}
                    />
                ))}
                {(newGroupData && Object.keys(newGroupData).length > 0) ? (
                    <NewTestGroupRow
                        environments={environments}
                        group_data={newGroupData}
                        handleTestConnect={handleTestConnect}
                        updateGroupEnv={(env, data, groupName) => updateGroupEnv(null, env, data, groupName, true)}
                        removeNewGroup={() => setNewGroupData({})}
                        showPopupWithMessage={showPopupWithMessage}
                    />
                ) : (
                    <div className="createGroup">
                        <CustomButton onClick={onCreateGroup}>Create Group</CustomButton>
                    </div>
                )}
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
                    message={`Are you sure you want to delete the group?
                            \nNote that this will also delete all tests in the group`}
                    onConfirm={confirmDelete}
                    onCancel={cancelDelete}
                />
            )}
        </>
    )
};

export default TestGroups;
