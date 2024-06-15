import React, { useState } from 'react';
import Button from '@mui/material/Button';
import { styled } from '@mui/material/styles';

// Styled Button with sharp corners, specific dimensions, and custom styles
const CustomButton = styled(({ height, width, ...other }) => <Button {...other} />)(({ height = 1, width = 1, selected }) => ({
  borderRadius: 0,  // Sharp corners
  width: 150 * width,  // Scaled width of the button
  height: 45 * height,  // Scaled height of the button
  backgroundColor: selected ? '#989898' : '#D9D9D9',  // Background color
  border: '1px solid black',   // Black border of 2px
  color: 'black',
  fontSize: `${16 * height}px`, // Scaled font size based on height
  fontFamily: 'Cascadia Code',
  cursor: 'pointer',
  textTransform: 'none',       // Prevents all text from being uppercase
  boxShadow: selected ? '0px 12px 18px rgba(0, 0, 0, 0.3)' : '0px 12px 18px rgba(0, 0, 0, 0.1)',  // Shadow
  '&:hover': {
    backgroundColor: '#BBBBBB',  // Background color on hover
  },
  '&:active': {
    boxShadow: 'none',  // Removes shadow on click to simulate depression
  }
}));

const CustomSwitchButton = ({ onClick, leftMessage, rightMessage }) => {
  const [selected, setSelected] = useState('left');

  const handleButtonClick = (button) => {
    setSelected(button);
    if (onClick) onClick(button);
  };

  return (
    <div style={{ display: 'flex' }}>
      <CustomButton
        height={1}
        width={1}
        selected={selected === 'left'}
        onClick={() => handleButtonClick('left')}
      >
        {leftMessage}
      </CustomButton>
      <CustomButton
        height={1}
        width={1}
        selected={selected === 'right'}
        onClick={() => handleButtonClick('right')}
      >
        {rightMessage}
      </CustomButton>
    </div>
  );
};

export default CustomSwitchButton;
