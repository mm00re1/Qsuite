import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import AddTestPage from './pages/AddTest.js'
import TestGroups from './pages/TestGroups.js'
import HomePage from './pages/HomePage.js'
import TestGroupDetail from './pages/TestGroupDetail.js'; // Import the new component
import TestDetail from './pages/TestDetail.js'; // Import the new component
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import 'dayjs/locale/en-gb';
import { NavigationProvider } from './TestNavigationContext'; // Adjust the path as necessary

import './App.css';

function App() {
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
        </NavigationProvider>
    </LocalizationProvider>
  );
}

export default App;
