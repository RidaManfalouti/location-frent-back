import { NavLink } from 'react-router-dom';
import { Car, Users, CalendarCheck, LayoutDashboard } from 'lucide-react';
import { Nav } from 'react-bootstrap';

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const menuItems = [
    { name: 'Tableau de bord', icon: <LayoutDashboard size={20} />, path: '/' },
    { name: 'Véhicules', icon: <Car size={20} />, path: '/vehicules' },
    { name: 'Clients', icon: <Users size={20} />, path: '/clients' },
    { name: 'Réservations', icon: <CalendarCheck size={20} />, path: '/reservations' },
  ];

  return (
    <div className={`sidebar bg-dark text-white ${isOpen ? 'active' : ''}`}>
      <div className="d-flex flex-column p-3 text-white" style={{ height: '100vh' }}>
        {/* En-tête Sidebar */}
        <div className="d-flex align-items-center mb-3 mb-md-0 me-md-auto text-white text-decoration-none">
          <span className="fs-4 fw-bold text-primary">LocAuto</span>
        </div>
        <hr />
        
        {/* Navigation */}
        <Nav className="flex-column mb-auto">
          {menuItems.map((item) => (
            <Nav.Item key={item.path} className="mb-1">
              <NavLink
                to={item.path}
                onClick={() => window.innerWidth < 768 && toggleSidebar()} // Ferme sur mobile au clic
                className={({ isActive }) => 
                  `nav-link d-flex align-items-center gap-2 text-white ${isActive ? 'active bg-primary' : ''}`
                }
              >
                {item.icon}
                {item.name}
              </NavLink>
            </Nav.Item>
          ))}
        </Nav>
        
        <hr />
        <div className="dropdown">
            <small className="text-secondary">© 2025 Vehicle Rental</small>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;