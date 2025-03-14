import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import App from './App'
import reportWebVitals from './reportWebVitals'
import { ErrorProvider } from './ErrorContext.jsx'
import { Auth0Provider } from '@auth0/auth0-react'
import { NavigationProvider } from './TestNavigationContext'
import ApiProviderBridge from './ApiProviderBridge'

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Auth0Provider
      domain="dev-qzfbzpkoov35dajm.us.auth0.com"
      clientId="b8jpXsNiVcNeFQQruckYntfjUa0708cT"
      authorizationParams={{
        redirect_uri: window.location.origin,
        audience: "https://QsuiteBackendAgents",
        scope: "read:test_data write:test_data"
      }}
    >
      <ErrorProvider>
        <NavigationProvider>
          <ApiProviderBridge>
            <App />
          </ApiProviderBridge>
        </NavigationProvider>
      </ErrorProvider>
    </Auth0Provider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
