import { useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import AddTestPage from './pages/AddTest'
import TestGroups from './pages/TestGroups'
import HomePage from './pages/HomePage'
import TestGroupDetail from './pages/TestGroupDetail'
import TestDetail from './pages/TestDetail'
import EnvSettings from './pages/EnvSettings'
import Release from './pages/Release'
import Login from './pages/Login'
import { LocalizationProvider } from '@mui/x-date-pickers'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import 'dayjs/locale/en-gb'
import { useError } from './ErrorContext.jsx'
import ErrorBanner from './components/ErrorBanner/ErrorBanner'
import './App.css'
import { useNavigation } from './TestNavigationContext'
import { useAuth0 } from "@auth0/auth0-react"
import { useAuthenticatedApi } from "./hooks/useAuthenticatedApi"

function App() {
  const { errorData, showError } = useError()
  const { fetchWithAuth } = useAuthenticatedApi(showError)
  const { isAuthenticated, isLoading } = useAuth0()
  const { setEnv, setEnvironments } = useNavigation()

  useEffect(() => {
    async function fetchAgentUrls() {
        try {
            const data = await fetchWithAuth("/api/get_agent_urls/", {}, "get_agent_urls")
            const formattedEnvironments = Object.entries(data).reduce((acc, [key, value]) => {
              acc[key] = { url: value, isEditing: false, isSaved: true }
              return acc
            }, {})
            setEnvironments(formattedEnvironments)
            const envOrder = ['DEV', 'TEST', 'PROD']
            const orderedEnvs = envOrder.filter(e => formattedEnvironments.hasOwnProperty(e))
            const env = orderedEnvs.length > 0 ? orderedEnvs[0] : ""
            setEnv(env)
            return formattedEnvironments  // Return for chaining
        } catch (error) {
            console.error('Error fetching agent urls:', error)
            return {}
        }
    }

    async function getKdbConnMethodFromEachEnv(formattedEnvironments) {
      try {
        // Make second API call to each environment's URL
        const updatedEnvironments = await Promise.all(
          Object.entries(formattedEnvironments).map(async ([key, env]) => {
            console.log(env)
            const conn_method = await fetchWithAuth(`${env.url}get_connect_method/`, {}, "get_credentials")
            // Process credentials as needed
            console.log(`conn_method for ${env.url}:`, conn_method)
            return [key, { ...env, conn_method }]
          })
        )

        // Convert back to an object and update the environments state
        const updatedEnvObject = Object.fromEntries(updatedEnvironments)
        setEnvironments(updatedEnvObject)

      } catch (error) {
        console.error('Error fetching credentials for one of the backend agents:', error)
      }
    }

    if (!isLoading && isAuthenticated) {
      fetchAgentUrls()
        .then((formattedEnvironments) => getKdbConnMethodFromEachEnv(formattedEnvironments))
        .catch((error) => console.error('Error in fetching URLs or credentials:', error))
    }
  }, [isLoading])



  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale={'en-gb'}>
        <Router>
          <Routes>
            <Route path="/" element={<HomePage/>} />
            <Route path="/testgroups" element={<TestGroups/>} />
            <Route path="/addtest" element={<AddTestPage/>} />
            <Route path="/testgroup/:groupId" element={<TestGroupDetail />} />
            <Route path="/testdetail/:groupId/:testId/:date" element={<TestDetail />} />
            <Route path="/settings" element={<EnvSettings />} />
            <Route path="/release/:groupId" element={<Release />} />
            <Route path="/login" element={<Login />} />
          </Routes>
        </Router>
        {errorData && <ErrorBanner endpoint={errorData.endpoint} errorMessage={errorData.errorMessage} />}
    </LocalizationProvider>
  );
}

export default App;
