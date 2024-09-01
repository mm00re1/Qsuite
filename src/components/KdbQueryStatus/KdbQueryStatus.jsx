import React, { useEffect, useRef } from 'react';
import CircularProgress from '@mui/material/CircularProgress';
import RedCircle from '../../assets/red_circle.svg?react'
import GreenCircle from '../../assets/green_circle.svg?react'


const KdbQueryStatus = ({ queryStatus, loading, message }) => {
    const messageRef = useRef(null);

    useEffect(() => {
        if (queryStatus !== null && messageRef.current) {
            messageRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [queryStatus]);

    return (
        <>
            {(queryStatus !== null || loading) && (
                <div
                    ref={messageRef}
                    style={{
                        marginTop: '40px',
                    }}
                >
                {loading ? (
                    <div
                        style={{
                            display: 'inline-flex',    // Changed to flex to enable flexbox properties
                            alignItems: 'center', 
                            padding: '10px 50px 10px 10px',
                            }}
                    >
                        <CircularProgress
                            style={{ color: '#95B0F8', width: '33px', height: '33px' }}
                            thickness={7}
                        />
                    </div>
                ) : queryStatus ? (
                    <div
                        style={{
                            display: 'inline-flex',    // Changed to flex to enable flexbox properties
                            alignItems: 'center', 
                            padding: '10px 50px 10px 10px',
                            backgroundColor: '#0C0C0C',
                            color: queryStatus ? '#60F82A' : '#FF4242',
                            borderRadius: '6px',
                            font: 'Cascadia Code',
                            fontSize: '17px',
                            boxShadow: '0px 24px 36px rgba(0, 0, 0, 0.2)',
                            }}
                    >
                        <GreenCircle style={{ width: '33px', height: '33px' }} />
                        <p style={{ marginLeft: '10px', whiteSpace: 'pre-line' }}>{message}</p>
                        {/* <span style={{ marginLeft: '10px' }}>{message}</span> */}
                    </div>
                ) : (
                    <div
                        style={{
                            display: 'inline-flex',    // Changed to flex to enable flexbox properties
                            alignItems: 'center', 
                            padding: '10px 50px 10px 10px',
                            backgroundColor: '#0C0C0C',
                            color: queryStatus ? '#60F82A' : '#FF4242',
                            borderRadius: '6px',
                            font: 'Cascadia Code',
                            fontSize: '17px',
                            boxShadow: '0px 24px 36px rgba(0, 0, 0, 0.2)',
                            }}
                    >   <RedCircle style={{ width: '33px', height: '33px' }} />
                        <p style={{ marginLeft: '10px', whiteSpace: 'pre-line' }}>{message}</p>
                    </div>
                )}
                </div>
            )}
        </>
    )
}

export default KdbQueryStatus;
