import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import AddTestPage from './pages/AddTest'
import TestGroups from './pages/TestGroups'
import HomePage from './pages/HomePage'
import TestGroupDetail from './pages/TestGroupDetail' // Import the new component
import TestDetail from './pages/TestDetail' // Import the new component
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
            <Route path="/testgroup" element={<TestGroupDetail />} />
            <Route path="/testdetail/:testId/:date" element={<TestDetail />} />
          </Routes>
        </Router>
        {errorData && <ErrorBanner endpoint={errorData.endpoint} errorMessage={errorData.errorMessage} />}
      </NavigationProvider>
    </LocalizationProvider>
  );
}

export default App;
