import Button from '@mui/material/Button';
import { styled } from '@mui/material/styles';

// Styled Button with sharp corners, specific dimensions, and custom styles
const CustomButton = styled(({ height, width, ...other }) => <Button {...other} />)(({ height = 1, width = 1 }) => ({
    borderRadius: 0,  // Sharp corners
    width: 150 * width,  // Scaled width of the button
    height: 45 * height,  // Scaled height of the button
    backgroundColor: '#D9D9D9',  // Default background color
    border: '1px solid black',   // Black border of 2px
    color: 'black',
    fontSize: `${16 * height}px`, // Scaled font size based on height
    fontFamily: 'Cascadia Code',
    cursor: 'pointer',
    textTransform: 'none',       // Prevents all text from being uppercase
    boxShadow: '0px 12px 18px rgba(0, 0, 0, 0.1)',  // Subtle shadow in normal state
    '&:hover': {
      backgroundColor: '#BBBBBB',  // Background color on hover
    },
    '&:active': {
      boxShadow: 'none',  // Removes shadow on click to simulate depression
    },
    '&:disabled': {
      backgroundColor: '#E0E0E0', // Greyed-out background color when disabled
      color: '#A0A0A0', // Greyed-out text color when disabled
      cursor: 'not-allowed', // Cursor style when disabled
      boxShadow: 'none', // No shadow when disabled
    }
  })
);

export default CustomButton;
