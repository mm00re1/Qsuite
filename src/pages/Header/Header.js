import React from 'react';
import BackButton from './BackButton';
import UserProfile from './UserProfile';
import './Header.css'; // Make sure to create a Header.css file for styles

const Header = ({ title }) => (
  <header className="header">
    <BackButton title={title} />
    <h1 className="headerTitle">Qsuite</h1>
    <UserProfile />
  </header>
);

export default Header;
