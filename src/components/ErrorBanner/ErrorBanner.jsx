import React, { useState } from 'react';
import { Snackbar, Card, Button, Typography, IconButton, Collapse } from '@mui/material';
import { Close as CloseIcon, ExpandMore as ExpandMoreIcon, ExpandLess as ExpandLessIcon } from '@mui/icons-material';
import { endpoint_errors } from '../../constants';

const ErrorBanner = ({ endpoint, errorMessage }) => {
    const [isVisible, setIsVisible] = useState(true);
    const [isExpanded, setIsExpanded] = useState(false);
    const mappedMessage = endpoint_errors[endpoint] || "Unknown error occurred";

    if (!isVisible) {
        return null; // Don't render the banner if it's not visible
    }

    return (
        <Snackbar
            open={isVisible}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            onClose={() => setIsVisible(false)}
            sx={{ 
                bottom: 16, 
                left: 10, 
                right: 10,  // Offset 10px from the left and right side of the screen
                width: 'calc(100% - 20px)', // Ensure the banner fills the width of the screen with 10px padding on each side
            }}
        >
            <Card 
                sx={{ 
                    padding: 2, 
                    backgroundColor: '#ff4d4d', 
                    color: 'white',
                    display: 'flex', 
                    flexDirection: 'column', 
                    position: 'relative', 
                    boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.1)',
                }}
            >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body1">
                        Backend Agent Error - {mappedMessage}
                    </Typography>
                    {/* Close button positioned on the right */}
                    <IconButton 
                        color="inherit" 
                        onClick={() => setIsVisible(false)} 
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
                        {errorMessage}
                    </Typography>
                </Collapse>
            </Card>
        </Snackbar>
    );
};

export default ErrorBanner;
