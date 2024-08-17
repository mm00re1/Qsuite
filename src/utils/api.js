export async function fetchWithErrorHandling(url, options = {}, endpoint, handleError) {
    try {
        const response = await fetch(url, options);

        if (!response.ok) {
            // Capture detailed information about the failed response
            let errorDetails = `HTTP Error: ${response.status} ${response.statusText}`;
            
            try {
                // Try to parse the response body for more details (if any)
                const errorData = await response.json();
                errorDetails += ` - ${errorData.detail || JSON.stringify(errorData)}`;
            } catch (jsonError) {
                // If parsing JSON fails, include that as well
                errorDetails += ' (Failed to parse error details)';
            }
            
            // Call the error handler with the detailed error message
            handleError(endpoint, errorDetails);
            throw new Error(errorDetails); // Throw the error to be caught by the caller
        }

        return await response.json();
    } catch (error) {
        // Capture the full error, including network errors like CORS issues
        const errorDetails = `Network Error: ${error.message} (Check console for more details)`;
        console.error('Full error details:', error); // Log the full error details for debugging
        handleError(endpoint, errorDetails); // Pass the detailed error message to the handler
        throw error; // Re-throw the error so it can be caught by the caller
    }
}
