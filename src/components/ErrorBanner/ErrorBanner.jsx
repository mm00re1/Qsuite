import React, { useState, useEffect } from 'react';
import { Snackbar, Card, Button, Typography, IconButton, Collapse } from '@mui/material';
import { Close as CloseIcon, ExpandMore as ExpandMoreIcon, ExpandLess as ExpandLessIcon } from '@mui/icons-material';
import { endpoint_errors } from '../../constants';
import { useError } from '../../ErrorContext';  // Make sure to adjust the path

const ErrorBanner = () => {
    const { errorData, hideError } = useError();  // Access errorData and hideError from context
    const [isExpanded, setIsExpanded] = useState(false);

    // Map the endpoint to a specific error message
    const mappedMessage = errorData ? endpoint_errors[errorData.endpoint] || "Unknown error occurred" : "";

    useEffect(() => {
        if (errorData) {
            setIsExpanded(false);  // Collapse the details when a new error occurs
        }
    }, [errorData]);

    if (!errorData) {
        return null; // Don't render the banner if there's no error
    }

    return (
        <Snackbar
            open={Boolean(errorData)}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            onClose={hideError}  // Use hideError to close the banner
            sx={{ 
                bottom: '2%', 
                left: '5%', 
                right: '5%',  // Offset 10px from the left and right side of the screen
                width: '90%', // Ensure the banner fills the width of the screen with 10px padding on each side
            }}
        >
            <Card 
                sx={{ 
                    padding: 2, 
                    backgroundColor: '#ff4d4d', 
                    color: 'white',
                    boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.1)',
                    width: '100%',
                }}
            >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body1">
                        Backend Agent Error - {mappedMessage}
                    </Typography>
                    {/* Close button positioned on the right */}
                    <IconButton 
                        color="inherit" 
                        onClick={hideError}
                        sx={{ marginLeft: 'auto' }}
                    >
                        <CloseIcon />
                    </IconButton>
                </div>

                {/* Expand/Collapse Button */}
                <Button 
                    color="inherit" 
                    onClick={() => setIsExpanded(!isExpanded)} 
                    sx={{ marginTop: 1, textTransform: 'none', color: 'white', alignSelf: 'flex-start' }}
                    endIcon={isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                >
                    {isExpanded ? "Hide Details" : "Show Details"}
                </Button>

                {/* Expanded Error Details */}
                <Collapse in={isExpanded}>
                    <Typography 
                        variant="body2" 
                        component="pre" 
                        sx={{ 
                            whiteSpace: 'pre-wrap', 
                            color: 'white', 
                            marginTop: 1 
                        }}
                    >
                        {"api call failure - '" + errorData.endpoint + "' ===> " + errorData.errorMessage}
                    </Typography>
                </Collapse>
            </Card>
        </Snackbar>
    );
};

export default ErrorBanner;
