import React from 'react';
import BackButton from '../BackButton/BackButton.js';
import UserProfile from '../UserProfile/UserProfile.js';
import './Header.css';

const Header = ({ title }) => (
    <header className="header">
      <div className="header-section">
        <BackButton title={title} />
      </div>
      <div className="header-section header-title">
        <div>Qsuite</div>
      </div>
      <div className="header-section">
        <UserProfile />
      </div>
    </header>
  );

export default Header;
