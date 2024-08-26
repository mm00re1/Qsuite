import React from 'react'
import CustomButton from '../CustomButton/CustomButton'

const ConfirmationPopup = ({ message, onConfirm, onCancel }) => {
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
      }}>
        <p style={{ whiteSpace: 'pre-line' }}>{message}</p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '20px' }}>
          <CustomButton onClick={onConfirm}>Confirm</CustomButton>
          <CustomButton onClick={onCancel}>Cancel</CustomButton>
        </div>
      </div>
    </div>
  )
}

export default ConfirmationPopup;