import React from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, ThemeProvider, createTheme, IconButton } from '@mui/material';
import { Link } from 'react-router-dom';
import EditIcon from '../../assets/edit_icon.svg'; // Import your SVG file
import GreenTick from '../../assets/green_tick.svg'; // Import your SVG file
import RedX from '../../assets/red_x.svg'; // Import your SVG file

const tableTheme = createTheme({
    components: {
        MuiPaper: {
            styleOverrides: {
                root: {
                    boxShadow: '0px 12px 18px rgba(0, 0, 0, 0.3)',
                    borderRadius: 0,
                    backgroundColor: '#f0f0f0'
                }
            }
        }
    }
});

const DynamicTable = ({ data, columnList, showCircleButton, onEditButtonClick, currentDate }) => {

    const handleEditButtonClick = (row) => {
        if (onEditButtonClick) {
            onEditButtonClick(row);
        }
    };

    const roundValue = (val) => {
        if (typeof val === "number") {
            return val.toLocaleString()
        } else {
            return val
        }
    }
    
    return (
        <ThemeProvider theme={tableTheme}>
            <div style={{ display: 'flex', position: 'relative', width: '100%' }}>
                {/* Main Table */}
                <TableContainer component={Paper} style={{ color: "white", flexGrow: 1, maxHeight: '500px' }}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                {columnList.map((column) => (
                                    <TableCell key={column} style={{ fontFamily: 'Cascadia Code', fontWeight: 'bold' }}>
                                        {column}
                                    </TableCell>
                                ))}
                                {showCircleButton && <TableCell style={{ width: '50px' }} />}
                                {/* Empty header for the button */}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {data.map((row, rowIndex) => (
                                <TableRow key={rowIndex}>
                                    {columnList.map((column) => (
                                        <TableCell key={column} style={{ fontFamily: 'Cascadia Code' }}>
                                            {column === 'Name' ? (
                                                <Link
                                                    to={`/testgroup/${row.Name}/${currentDate.replace(/\//g, '-')}`}
                                                    style={{ color: 'inherit', textDecoration: 'underline', fontWeight: 'bold' }}
                                                >
                                                    {row[column]}
                                                </Link>
                                            ) : column === 'Test Name' ? (
                                                <Link
                                                    to={`/test/${row['test_case_id']}`}
                                                    style={{
                                                        color: row["Status"] === true ? '#60E42D' : '#FF1818',
                                                        textDecoration: 'underline',
                                                        fontWeight: 'bold'
                                                    }}
                                                >
                                                    {row[column]}
                                                </Link>
                                            ) : column === 'Status' ? (
                                                <img src={row["Status"] === true ? GreenTick : RedX } alt="edit icon" style={{ width: '10%', height: '10%' }} />
                                            ) : (
                                                roundValue(row[column])
                                            )}
                                        </TableCell>
                                    ))}
                                    {showCircleButton && (
                                        <TableCell style={{ width: '50px', padding: '8px 0', textAlign: 'center' }}>
                                            <IconButton
                                                style={{
                                                    borderRadius: '50%',
                                                    width: '30px',
                                                    height: '30px',
                                                    padding: 0,
                                                    border: 'none',
                                                    outline: 'none',
                                                    backgroundColor: 'transparent',
                                                }}
                                                onClick={() => handleEditButtonClick(row)}
                                            >
                                                <img src={EditIcon} alt="edit icon" style={{ width: '100%', height: '100%' }} />
                                            </IconButton>
                                        </TableCell>
                                    )}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </div>
        </ThemeProvider>
    );
};

export default DynamicTable;
