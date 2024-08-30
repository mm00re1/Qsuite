import React from 'react'

const HoverPopup = ({ content }) => {
  return (
    <div
      style={{
        position: 'absolute',
        backgroundColor: 'white',
        padding: '10px',
        borderRadius: '5px',
        boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)',
        zIndex: 1000,
        top: '-50px',  // Adjust based on your needs
        left: '0px',  // Adjust based on your needs
        whiteSpace: 'nowrap',
      }}
    >
      {content}
    </div>
  );
};

export default HoverPopup