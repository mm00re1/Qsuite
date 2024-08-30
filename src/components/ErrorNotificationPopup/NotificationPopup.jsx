import React from 'react'
import CustomButton from '../CustomButton/CustomButton'
import KdbQueryStatus from '../KdbQueryStatus/KdbQueryStatus'

const NotificationPopup = ({ message, status, onClose }) => {
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000,
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: '5px',
        textAlign: 'center',
        position: 'relative',
      }}>
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '5px',
            right: '5px',
            background: 'none',
            border: 'none',
            fontSize: '18px',
            cursor: 'pointer',
          }}
        >
          ×
        </button>
        <KdbQueryStatus
                queryStatus={status}
                loading={false}
                message={message}
            />
        <div style={{ marginTop: '20px' }}>
          <CustomButton height={0.8} width={0.5} onClick={onClose}>OK</CustomButton>
        </div>
      </div>
    </div>
  )
}

export default NotificationPopup;