import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import AddTestPage from './pages/AddTest.js'
import TestGroups from './pages/TestGroups.js'
import HomePage from './pages/HomePage.js'
import TestGroupDetail from './pages/TestGroupDetail.js'; // Import the new component
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import 'dayjs/locale/en-gb';

import './App.css';

function App() {
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale={'en-gb'}>
      <Router>
        <Routes>
          <Route path="/"  element={<HomePage/>} />
          <Route path="/testgroups" element={<TestGroups/>} />
          <Route path="/addtest" element={<AddTestPage/>} />
          <Route path="/testgroup/:name/:date" element={<TestGroupDetail />} />
        </Routes>
      </Router>
    </LocalizationProvider>
  );
}

export default App;
