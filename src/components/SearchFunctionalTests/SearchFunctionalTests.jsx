import React, { useState, useCallback, useEffect, useRef } from 'react'
import { Autocomplete, TextField, CircularProgress, Box, Typography } from '@mui/material'
import debounce from 'lodash.debounce'
import { useNavigation } from '../../TestNavigationContext'
import { useError } from '../../ErrorContext.jsx'
import { useAuthenticatedApi } from "../../hooks/useAuthenticatedApi"

const SearchFunctionalTests = ({ selectedTest, group, testGroups, handleTestChange, message, groupMissing, setMessage, setTestStatus }) => {
    const { env, environments } = useNavigation()
    const [testNames, setTestNames] = useState([]);
    const [testInputValue, setTestInputValue] = useState('');
    const [loading, setLoading] = useState(false);
    const groupRef = useRef(group);
    const testGroupsRef = useRef(testGroups);
    const { showError } = useError()
    const { fetchWithAuth } = useAuthenticatedApi(showError)

    async function fetchTestNames() {
        try {
            groupRef.current = group;
            testGroupsRef.current = testGroups;

            if (!groupMissing) {
                const groupId = (testGroups.find(testGroup => testGroup.name === group)).id;
                const data = await fetchWithAuth(
                    `${environments[env].url}/all_functional_tests/?group_id=${groupId}&limit=10`,
                    {},
                    'all_functional_tests',
                );
                if (data.success) {
                    setTestNames(data.results)
                } else {
                    setTestStatus(false)
                    setMessage(data.message)
                }
            }
        } catch (error) {
            console.error('Error fetching test names:', error);
        }
    }

    useEffect(() => {        
        fetchTestNames();
    }, [group, testGroups]);

    const fetchTestOptions = async (inputValue) => {
        setLoading(true);
        const groupId = (testGroupsRef.current.find(testGroup => testGroup.name === groupRef.current)).id;
        try {
            const data = await fetchWithAuth(
                `${environments[env].url}/search_functional_tests/?group_id=${groupId}&query=${inputValue}&limit=10`,
                {},
                'search_functional_tests',
            );
            if (data.success) {
                setTestNames(data.results)
            } else {
                setTestStatus(false)
                setMessage(data.message)
            }
        } catch (error) {
            console.error('Error fetching functional tests:', error);
        }
        setLoading(false);
    };

    const debouncedFetchOptions = useCallback(debounce(fetchTestOptions, 300), []);
    
    const handleTestInputChange = (event, newTestInputValue) => {
        setTestInputValue(newTestInputValue);
        if (newTestInputValue.length > 0) {
            debouncedFetchOptions(newTestInputValue);
        } else {
            setTestNames([]);
        }
    };

    const handleTestChangeWithClear = (event, newValue) => {
        handleTestChange(event, newValue);
        if (newValue === null) {
            fetchTestNames(); // Trigger fetch when the user clears the selection
        }
    };


    return (
        <Box>
            <Autocomplete
                id="test-search-dropdown"
                options={testNames}
                value={selectedTest}
                onChange={handleTestChangeWithClear}
                inputValue={testInputValue}
                onInputChange={handleTestInputChange}
                loading={loading}
                disabled={groupMissing}
                renderInput={(params) => (
                    <TextField
                        {...params}
                        label={message}
                        variant="filled"
                        style={{
                            boxShadow: '0px 12px 18px rgba(0, 0, 0, 0.1)',
                            width: '250px'
                        }}
                        InputLabelProps={{
                            style: {
                                fontFamily: 'Cascadia Code', // Set the font family of the label text
                            }
                        }}
                        InputProps={{
                            ...params.InputProps,
                            style: {
                                backgroundColor: 'white',
                                fontFamily: 'Cascadia Code',
                            },
                            endAdornment: (
                                <>
                                    {loading ? <CircularProgress color="inherit" size={20} /> : null}
                                    {params.InputProps.endAdornment}
                                </>
                            ),
                        }}
                    />
                )}
            />
            {groupMissing && (
                <Typography color="error" style={{ marginTop: '10px', fontFamily: 'Cascadia Code' }}>
                    A group must be selected.
                </Typography>
            )}
        </Box>
    );
};

export default SearchFunctionalTests;
