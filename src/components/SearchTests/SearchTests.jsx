import React, { useState, useCallback, useEffect, useRef } from 'react'
import { Autocomplete, TextField, CircularProgress, Chip, Box } from '@mui/material'
import debounce from 'lodash.debounce'
import { useNavigation } from '../../TestNavigationContext'
import { fetchWithErrorHandling } from '../../utils/api'
import { useError } from '../../ErrorContext.jsx'

const SearchTests = ({ linkedTests, handleLinkedTestChange, removeLinkedTest, renderChips, message, group_id }) => {
    const { env, environments } = useNavigation()
    const [testNames, setTestNames] = useState([]);
    const [testInputValue, setTestInputValue] = useState('');
    const [loading, setLoading] = useState(false);
    const groupIdRef = useRef(group_id);
    const { showError } = useError()
    
    useEffect(() => {
        groupIdRef.current = group_id;
    }, [group_id]);

    const fetchTestOptions = async (inputValue) => {
        setLoading(true);
        try {
            const data = groupIdRef.current
            ? await fetchWithErrorHandling(
                `${environments[env].url}/search_tests/?group_id=${groupIdRef.current}&query=${inputValue}&limit=10`,
                {},
                'search_tests',
                showError
              )
            : await fetchWithErrorHandling(
                `${environments[env].url}/search_tests/?query=${inputValue}&limit=10`,
                {},
                'search_tests',
                showError
              )
            setTestNames(data.map(test => ({ "test_case_id": test.id, "Test Name": test["Test Name"] })));
        } catch (error) {
            console.error('Error fetching test groups:', error);
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
    
    return (
        <div>
            <Autocomplete
                id="test-search-dropdown"
                options={testNames}
                getOptionLabel={(option) => option["Test Name"]}
                value={null} // Prevents chips from being rendered inside the input
                onChange={handleLinkedTestChange}
                inputValue={testInputValue}
                onInputChange={handleTestInputChange}
                loading={loading}
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
            {/* Render selected chips below the dropdown */}
            { renderChips && (
            <Box mt={1} display="flex" flexWrap="wrap" gap={0.5}>
                {linkedTests.map((test, index) => (
                    <Chip
                        key={index}
                        label={test["Test Name"]}
                        onDelete={() => removeLinkedTest(test)}
                        style={{
                            fontFamily: 'Cascadia Code',
                        }}
                    />
                ))}
            </Box>
            )}
        </div>
    );
};

export default SearchTests;
