import React, { useState, useEffect } from 'react';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import { useNavigate } from 'react-router-dom';
import UserProfile from '../components/UserProfile/UserProfile';
import CustomButton from '../components/CustomButton/CustomButton';
import TestRunChart from '../components/Charts/TestRunChart';
import './HomePage.css';
import QsuiteLogo from '../../assets/qsuite_logo.svg?react'
import { API_URL } from '../constants'
import { fetchWithErrorHandling } from '../utils/api'
import { useError } from '../ErrorContext.jsx';

const ActionButtons = ({ onViewGroups, onCreateTest }) => (
    <div className="homeButtons">
      <CustomButton onClick={onViewGroups}>Test Groups</CustomButton>
      <CustomButton onClick={onCreateTest}>Create Test</CustomButton>
    </div>
);

const HomePage = () => {
    const [testGroup, setTestGroup] = React.useState("");
    const [testGroupsFull, setTestGroupsFull] = React.useState([]);
    const [testGroups, setTestGroups] = React.useState([]);
    const [testResults, setTestResults] = useState([]); // Add state for test results
    const navigate = useNavigate()
    const { showError } = useError()

    useEffect(() => {
        // Add the class to body when the component mounts
        document.body.classList.add('purple-page');
            // Clean up by removing the class when the component unmounts
        return () => {
            document.body.classList.remove('purple-page');
        };
    }, []);

    useEffect(() => {
        async function fetchTestGroups() {
            try {
                const data = await fetchWithErrorHandling(`${API_URL}test_groups/`, {}, 'test_groups', showError);
                setTestGroupsFull(data);
                const groupNames = data.map(group => group.name);
                setTestGroups(groupNames);
            } catch (error) {
                console.error('Error fetching test groups:', error);
            }
        }

        fetchTestGroups();
    }, []);

    useEffect(() => {
        async function fetchTestResults() {
            try {
                const data = await fetchWithErrorHandling(`${API_URL}get_test_results_30_days/`, {}, 'get_test_results_30_days', showError);
                setTestResults(data);
            } catch (error) {
                console.error('Error fetching test results:', error);
            }
        }

        fetchTestResults();
    }, []); 

    const onGroupChange = async (event) => {
        const selectedGroupName = event.target.value;
        setTestGroup(selectedGroupName);
        const selectedGroup = testGroupsFull.find(group => group.name === selectedGroupName);
    
        if (selectedGroup) {
            try {
                // Fetch test results with error handling
                const data = await fetchWithErrorHandling(
                    `${API_URL}get_test_results_30_days/?group_id=${selectedGroup.id}`,
                    {},
                    'get_test_results_30_days',
                    showError  // Pass the showError function as the error handler
                );
                setTestResults(data);  // Save the result to the state
            } catch (error) {
                console.error('Error fetching test results:', error);
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
        <div>
            <header className="header">
                <div className="header-section"></div>
                <div className="header-section header-title">
                    <div className="title-logo-container">
                        <div>Qsuite</div>
                        <QsuiteLogo style={{ width: '52px', height: '52px', marginLeft: '10px' }} />
                    </div>
                </div>
                <div className="header-section">
                <UserProfile />
                </div>
            </header>
            <div className="white-icon-page">
                <div className="projectSelector">
                    <FormControl variant="filled">
                    <InputLabel style={{ fontFamily: 'Cascadia Code', color: 'white' }}> Test Group </InputLabel>
                        <Select
                        value={testGroup}
                        label="testGroup"
                        onChange={onGroupChange}
                        style={{
                            borderRadius: 0,
                            fontFamily: 'Cascadia Code',
                            boxShadow: '0px 12px 18px rgba(0, 0, 0, 0.2)',
                            minWidth: '250px',
                            color: 'white',
                            backgroundColor: '#280543',
                        }}
                        MenuProps={{
                            PaperProps: {
                                style: {
                                backgroundColor: '#280543', // Dropdown box color
                                color: 'white',
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
                        width: '55%',
                        minWidth: '700px',
                        display: 'flex',
                        justifyContent: 'flex-start',
                    }}>
                    <TestRunChart testResults={testResults} />
                </div>
                <div
                    style={{
                        width: '45%',
                        minWidth: '700px',
                        display: 'flex',
                        justifyContent: 'center',
                    }}>

                </div>
            </div>
            <ActionButtons onViewGroups={viewGroups} onCreateTest={createTest}/>
        </div>
  )
}

export default HomePage;
