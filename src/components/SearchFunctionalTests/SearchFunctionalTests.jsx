import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Autocomplete, TextField, CircularProgress, Box, Typography } from '@mui/material';
import debounce from 'lodash.debounce';
import { API_URL } from '../../constants'

const SearchFunctionalTests = ({ selectedTest, group, testGroups, handleTestChange, message, groupMissing }) => {
    const [testNames, setTestNames] = useState([]);
    const [testInputValue, setTestInputValue] = useState('');
    const [loading, setLoading] = useState(false);
    const groupRef = useRef(group);
    const testGroupsRef = useRef(testGroups);

    useEffect(() => {
        groupRef.current = group;
        testGroupsRef.current = testGroups;
        if (!groupMissing) {
            const groupId = (testGroups.find(testGroup => testGroup.name === group)).id;
            fetch(`${API_URL}all_functional_tests/?group_id=${groupId}&limit=10`)
                .then(response => response.json())
                .then(data => {
                    setTestNames(data);
                })
                .catch(error => console.error('Error fetching test names:', error));
        }
    }, [group, testGroups]);

    const fetchTestOptions = async (inputValue) => {
        setLoading(true);
        const groupId = (testGroupsRef.current.find(testGroup => testGroup.name === groupRef.current)).id;
        const response = await fetch(`${API_URL}search_functional_tests/?group_id=${groupId}&query=${inputValue}&limit=10`);
        const data = await response.json();
        setTestNames(data);
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

    return (
        <Box>
            <Autocomplete
                id="test-search-dropdown"
                options={testNames}
                value={selectedTest}
                onChange={handleTestChange}
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
