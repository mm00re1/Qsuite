
export async function fetchWithErrorHandling(url, options = {}, endpoint, handleError) {
    try {
        const response = await fetch(url, options);

        if (!response.ok) {
            const errorData = await response.json();
            const errorMessage = `Error ${response.status}: ${errorData.detail || response.statusText}`;
            handleError(endpoint, errorMessage); // Call the error handler function from the component
            throw new Error(errorMessage);
        }

        return await response.json();
    } catch (error) {
        handleError(endpoint, error.message); // Handle the error here
        throw error;
    }
}
