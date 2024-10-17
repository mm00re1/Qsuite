import React, { useState } from 'react';
import MenuIcon from '@mui/icons-material/Menu';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';

const MenuDropdown = ({ menuItems }) => {
  const [anchorEl, setAnchorEl] = useState(null);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleItemClick = (onChange) => {
    onChange();
    handleClose();
  };

  return (
    <>
      <MenuIcon onClick={handleClick} style={{ cursor: 'pointer' }} />
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
      >
        {menuItems.map((item, index) => (
          <MenuItem key={index} onClick={() => handleItemClick(item.onChange)}>
            {item.name}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};

export default MenuDropdown;
