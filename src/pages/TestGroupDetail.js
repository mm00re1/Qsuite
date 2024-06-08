import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Header from '../components/Header/Header.js'
import './TestGroupDetail.css'


const TestGroupDetail = () => {
    const { name, date } = useParams();
    const navigate = useNavigate();
    const [selectedName, setSelectedName] = useState(name || '');
    const [dt, setDt] = useState(date || '');
    const [dts, setDts] = useState([]);
    const [testGroups, setTestGroups] = useState([]);

    useEffect(() => {
        fetch('http://127.0.0.1:5000/test_groups/')
            .then(response => response.json())
            .then(data => {
                setTestGroups(data);
            })
            .catch(error => console.error('Error fetching test groups:', error));
    }, []);

    useEffect(() => {
        fetch('http://127.0.0.1:5000/get_unique_dates/')
            .then(response => response.json())
            .then(data => {
                setDts(data);
                if (!date && data.length > 0) {
                    setDt(data[data.length - 1]); // Set to the latest available date if no date is passed
                }
            })
            .catch(error => console.error('Error fetching dates:', error));
    }, [date]);

    const goToGroupsPage = () => {
        navigate('/testgroups');
    }

    const onGroupChange = (event) => {
        setSelectedName(event.target.value);
    };

    const onDateChange = (event) => {
        setDt(event.target.value);
    };

    return (
      <>
        <Header title={"All Test Groups"} onClick={goToGroupsPage} />
        <div className="groupAndDate">
            <FormControl variant="filled">
            <InputLabel style={{ fontFamily: 'Cascadia Code' }}> Group </InputLabel>
                <Select
                value={selectedName}
                label="Group"
                onChange={onGroupChange}
                style={{
                    backgroundColor: 'white',
                    borderRadius: 0,
                    fontFamily: 'Cascadia Code',
                    boxShadow: '0px 12px 18px rgba(0, 0, 0, 0.1)',
                    minWidth: '250px'
                }}
                MenuProps={{
                    PaperProps: {
                        style: {
                        backgroundColor: 'white', // Dropdown box color
                        }
                    }
                    }}
                >
                    {testGroups.map((option, index) => (
                        <MenuItem
                            key={index}
                            value={option.name}
                            style={{fontFamily: 'Cascadia Code', display: 'flex', justifyContent: 'center'}}
                        >
                            {option.name}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>
            <FormControl variant="filled">
            <InputLabel style={{ fontFamily: 'Cascadia Code' }}> Date </InputLabel>
                <Select
                value={dt}
                label="Date"
                onChange={onDateChange}
                style={{
                    backgroundColor: 'white',
                    borderRadius: 0,
                    fontFamily: 'Cascadia Code',
                    boxShadow: '0px 12px 18px rgba(0, 0, 0, 0.1)',
                    minWidth: '250px'
                }}
                MenuProps={{
                    PaperProps: {
                        style: {
                        backgroundColor: 'white', // Dropdown box color
                        }
                    }
                    }}
                >
                    {dts.map((option, index) => (
                        <MenuItem
                            key={index}
                            value={option}
                            style={{fontFamily: 'Cascadia Code', display: 'flex', justifyContent: 'center'}}
                        >
                            {option}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>
        </div>
    </>
  );
};

export default TestGroupDetail;
