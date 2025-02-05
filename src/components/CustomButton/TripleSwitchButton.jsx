import React, { useState } from 'react';
import Button from '@mui/material/Button';
import { styled } from '@mui/material/styles';

// Styled Button with sharp corners, specific dimensions, and custom styles
const CustomButton = styled(({ height, width, selected, disabled, ...other }) => (
  <Button {...other} disabled={disabled} />
))(({ height = 1, width = 1, selected }) => ({
  borderRadius: 0,  // Sharp corners
  width: 150 * width,  // Scaled width of the button
  height: 45 * height,  // Scaled height of the button
  backgroundColor: selected ? '#22023A' : 'white',  // Background color
  color: selected ? 'white' : '#22023A',
  fontSize: `${16 * height}px`, // Scaled font size based on height
  fontFamily: 'Cascadia Code',
  cursor: 'pointer',
  textTransform: 'none',       // Prevents all text from being uppercase
  boxShadow: selected
    ? '0px 12px 18px rgba(0, 0, 0, 0.3)'
    : '0px 12px 18px rgba(0, 0, 0, 0.1)',  // Shadow
  '&:hover': {
    backgroundColor: selected ? '#22023A' : '#EBEBEB',  // Background color on hover
  },
  '&:active': {
    boxShadow: 'none',  // Removes shadow on click to simulate depression
  },
  '&.Mui-disabled': {
    backgroundColor: selected ? '#22023A' : 'white',  // Disabled background color
    color: selected ? 'white' : '#22023A',  // Disabled text color
    cursor: 'default',  // Default cursor
  },
}));

const TripleSwitchButton = ({ onClick, leftMessage, middleMessage, rightMessage }) => {
  const [selected, setSelected] = useState('left');

  const handleButtonClick = (button, msg) => {
    setSelected(button);
    if (onClick) onClick(msg);
  };

  return (
    <div style={{ display: 'flex', marginTop: '8px', marginRight: '10px' }}>
      <CustomButton
        height={1}
        width={1}
        selected={selected === 'left'}
        disabled={selected === 'left'}
        onClick={() => handleButtonClick('left', leftMessage)}
      >
        {leftMessage}
      </CustomButton>
      <CustomButton
        height={1}
        width={1}
        selected={selected === 'middle'}
        disabled={selected === 'middle'}
        onClick={() => handleButtonClick('middle', middleMessage)}
      >
        {middleMessage}
      </CustomButton>
      <CustomButton
        height={1}
        width={1}
        selected={selected === 'right'}
        disabled={selected === 'right'}
        onClick={() => handleButtonClick('right', rightMessage)}
      >
        {rightMessage}
      </CustomButton>
    </div>
  );
};

export default TripleSwitchButton;
