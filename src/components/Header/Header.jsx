import React from 'react'
import BackButton from '../BackButton/BackButton'
import EnvSetingsIcon from '../UserProfile/EnvSetingsIcon'
import './Header.css'
import QsuiteLogo from '../../../assets/qsuite_logo.svg?react'

const Header = ({ title, onClick }) => (
    <header className="header">
      <div className="header-section">
        <BackButton title={title} onClick={onClick} textColor={'white'} fontSize={'20px'} />
      </div>
      <div className="header-section header-title">
        <div className="title-logo-container">
            <div>Qsuite</div>
            <QsuiteLogo style={{ width: '52px', height: '52px', marginLeft: '10px' }} />
        </div>
      </div>
      <div className="header-section">
        <EnvSetingsIcon />
      </div>
    </header>
  )

export default Header
