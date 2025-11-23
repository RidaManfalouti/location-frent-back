import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { Menu, X } from 'lucide-react';
import { Button, Container } from 'react-bootstrap';

const Layout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <div className="app-container bg-light">
      {/* Sidebar */}
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

      {/* Overlay sombre pour mobile uniquement */}
      {isSidebarOpen && (
        <div className="overlay d-md-none" onClick={toggleSidebar}></div>
      )}

      {/* Contenu Principal */}
      <div className="content d-flex flex-column">
        
        {/* Barre supérieure (Header) pour mobile */}
        <div className="d-md-none p-2 bg-white shadow-sm mb-3 d-flex align-items-center justify-content-between rounded">
            <span className="fw-bold ps-2">Menu</span>
            <Button variant="outline-dark" size="sm" onClick={toggleSidebar}>
              {isSidebarOpen ? <X size={20}/> : <Menu size={20}/>}
            </Button>
        </div>

        {/* Zone où vos pages s'affichent */}
        <Container fluid className="p-4 bg-white shadow-sm rounded flex-grow-1">
          <Outlet />
        </Container>
      </div>
    </div>
  );
};

export default Layout;