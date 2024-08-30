import React from 'react';
import SettingsIcon from '@mui/icons-material/Settings';
import { useNavigate } from 'react-router-dom'; // Assuming you're using React Router

const EnvSetingsIcon = () => {
  const navigate = useNavigate();

  const handleSettingsClick = () => {
    navigate('/settings'); // Redirect to the settings page
  };

  return (
    <div className="settingsIcon" onClick={handleSettingsClick}>
      <SettingsIcon />
    </div>
  );
};

export default EnvSetingsIcon;
