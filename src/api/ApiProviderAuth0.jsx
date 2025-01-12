import React from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { fetchWithErrorHandling } from '../utils/api';
import ApiContext from './ApiContext';

/**
 * This Provider wraps Auth0 logic and injects "fetchData", "isAuthenticated",
 * and "isLoading" into the ApiContext. 
 */
export const ApiProviderAuth0 = ({ children, showError }) => {
    const { 
        getAccessTokenSilently,
        isAuthenticated,
        isLoading,
        loginWithRedirect,
        logout
        } = useAuth0();
    
    const enableAuth = true;

    // Replaces fetchWithAuth, but now we call it "fetchData" generically.
    const fetchData = async (url, options = {}, endpoint, customErrorHandler) => {
        const handleError = customErrorHandler || showError;

        if (!isAuthenticated) {
        console.log("User is not authenticated!");
        handleError(endpoint, "User is not authenticated. Please log in.");
        throw new Error("User is not authenticated.");
        }

        try {
        // Get the access token from Auth0
        const token = await getAccessTokenSilently({
            audience: "https://QsuiteBackendAgents", 
            scope: "read:test_data write:test_data",
        });

        // Attach the token to the Authorization header
        const authOptions = {
            ...options,
            headers: {
            ...options.headers,
            Authorization: `Bearer ${token}`,
            },
        };

        // Perform the fetch, with your existing error handling
        return await fetchWithErrorHandling(url, authOptions, endpoint, handleError);
        } catch (error) {
        console.error("Error fetching access token:", error);
        handleError(endpoint, "Authentication error. Please try logging in again.");
        throw error;
        }
  };

    // Provide these values to any consuming component
    const contextValue = {
        fetchData,
        isAuthenticated,
        isLoading,
        loginWithRedirect,
        logout,
        enableAuth
    };

    return (
        <ApiContext.Provider value={contextValue}>
        {children}
        </ApiContext.Provider>
    );
};
