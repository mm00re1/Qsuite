import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Autocomplete, TextField, CircularProgress, Chip, Box } from '@mui/material';
import debounce from 'lodash.debounce';
import { API_URL } from '../../constants'

const SearchTests = ({ linkedTests, handleLinkedTestChange, removeLinkedTest, renderChips, message, group_id }) => {
    const [testNames, setTestNames] = useState([]);
    const [testInputValue, setTestInputValue] = useState('');
    const [loading, setLoading] = useState(false);
    const groupIdRef = useRef(group_id);
    
    useEffect(() => {
        groupIdRef.current = group_id;
    }, [group_id]);

    const fetchTestOptions = async (inputValue) => {
        setLoading(true);
        let fetchUrl;
        if (groupIdRef.current) {
            fetchUrl = `${API_URL}search_tests/?group_id=${groupIdRef.current}&query=${inputValue}&limit=10`;
        } else {
            fetchUrl = `${API_URL}search_tests/?query=${inputValue}&limit=10`;
        }
        const response = await fetch(fetchUrl);
        const data = await response.json();
        setTestNames(data.map(test => ({ "test_case_id": test.id, "Test Name": test["Test Name"] })));
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
