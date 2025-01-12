import React, { useState, useEffect } from 'react';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import { useNavigate } from 'react-router-dom';
import CustomButton from '../components/CustomButton/CustomButton';
import TestRunChart from '../components/Charts/TestRunChart';
import './HomePage.css';
import { useNavigation } from '../TestNavigationContext'
import Header from '../components/Header/Header'
import StatusCard from '../components/StatusCard'
import CircularProgress from '@mui/material/CircularProgress'
import { useApi } from '../api/ApiContext'

  
const HomePage = () => {
    const { env, environments } = useNavigation();
    const [testGroup, setTestGroup] = React.useState("");
    const [testGroupsFull, setTestGroupsFull] = React.useState([]);
    const [testGroups, setTestGroups] = React.useState([]);
    const [testResults, setTestResults] = useState([]); // Add state for test results
    const [lastPassedCount, setLastPassedCount] = useState(0);
    const [lastFailedCount, setLastFailedCount] = useState(0);
    const [vsPrevDay, setVsPrevDay] = useState(0);
    const [vsMonthAvg, setVsMonthAvg] = useState(0);
    const [loading, setLoading] = useState(false);
    const [lastDay, setLastDay] = useState("")
    const navigate = useNavigate()
    const { fetchData, isAuthenticated, isLoading } = useApi()


    /*useEffect(() => {
        // Add the class to body when the component mounts
        document.body.classList.add('purple-page');
            // Clean up by removing the class when the component unmounts
        return () => {
            document.body.classList.remove('purple-page');
        };
    }, []);*/

    const calcDisplayMetrics = (data) => {
        // Extract passed and failed counts from the most recent day
        const lastDay = data[data.length - 1];
        const lastPassedCount = lastDay.passed;
        const lastFailedCount = lastDay.failed;
        setLastPassedCount(lastPassedCount);
        setLastFailedCount(lastFailedCount);

        // Calculate pass rate for the last day and the day before
        const lastDayPassRate = lastPassedCount / (lastPassedCount + lastFailedCount) * 100;
        const prevDay = data[data.length - 2];
        const prevDayPassRate = prevDay.passed / (prevDay.passed + prevDay.failed) * 100;

        // Calculate vsPrevDay
        const vsPrevDay = ((lastDayPassRate - prevDayPassRate) / prevDayPassRate * 100).toFixed(2);
        setVsPrevDay(vsPrevDay);

        // Calculate average pass rate for the month
        const monthAvgPassRate = data.reduce((sum, day) => {
            const dayPassRate = day.passed / (day.passed + day.failed) * 100;
            return sum + dayPassRate;
        }, 0) / data.length;

        // Calculate vsMonthAvg
        const vsMonthAvg = ((lastDayPassRate - monthAvgPassRate) / monthAvgPassRate * 100).toFixed(2);
        setVsMonthAvg(vsMonthAvg);
    }


    useEffect(() => {
        async function fetchTestGroups() {
            try {
                if (!environments[env] || !environments[env].url) {
                    return
                }
                const data = await fetchData( `${environments[env].url}/test_groups/`, {}, "test_groups");
                setTestGroupsFull(data);
                const groupNames = data.map(group => group.name);
                setTestGroups(groupNames);
            } catch (error) {
                console.error('Error fetching test groups:', error);
            }
        }
        if (!isLoading && isAuthenticated) {
            fetchTestGroups();
            setTestGroup("")
        }
    }, [env,isLoading]);

    useEffect(() => {
        async function fetchTestResults() {
            setLoading(true)
            try {
                if (!environments[env] || !environments[env].url) {
                    return
                }
                const data = await fetchData(`${environments[env].url}/get_test_results_30_days/`, {}, 'get_test_results_30_days')
                if (data.length > 0) {
                    setTestResults(data)
                    setLastDay(data[data.length - 1].date)
                    calcDisplayMetrics(data)
                } else {
                    setTestResults([])
                    setLastDay("")
                }
            } catch (error) {
                console.error('Error fetching test results:', error);
            } finally {
                setLoading(false)
            }
        }
        if (!isLoading && isAuthenticated) {
            fetchTestResults();
        }
    }, [env,isLoading]); 

    const onGroupChange = async (event) => {
        const selectedGroupName = event.target.value;
        setTestGroup(selectedGroupName);
        const selectedGroup = testGroupsFull.find(group => group.name === selectedGroupName);
    
        if (selectedGroup) {
            try {
                setLoading(true)
                // Fetch test results with error handling
                const data = await fetchData(
                    `${environments[env].url}/get_test_results_30_days/?group_id=${selectedGroup.id}`,
                    {},
                    'get_test_results_30_days',
                );
                setTestResults(data)  // Save the result to the state
                setLastDay(data[data.length - 1].date)
                calcDisplayMetrics(data)
            } catch (error) {
                console.error('Error fetching test results:', error);
            } finally {
                setLoading(false)
            }
        }
    };

    const viewGroups = () => {
        navigate('/testgroups');
    }

    const createTest = () => {
        navigate('/addtest');
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
            <div className="white-icon-page">
                <div style={{marginTop: '30px', marginLeft: '10%', display: 'flex', paddingBottom: '20px' }}>
                    <FormControl variant="filled">
                    <InputLabel style={{ fontFamily: 'Cascadia Code' }}> Test Group </InputLabel>
                        <Select
                        value={testGroup}
                        label="testGroup"
                        onChange={onGroupChange}
                        style={{
                            borderRadius: 0,
                            fontFamily: 'Cascadia Code',
                            boxShadow: '0px 12px 18px rgba(0, 0, 0, 0.2)',
                            minWidth: '250px',
                            //color: 'white',
                            backgroundColor: 'white',
                        }}
                        MenuProps={{
                            PaperProps: {
                                style: {
                                //backgroundColor: '#280543', // Dropdown box color
                                //color: 'white',
                                }
                            }
                            }}
                        >
                            {testGroups.map((option, index) => (
                                <MenuItem
                                    key={index}
                                    value={option}
                                    style={{fontFamily: 'Cascadia Code', display: 'flex', justifyContent: 'center'}}
                                >
                                    {option}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </div>
            </div>
            <div style={{ display: 'flex', width: '100%' }}>
                <div
                    style={{
                        width: '60%',
                        minWidth: '700px',
                        display: 'flex',
                        justifyContent: 'flex-start',
                    }}>
                    {loading ? (
                        <div style={{ margin: 'auto' }}>
                            <div style={{ marginBottom: '210px' }}/>
                            <CircularProgress
                                style={{ color: '#95B0F8', width: '33px', height: '33px' }}
                                thickness={7}
                            />
                            <div style={{ marginBottom: '210px' }}/>
                        </div>
                    ) : (
                        <TestRunChart testResults={testResults} />
                    )}
                </div>
                <div style={{
                    width: '40%',
                    minWidth: '400px',
                    paddingLeft: '120px',
                    display: 'flex',
                    marginTop: '130px',
                }}>
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '12px',
                        width: '250px',
                        fontFamily: 'Cascadia Code'
                    }}>
                        <div style={{marginBottom: '20px'}}>
                        <StatusCard
                            title="Test Stats"
                            titleStyle={{ fontWeight: 'bold' }}
                            value={lastDay}
                            valueStyle={{ color: 'black' }}
                        />
                        </div>
                        <StatusCard
                            title="Passed/Failed"
                            value={`${lastPassedCount}/${lastFailedCount}`}
                            valueStyle={{ color: '#00FF00' }}
                        />
                        <StatusCard
                            title="Pass %"
                            value={`${(lastPassedCount / (lastPassedCount + lastFailedCount) * 100).toFixed(2)}%`}
                            valueStyle={{ color: '#00FF00' }}
                        />
                        <StatusCard
                            title="vs Prev Day"
                            value={`${vsPrevDay > 0 ? '↑' : '↓'} ${Math.abs(vsPrevDay)}%`}
                            valueStyle={{ color: vsPrevDay >= 0 ? '#00FF00' : 'red' }}
                        />
                        <StatusCard
                            title="vs Month Avg"
                            value={`${vsMonthAvg > 0 ? '↑' : '↓'} ${Math.abs(vsMonthAvg)}%`}
                            valueStyle={{ color: vsMonthAvg >= 0 ? '#00FF00' : 'red' }}
                        />
                    </div>
                </div>
            </div>
            <div style={{
                marginLeft: '0%',
                marginTop: '50px',
                marginBottom: '110px',
                display: 'flex', /* Aligns children inline */
                justifyContent: 'center', /* Centers the items horizontally */
                gap: '50px'
                }}>
                <CustomButton onClick={viewGroups}>Test Groups</CustomButton>
                <CustomButton onClick={createTest}>Create Test</CustomButton>
            </div>
        </>
  )
}

export default HomePage;
