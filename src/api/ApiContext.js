import React, { createContext, useContext } from 'react';

const ApiContext = createContext(null);

// A simple hook to consume the ApiContext
export const useApi = () => {
  return useContext(ApiContext);
};

export default ApiContext;
