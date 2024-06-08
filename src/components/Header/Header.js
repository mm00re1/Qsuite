import React from 'react';
import BackButton from '../BackButton/BackButton.js';
import UserProfile from '../UserProfile/UserProfile.js';
import './Header.css';
import { ReactComponent as QsuiteLogo } from '../../assets/qsuite_logo.svg';

const Header = ({ title, onClick }) => (
    <header className="header">
      <div className="header-section">
        <BackButton title={title} onClick={onClick} />
      </div>
      <div className="header-section header-title">
        <div className="title-logo-container">
            <div>Qsuite</div>
            <QsuiteLogo style={{ width: '52px', height: '52px', marginLeft: '10px' }} />
        </div>
      </div>
      <div className="header-section">
        <UserProfile />
      </div>
    </header>
  );

export default Header;
