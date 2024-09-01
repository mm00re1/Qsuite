// src/contexts/TestDataContext.js
import React, { createContext, useContext, useState } from 'react';
import { fetchWithErrorHandling } from '../utils/api';
import { useError } from '../ErrorContext';
import { useNavigation } from '../TestNavigationContext'; // Adjust the path as necessary

const TestDataContext = createContext();

export const useTestData = () => useContext(TestDataContext);

export const TestDataProvider = ({ children }) => {
    const { env, environments } = useNavigation();
    const { showError } = useError();
    const [testData, setTestData] = useState({});
    const [testGroups, setTestGroups] = useState([]);
    const [testCode, setTestCode] = useState([]);

    const fetchTestData = async (date, testId, testGroupsData) => {
        const formattedDate = date.replace(/\//g, '-');
        const testData = await fetchWithErrorHandling(
            `${environments[env].url}get_test_info/?date=${formattedDate}&test_id=${testId}`, 
            {}, 
            'get_test_info', 
            showError
        );
        setTestData(testData);

        if (!testData.free_form) {
            const groupId = (testGroupsData.find(testGroup => testGroup.name === testData.group_name)).id;
            const testCodeData = await fetchWithErrorHandling(
                `${environments[env].url}view_test_code/?group_id=${groupId}&test_name=${testData.test_code}`, 
                {}, 
                'view_test_code', 
                showError
            );
            if (testCodeData.success) {
                setTestCode(testCodeData.results.split('\n'));
            } else {
                console.error('Error fetching test code:', testCodeData.message);
            }
        }
    };

    const fetchTestGroupsAndData = async (date, testId) => {
        try {
            const testGroupsData = await fetchWithErrorHandling(
                `${environments[env].url}test_groups/`, 
                {}, 
                'test_groups', 
                showError
            );
            setTestGroups(testGroupsData);
            if (date && testId) {
                await fetchTestData(date, testId, testGroupsData);
            }
        } catch (error) {
            console.error('Error fetching test data:', error);
        }
    };

    return (
        <TestDataContext.Provider value={{ testData, testGroups, testCode, fetchTestGroupsAndData }}>
            {children}
        </TestDataContext.Provider>
    );
};
