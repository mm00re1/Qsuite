import React, { useState, useEffect, useRef } from 'react';
import { Paper, InputBase } from '@mui/material';
import '../CodeTerminal/CodeTerminal.css'; // Make sure to create a CodeTerminal.css file for styles

const CodeDisplay = ({ lines }) => {

  return (
    <Paper elevation={24} className="codeTerminal" style={{ borderRadius: '6px' }}>
      <div className="codeBanner">Code</div>
      <div className="codeBody">
        {lines.map((line, index) => (
            <div className="codeLine" key={index}>
                <InputBase
                    className="codeInput"
                    fullWidth
                    multiline
                    value={line}
                    style={{ color: 'grey', fontFamily: "Cascadia Code" }}
                    spellCheck={false}
                />
            </div>
        ))}
        <div className="codeLine" style={{ height: lines.length == 1 ? '60px' : '30px' }}></div>
      </div>
    </Paper>
  );
};

export default CodeDisplay;
