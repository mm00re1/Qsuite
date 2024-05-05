import React from 'react';

const BackButton = ({ title }) => {
  // State can be added here if needed, for example:
  // const [backTitle, setBackTitle] = React.useState(title);

  return (
    <button className="backButton" onClick={() => console.log('Back button clicked')}>
      {/* Here we'll simply display the title passed as a prop */}
      ← {title}
    </button>
  );
};

export default BackButton;
