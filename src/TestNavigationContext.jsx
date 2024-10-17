import React, { createContext, useState, useContext } from 'react';

const NavigationContext = createContext();

export const NavigationProvider = ({ children }) => {
    const [env, setEnv] = useState("") // ****************************
    const [environments, setEnvironments] = useState({})
    const [testHistory, setTestHistory] = useState([])
    const [globalDt, setGlobalDt] = useState('')
    const [groupData, setGroupData] = useState({});

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
        <NavigationContext.Provider
            value={{
                globalDt,
                setGlobalDt,
                env,
                setEnv,
                environments,
                setEnvironments,
                groupData,
                setGroupData,
                testHistory,
                addTestToHistory,
                removeLastTestFromHistory,
                deleteTestHistory
                }}>
            {children}
        </NavigationContext.Provider>
    );
};

export const useNavigation = () => useContext(NavigationContext);
