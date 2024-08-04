import React from 'react';
import { Select, MenuItem, FormControl, InputLabel } from '@mui/material';

const CustomSelector = ({ value, onChange, options, label, minWidth }) => (
    <FormControl variant="filled">
      <InputLabel style={{ fontFamily: 'Cascadia Code' }}>{label}</InputLabel>
      <Select
        value={value}
        label={label}
        onChange={onChange}
        style={{
          backgroundColor: 'white',
          borderRadius: 0,
          fontFamily: 'Cascadia Code',
          boxShadow: '0px 12px 18px rgba(0, 0, 0, 0.1)',
          minWidth: minWidth || '250px',
        }}
        MenuProps={{
          PaperProps: {
            style: {
              backgroundColor: 'white', // Dropdown box color
              maxHeight: '200px', // Limit the height of the dropdown
              marginTop: '8px', // Ensure the dropdown appears just below the input
            },
          },
        }}
      >
        {options.map((option, index) => (
          <MenuItem
            key={index}
            value={option}
            style={{
              fontFamily: 'Cascadia Code',
              display: 'flex',
              justifyContent: 'center',
            }}
          >
            {option}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
);

export default CustomSelector;
