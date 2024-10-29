import React from 'react'

const StatusCard = ({ title, titleStyle, value, valueStyle }) => (
  <div style={{
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '6px 10px',
    border: '1px solid #A7A7A7',
    borderRadius: '0',
    boxShadow: '0px 3px 5px rgba(0, 0, 0, 0.2)',
  }}>
    <div style={{fontSize: '14px', color: 'black', ...titleStyle }}>{title}</div>
    <div style={{ fontSize: '16px', fontWeight: 'bold', ...valueStyle }}>
      {value.split('/').map((part, index, array) => 
        index === 0 ? (
          <React.Fragment key={index}>
            {part}
            {index < array.length - 1 && <span style={{color: 'black'}}>/</span>}
          </React.Fragment>
        ) : (
          <span key={index} style={{color: 'red'}}>{part}</span>
        )
      )}
    </div>
  </div>
)

export default StatusCard

