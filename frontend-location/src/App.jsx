import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import './App.css'; // Assurez-vous d'importer le CSS layout

// Composants Placeholder (à remplacer par vos vraies pages plus tard)
const Dashboard = () => <h2>Tableau de bord</h2>;
const Vehicles = () => <h2>Gestion des Véhicules</h2>;
const Clients = () => <h2>Liste des Clients</h2>;
const Reservations = () => <h2>Réservations</h2>;

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="vehicules" element={<Vehicles />} />
          <Route path="clients" element={<Clients />} />
          <Route path="reservations" element={<Reservations />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;