import React from 'react';
import { fetchWithErrorHandling } from '../utils/api';
import ApiContext from './ApiContext';

/**
 * A provider that does NOT require authentication.
 * fetchData is just a plain fetch call (with existing error handling).
 */
export const ApiProviderNoAuth = ({ children, showError }) => {
  // We set this to indicate that there's NO auth
  const enableAuth = false;

  // For "no-auth," you might consider the user always "isAuthenticated"
  // OR always "not authenticated"—depending on your UX. 
  // If you want to skip showing "Login", set it to true (meaning "no login needed"). 
  // If you want a "Login" button to appear anyway, set it to false. 
  const isAuthenticated = true;  
  const isLoading = false;

  // If you'd like a no-op for logout or login, you can define them here
  const loginWithRedirect = () => {
    // do nothing 
  };
  const logout = () => {
    // do nothing
  };

  const fetchData = async (url, options = {}, endpoint, customErrorHandler) => {
    const handleError = customErrorHandler || showError;
    try {
      return await fetchWithErrorHandling(url, options, endpoint, handleError);
    } catch (error) {
      console.error("Error fetching in NoAuth provider:", error);
      handleError(endpoint, "Error occurred while fetching data.");
      throw error;
    }
  };

  const contextValue = {
    fetchData,
    isAuthenticated,
    isLoading,
    loginWithRedirect,
    logout,
    enableAuth  // Expose a flag that says "Auth is turned off"
  };

  return (
    <ApiContext.Provider value={contextValue}>
      {children}
    </ApiContext.Provider>
  );
};
