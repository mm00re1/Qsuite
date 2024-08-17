import React, { createContext, useState, useContext } from 'react';

const ErrorContext = createContext();

export const useError = () => useContext(ErrorContext);

export const ErrorProvider = ({ children }) => {
    const [errorData, setErrorData] = useState(null);

    const showError = (endpoint, errorMessage) => {
        setErrorData({ endpoint, errorMessage });
    };

    const hideError = () => {
        setErrorData(null);
    };

    return (
        <ErrorContext.Provider value={{ errorData, showError, hideError }}>
            {children}
        </ErrorContext.Provider>
    );
};
