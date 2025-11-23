import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import './App.css'; 
import Dashboard from './pages/Dashboard';
import Clients from './pages/Clients';
import Vehicules from './pages/Vehicules';
import Reservations from './pages/Reservations';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="vehicules" element={<Vehicules />} />
          <Route path="clients" element={<Clients />} />
          <Route path="reservations" element={<Reservations />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;