import React, { useState, useEffect, useRef } from 'react';

function DataFrameTable({ columns, rows, trimmed, numRows, useFlash }) {
    const [flash, setFlash] = useState(false);
    // Keep a ref to the container
    const containerRef = useRef(null);
    
    useEffect(() => {
        if (!useFlash) return;
        if (rows.length === 0) return; // optional
      
        console.log("New rows arrived, re-trigger flash");
      
        // Force a quick toggling OFF → ON with a small delay to guarantee reflow
        setFlash(false);
        const forceFlashTimer = setTimeout(() => {
          setFlash(true);
        }, 10); // small delay
      
        // After animation ends (600ms), turn flash off
        const removeFlashTimer = setTimeout(() => {
          setFlash(false);
        }, 610);
      
        return () => {
          clearTimeout(forceFlashTimer);
          clearTimeout(removeFlashTimer);
        };
      }, [rows, useFlash]);
  
    return (
      <>
        <style>
          {`
            @keyframes flashAnimation {
                0%   { background-color: rgba(150, 150, 150, 0.3); }
                100% { background-color: transparent; }
            }
            .flash {
              animation: flashAnimation 0.6s ease-in-out forwards;
            }
          `}
        </style>
  
        <div
          ref={containerRef}
          className={flash ? 'flash' : ''}
          style={{
            width: '100%',
            fontFamily: 'Cascadia Code',
            transition: 'background-color 0.6s',
          }}
        >
          <table
            style={{
              border: '2px solid #0C0C0C',
              borderCollapse: 'collapse',
              width: '100%',
              textAlign: 'left',
            }}
          >
            <thead>
              <tr>
                {columns.map((col) => (
                  <th
                    key={col}
                    style={{
                      border: '1px solid gray',
                      padding: '8px',
                    }}
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, rowIndex) => (
                <tr key={rowIndex} style={{ borderBottom: '1px solid lightgray' }}>
                  {columns.map((col) => (
                    <td
                      key={col}
                      style={{
                        border: '1px solid gray',
                        padding: '8px',
                      }}
                    >
                      {String(row[col])}
                    </td>
                  ))}
                </tr>
              ))}
  
              {/* Show dots if trimmed */}
              {trimmed && (
                <tr>
                  <td colSpan={columns.length} style={{ textAlign: 'center', padding: '12px' }}>
                    <span style={{ fontSize: '24px' }}>...</span>
                  </td>
                </tr>
              )}
              {trimmed && (
                <tr>
                  <td
                    colSpan={columns.length}
                    style={{ textAlign: 'right', padding: '12px', fontWeight: 'bold' }}
                  >
                    Total rows: {numRows}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </>
    );
  }

export default DataFrameTable
