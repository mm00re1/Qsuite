import React from 'react'

function QDictionaryTable({ data }) {
    // Find the longest key for alignment
    const longestKeyLength = data.reduce((max, item) => Math.max(max, item.key.length), 0)
  
    return (
      <div style={{ fontFamily: 'monospace' }}>
        {data.map((item, index) => {
          // Pad the key to align with the longest key length
          const paddedKey = item.key.padEnd(longestKeyLength, ' ')
  
          // Display the key-value pair with aligned "|"
          return (
            <div key={index}>
              {paddedKey} | {item.value}
            </div>
          )
        })}
      </div>
    )
  }

export default QDictionaryTable
