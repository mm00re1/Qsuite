import { useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import AddTestPage from './pages/AddTest'
import TestGroups from './pages/TestGroups'
import HomePage from './pages/HomePage'
import TestGroupDetail from './pages/TestGroupDetail'
import TestDetail from './pages/TestDetail'
import EnvSettings from './pages/EnvSettings'
import Release from './pages/Release'
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
        } catch (error) {
            console.error('Error fetching agent urls:', error)
        }
    }
    if (!isLoading && isAuthenticated) {
      fetchAgentUrls()
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
          </Routes>
        </Router>
        {errorData && <ErrorBanner endpoint={errorData.endpoint} errorMessage={errorData.errorMessage} />}
    </LocalizationProvider>
  );
}

export default App;
