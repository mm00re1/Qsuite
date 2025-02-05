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
import { loadEnvironmentsFromLocalStorage } from './utils/api'
import { useApi } from './api/ApiContext'

function App() {
  const { errorData } = useError()
  const { setEnv, setEnvironments } = useNavigation()
  const { fetchData, isAuthenticated, isLoading } = useApi()

  useEffect(() => {
    function fetchAgentUrls() {
      // On mount, load from local storage
      const envs = loadEnvironmentsFromLocalStorage();
      const formattedEnvironments = Object.entries(envs).reduce((acc, [key, value]) => {
        acc[key] = { url: value.url, isEditing: false, isSaved: true };
        return acc;
      }, {});
      setEnvironments(formattedEnvironments)
      const envOrder = ['DEV', 'TEST', 'PROD']
      const orderedEnvs = envOrder.filter(e => formattedEnvironments.hasOwnProperty(e))
      const env = orderedEnvs.length > 0 ? orderedEnvs[0] : ""
      setEnv(env)
      return formattedEnvironments  // Return for chaining
    }

    async function getKdbConnMethodFromEachEnv(formattedEnvironments) {
      try {
        // Make second API call to each environment's URL
        const updatedEnvironments = await Promise.all(
          Object.entries(formattedEnvironments).map(async ([key, env]) => {
            const conn_method = await fetchData(`${env.url}/get_connect_method/`, {}, "get_credentials")
            // Process credentials as needed
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

    async function init() {
      //if (!isLoading && isAuthenticated) {
        const formattedEnvironments = fetchAgentUrls(); 
        await getKdbConnMethodFromEachEnv(formattedEnvironments);
      //}
    }
  
    //init();
    if (!isLoading && isAuthenticated) {
      init()
        .catch((error) => console.error('Error in fetching URLs or credentials:', error))
    }
  }, [isLoading, isAuthenticated])



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
