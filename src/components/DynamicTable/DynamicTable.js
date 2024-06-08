import React from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, ThemeProvider, createTheme, IconButton } from '@mui/material';
import { Link } from 'react-router-dom';
import EditIcon from '../../assets/edit_icon.svg'; // Import your SVG file

const tableTheme = createTheme({
    components: {
        MuiPaper: {
            styleOverrides: {
                root: {
                    boxShadow: '0px 12px 18px rgba(0, 0, 0, 0.3)',
                    borderRadius: 0,
                }
            }
        }
    }
});

const DynamicTable = ({ columns, data, showCircleButton, onEditButtonClick, currentDate  }) => {
    const handleEditButtonClick = (row) => {
        if (onEditButtonClick) {
            console.log(row);
            onEditButtonClick(row);
        }
    };
    
    return (
        <ThemeProvider theme={tableTheme}>
            <div style={{ display: 'flex', position: 'relative', width: '100%' }}>
                {/* Main Table */}
                <TableContainer component={Paper} style={{ color: "white", flexGrow: 1 }}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                {columns.map((column) => (
                                    <TableCell key={column.field} style={{ fontFamily: 'Cascadia Code', fontWeight: 'bold' }}>
                                        {column.title}
                                    </TableCell>
                                ))}
                                {showCircleButton && <TableCell style={{ width: '50px' }} />}
                                {/* Empty header for the button */}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {data.map((row, rowIndex) => (
                                <TableRow key={rowIndex}>
                                    {columns.map((column) => (
                                        <TableCell key={column.field} style={{ fontFamily: 'Cascadia Code' }}>
                                            {column.field === 'name' ? (
                                                <Link
                                                    to={`/testgroup/${row.name}/${currentDate}`}
                                                    style={{ color: 'inherit', textDecoration: 'underline', fontWeight: 'bold' }}
                                                >
                                                    {row[column.field]}
                                                </Link>
                                            ) : (
                                                row[column.field]
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
