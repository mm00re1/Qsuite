import React, { createContext, useState, useContext } from 'react';

const TestNavigationContext = createContext();

export const TestNavigationProvider = ({ children }) => {
    const [testHistory, setTestHistory] = useState([]);

    const addTestToHistory = (testId) => {
        if (testHistory.length === 0) {
            setTestHistory([testId]);
        } else if (testId !== testHistory[testHistory.length - 1]) {
            setTestHistory((prevHistory) => [...prevHistory, testId]);
        }
    };

    const removeLastTestFromHistory = () => {
        setTestHistory((prevHistory) => prevHistory.slice(0, -1));
    };

    const deleteTestHistory = () => {
        setTestHistory([]);
    };

    return (
        <TestNavigationContext.Provider value={{ testHistory, addTestToHistory, removeLastTestFromHistory, deleteTestHistory }}>
            {children}
        </TestNavigationContext.Provider>
    );
};

export const useTestNavigation = () => useContext(TestNavigationContext);
