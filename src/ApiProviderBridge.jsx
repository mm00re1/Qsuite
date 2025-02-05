import React from 'react';
import { useError } from './ErrorContext.jsx'; 
import { ApiProviderNoAuth } from './api/ApiProviderNoAuth.jsx';
// To use auth0, replace "ApiProviderNoAuth" with "ApiProviderAuth0"
//import { ApiProviderAuth0 } from './api/ApiProviderNoAuth.jsx';

export default function ApiProviderBridge({ children }) {
  // get showError from the error context
  const { showError } = useError();
  return (
    <ApiProviderNoAuth showError={showError}>
      {children}
    </ApiProviderNoAuth>
  );
}
