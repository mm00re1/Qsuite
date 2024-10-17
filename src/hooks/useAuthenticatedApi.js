import { useAuth0 } from "@auth0/auth0-react";
import { fetchWithErrorHandling } from '../utils/api'

export function useAuthenticatedApi(showError) {
    const { getAccessTokenSilently, isAuthenticated } = useAuth0();
  
    async function fetchWithAuth(url, options = {}, endpoint, customErrorHandler) {
      const handleError = customErrorHandler || showError;

      if (!isAuthenticated) {
        console.log("User is not authenticated!")
        // If the user is not authenticated, log the error or handle it accordingly
        handleError(endpoint, "User is not authenticated. Please log in.");
        throw new Error("User is not authenticated.");
      }
  
      try {
        const token = await getAccessTokenSilently({
          audience: "https://QsuiteBackendAgents", // Ensure this matches your Auth0 API identifier
          scope: "read:test_data write:test_data",
        });
  
        // Include the token in the Authorization header
        const authOptions = {
          ...options,
          headers: {
            ...options.headers,
            Authorization: `Bearer ${token}`,
          },
        };
  
        // Call your existing fetchWithErrorHandling function
        return await fetchWithErrorHandling(url, authOptions, endpoint, handleError);
      } catch (error) {
        console.error("Error fetching access token:", error);
        handleError(endpoint, "Authentication error. Please try logging in again.");
        throw error;
      }
    }
  
    return { fetchWithAuth };
  }
