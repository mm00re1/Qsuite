import React, { useState, useEffect, useRef } from 'react';
import { Paper, InputBase } from '@mui/material';
import './CodeTerminal.css'; // Make sure to create a CodeTerminal.css file for styles

const CodeTerminal = ({ lines, onLinesChange }) => {
  const [activeIndex, setActiveIndex] = useState(0); // Active line index
  const inputRefs = useRef([]); // Array of refs for each InputBase

  useEffect(() => {
    // Focus the active input whenever the activeIndex changes
    if (inputRefs.current[activeIndex]) {
      inputRefs.current[activeIndex].focus();
    }
  }, [activeIndex, lines]);

  const handleKeyDown = (event, index) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      const newLines = [...lines];
      // Append a semicolon if the line is not empty and does not already end with one
      if (newLines[index].trim() !== '' && !newLines[index].trim().endsWith(';')) {
        newLines[index] += ';';
      }
      // Insert a new empty line right after the current line
      newLines.splice(index + 1, 0, '');
      onLinesChange(newLines);
      setActiveIndex(index + 1); // Move cursor to the newly added line
    } else if (event.key === 'ArrowDown' && index < lines.length - 1) {
      event.preventDefault();
      setActiveIndex(index + 1);
    } else if (event.key === 'ArrowUp' && index > 0) {
      event.preventDefault();
      setActiveIndex(index - 1);
    } else if (event.key === 'Backspace' && lines[index] === '' && lines.length > 1) {
      event.preventDefault();
      const newLines = [...lines];
      newLines.splice(index, 1); // Remove the current line
      onLinesChange(newLines);
      setActiveIndex(Math.max(index - 1, 0)); // Move up the cursor
    }
  };

  const handleChange = (event, index) => {
    if (activeIndex !== index) {
      setActiveIndex(index); // Update active index on type
    }
    onLinesChange(lines.map((content, i) => i === index ? event.target.value : content))
  };

  return (
    <Paper elevation={24} className="codeTerminal" style={{ borderRadius: '6px' }}>
      <div className="codeBanner">Code</div>
      <div className="codeBody">
        {lines.map((line, index) => (
            <div className="codeLine" key={index}>
                <span className="codePrefix">q)</span>
                <InputBase
                    className="codeInput"
                    fullWidth
                    multiline
                    value={line}
                    onChange={(event) => handleChange(event, index)}
                    //onKeyPress={(event) => handleEnterPress(event, index)}
                    onKeyDown={(event) => handleKeyDown(event, index)}
                    inputRef={(el) => inputRefs.current[index] = el} // Assign ref
                    style={{ color: 'white', fontFamily: "Cascadia Code" }}
                    spellCheck={false}
                />
            </div>
        ))}
        <div className="codeLine" style={{ height: '30px' }}></div>
      </div>
    </Paper>
  );
};

export default CodeTerminal;
