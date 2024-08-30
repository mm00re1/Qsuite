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
import { NavigationProvider } from './TestNavigationContext' // Adjust the path as necessary
import { useError } from './ErrorContext.jsx'
import ErrorBanner from './components/ErrorBanner/ErrorBanner'
import './App.css';

function App() {
  const { errorData } = useError();

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale={'en-gb'}>
      <NavigationProvider>
        <Router>
          <Routes>
            <Route path="/"  element={<HomePage/>} />
            <Route path="/testgroups" element={<TestGroups/>} />
            <Route path="/addtest" element={<AddTestPage/>} />
            <Route path="/testgroup/:groupId" element={<TestGroupDetail />} />
            <Route path="/testdetail/:groupId/:testId/:date" element={<TestDetail />} />
            <Route path="/settings" element={<EnvSettings />} />
            <Route path="/release/:groupId" element={<Release />} />
          </Routes>
        </Router>
        {errorData && <ErrorBanner endpoint={errorData.endpoint} errorMessage={errorData.errorMessage} />}
      </NavigationProvider>
    </LocalizationProvider>
  );
}

export default App;
