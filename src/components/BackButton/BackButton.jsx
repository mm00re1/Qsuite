import React from 'react';

const BackButton = ({ title, onClick, textColor, fontSize }) => {
  // State can be added here if needed, for example:
  // const [backTitle, setBackTitle] = React.useState(title);

  return (
    <button
      onClick={onClick}
      style={{
        background: 'none',
        border: 'none',
        color: textColor,
        cursor: 'pointer',
        fontSize: fontSize,
      }}
    >
      {/* Here we'll simply display the title passed as a prop */}
      ← {title}
    </button>
  );
};

export default BackButton;
