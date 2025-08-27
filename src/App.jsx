import { BrowserRouter, Routes, Route } from "react-router-dom";
import './App.css';
import Login from './Components/Login.jsx';
import Homepage from './Components/Homepage.jsx';
import DirectorGeneral from './Components/DirectorGeneral.jsx';
import LabRegister from './Components/LabRegister.jsx';


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/login" element={<Login />} />
        {/* Add other routes as needed */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;