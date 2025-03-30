import React, { useMemo, useState } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, ThemeProvider, createTheme, IconButton } from '@mui/material';
import EditIcon from '../../assets/edit_icon.svg'; // Import your SVG file
import GreenTick from '../../assets/green_tick.svg'; // Import your SVG file
import RedX from '../../assets/red_x.svg'; // Import your SVG file
import Checkbox from '@mui/material/Checkbox';
//import HoverPopup from '../HoverPopup'

const tableTheme = createTheme({
    components: {
        MuiPaper: {
            styleOverrides: {
                root: {
                    boxShadow: '0px 12px 18px rgba(0, 0, 0, 0.3)',
                    borderRadius: 0,
                    backgroundColor: 'white' //'#f0f0f0'   '#280543'
                }
            }
        }
    }
});

const DynamicTable = ({ data = [], columnList = [], showCheckbox, onCheckboxChange, onTestNameClick, onGroupNameClick, currentDate }) => {
    //const [hoveredTestName, setHoveredTestName] = useState(null);
    //const [selectedRows, setSelectedRows] = useState([]);
    const textColor = 'black';
    
    const handleCheckboxChange = (id) => {
        if (onCheckboxChange) {
            onCheckboxChange(id);
        }
    };

    const handleTestNameClick = (test_result_id, test_case_id, date) => {
        if (onTestNameClick) {
            onTestNameClick(test_result_id, test_case_id, date);
        }
    };

    const handleGroupNameClick = (group_name, date) => {
        if (onGroupNameClick) {
            onGroupNameClick(group_name, date);
        }
    };

    /*const handleTestNameMouseEnter = (event, testName) => {
        const { clientX, clientY } = event;
        setHoveredTestName({ testName, x: clientX, y: clientY });
    };

    const handleTestNameMouseLeave = () => {
        setHoveredTestName(null);
    };*/

    const parseValue = (val) => {
        if (typeof val === "number") {
            return val.toLocaleString();
        } else if (typeof val === "string") {
            // If text is greater than 20 chars, cut and replace with ...
            return val.length > 25 ? `${val.slice(0, 22)}...` : val;
        } else {
            return String(val);
        }
    };

    // Calculate the max width needed for each column
    const columnWidths = useMemo(() => {
        const widths = {};
        columnList.forEach(column => {
            const maxWidths = data.map(row => {
                const cellValue = row[column] ? row[column].toLocaleString() : '';
                return cellValue.length * 10 + 15; // Adjust the multiplier as needed
            });
            widths[column] = Math.max(...maxWidths, column.length * 10 + 15);
        });
        return widths;
    }, [data, columnList]);

    // Calculate the total width of the table
    const totalWidth = useMemo(() => {
        return columnList.reduce((sum, column) => sum + columnWidths[column], 0) + (showCheckbox ? 50 : 0) + 200; // Add extra space for padding and other elements
    }, [columnWidths, columnList, showCheckbox]);

    return (
        <ThemeProvider theme={tableTheme}>
            <div style={{ display: 'flex', position: 'relative', width: '100%' }}>
                {/* Main Table */}
                <div style={{ maxWidth: `${totalWidth + 300}px`, margin: '0', paddingRight: '16px' }}>
                <TableContainer component={Paper} style={{ flexGrow: 1, maxHeight: '500px', minWidth: '250px' }}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                {columnList.map((column) => (
                                    <TableCell key={column} style={{ color: textColor, fontFamily: 'Cascadia Code', fontWeight: 'bold', minWidth: columnWidths[column] }}>
                                        {column}
                                    </TableCell>
                                ))}
                                {showCheckbox && <TableCell style={{ width: '50px' }} />}
                                {/* Empty header for the button */}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {data.map((row, rowIndex) => (
                                <TableRow key={rowIndex}>
                                    {columnList.map((column) => (
                                        <TableCell key={column} style={{ color: textColor, fontFamily: 'Cascadia Code', minWidth: columnWidths[column] }}>
                                            {column === 'Name' ? (
                                                <span
                                                    onClick={() => handleGroupNameClick(row.Name, currentDate.replace(/\//g, '-'))}
                                                    style={{ cursor: 'pointer', color: 'inherit', textDecoration: 'underline', fontWeight: 'bold' }}
                                                >
                                                    {row[column]}
                                                </span>
                                            ) : column === 'Test Name' ? (
                                                <span
                                                    onClick={() => handleTestNameClick(row['id'], row['test_case_id'], currentDate.replace(/\//g, '-'))}
                                                    //onMouseEnter={(e) => handleTestNameMouseEnter(e, row[column])}
                                                    //onMouseLeave={handleTestNameMouseLeave}
                                                    style={{
                                                        cursor: 'pointer',
                                                        color: row["Status"] === true ? '#60E42D' : row["Status"] === false ? '#FF1818' : 'black',
                                                        textDecoration: 'underline',
                                                        fontWeight: 'bold',
                                                        position: 'relative'
                                                    }}
                                                >
                                                    {row[column]}
                                                    {//hoveredTestName && hoveredTestName.testName === row[column] && (
                                                        //<HoverPopup content={row[column]} />
                                                    //)
                                                    }
                                                </span>
                                            ) : column === 'Status' ? (
                                                row["Status"] === true ? (
                                                    <img src={GreenTick} alt="green tick" style={{ width: '20%', height: '20%' }} />
                                                ) : row["Status"] === false ? (
                                                    <img src={RedX} alt="red x" style={{ width: '20%', height: '20%' }} />
                                                ) : null
                                            ) : (
                                                parseValue(row[column])
                                            )}
                                        </TableCell>
                                    ))}
                                    {showCheckbox && (
                                        <TableCell style={{ width: '50px', padding: '8px 0', textAlign: 'center' }}>
                                            <Checkbox
                                                checked={row.Selected || false}
                                                onChange={() => handleCheckboxChange(row.test_case_id)}
                                                color="primary"
                                                style={{
                                                    padding: 0,
                                                }}
                                            />
                                        </TableCell>
                                    )}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
                </div>
            </div>
        </ThemeProvider>
    );
};

export default DynamicTable;
