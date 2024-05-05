import Button from '@mui/material/Button';
import { styled } from '@mui/material/styles';

// Styled Button with sharp corners, specific dimensions, and custom styles
const CustomButton = styled(Button)({
    borderRadius: 0,  // Sharp corners
    width: 150,       // Width of the button
    height: 45,       // Height of the button
    backgroundColor: '#D9D9D9',  // Default background color
    border: '1px solid black',   // Black border of 2px
    color: 'black',
    fontSize: '16px',
    fontFamily: 'Cascadia Code',
    cursor: 'pointer',
    textTransform: 'none',       // Prevents all text from being uppercase
    boxShadow: '0px 12px 18px rgba(0, 0, 0, 0.1)',  // Subtle shadow in normal state
    '&:hover': {
      backgroundColor: '#BBBBBB',  // Background color on hover
    },
    '&:active': {
      boxShadow: 'none',  // Removes shadow on click to simulate depression
    }
  });
export default CustomButton;
