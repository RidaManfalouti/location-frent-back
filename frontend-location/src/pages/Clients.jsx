import { useState, useEffect } from 'react';
import { Table, Button, Form, InputGroup, Modal, Pagination, Alert, Spinner } from 'react-bootstrap';
import { Search, Plus, Edit, Trash2, Phone, Mail, User } from 'lucide-react';
import clientService from '../services/clientService';

const Clients = () => {
  // --- États (State) ---
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Recherche et Pagination
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [clientsPerPage] = useState(5); // Nombre de clients par page

  // Modale (Ajout/Edition)
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null); // Null = mode création, ID = mode édition
  const [formData, setFormData] = useState({ nom: '', email: '', telephone: '' });

  // --- Chargement des données ---
  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    try {
      setLoading(true);
      const data = await clientService.getAllClients();
      setClients(data);
      setError(null);
    } catch (error) {
      console.error('Erreur lors du chargement des clients:', error);
      setError("Impossible de charger les clients. Vérifiez que le back-end est lancé.");
      // Pour le test si le back-end est éteint, on peut mettre un tableau vide ou des fausses données ici
      setClients([]); 
    } finally {
      setLoading(false);
    }
  };

  // --- Logique de Recherche et Pagination ---
  // 1. Filtrer
  const filteredClients = clients.filter(client =>
    client.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 2. Paginer le résultat filtré
  const indexOfLastClient = currentPage * clientsPerPage;
  const indexOfFirstClient = indexOfLastClient - clientsPerPage;
  const currentClients = filteredClients.slice(indexOfFirstClient, indexOfLastClient);
  const totalPages = Math.ceil(filteredClients.length / clientsPerPage);

  // --- Gestionnaires d'événements (Handlers) ---

  const handleShowModal = (client = null) => {
    if (client) {
      setEditingId(client.id);
      setFormData({ nom: client.nom, email: client.email, telephone: client.telephone });
    } else {
      setEditingId(null);
      setFormData({ nom: '', email: '', telephone: '' });
    }
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce client ?")) {
      try {
        await clientService.deleteClient(id);
        // Mise à jour optimiste de l'interface
        setClients(clients.filter(c => c.id !== id));
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
        alert("Erreur lors de la suppression");
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        // Mode Modification
        const updatedClient = await clientService.updateClient(editingId, formData);
        setClients(clients.map(c => c.id === editingId ? updatedClient : c));
      } else {
        // Mode Création
        const newClient = await clientService.createClient(formData);
        setClients([...clients, newClient]);
      }
      setShowModal(false);
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement:', error);
      alert("Erreur lors de l'enregistrement. Vérifiez les données.");
    }
  };

  // --- Rendu (JSX) ---
  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">Gestion des Clients</h2>
        <Button variant="primary" onClick={() => handleShowModal()}>
          <Plus size={18} className="me-2" /> Nouveau Client
        </Button>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      {/* Barre de Recherche */}
      <div className="mb-3">
        <InputGroup>
          <InputGroup.Text><Search size={18} /></InputGroup.Text>
          <Form.Control
            placeholder="Rechercher par nom ou email..."
            value={searchTerm}
            onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1); // Revenir à la page 1 lors d'une recherche
            }}
          />
        </InputGroup>
      </div>

      {/* Tableau des données */}
      {loading ? (
        <div className="text-center p-5"><Spinner animation="border" variant="primary" /></div>
      ) : (
        <>
          <div className="table-responsive shadow-sm rounded bg-white">
            <Table hover className="mb-0 align-middle">
              <thead className="bg-light">
                <tr>
                  <th>Nom</th>
                  <th>Contact</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentClients.length > 0 ? (
                  currentClients.map((client) => (
                    <tr key={client.id}>
                      <td>
                        <div className="d-flex align-items-center">
                          <div className="bg-primary bg-opacity-10 p-2 rounded-circle me-3 text-primary">
                            <User size={20} />
                          </div>
                          <span className="fw-bold">{client.nom}</span>
                        </div>
                      </td>
                      <td>
                        <div className="small text-muted d-flex flex-column gap-1">
                          <div className="d-flex align-items-center gap-2">
                             <Mail size={14}/> {client.email}
                          </div>
                          <div className="d-flex align-items-center gap-2">
                             <Phone size={14}/> {client.telephone}
                          </div>
                        </div>
                      </td>
                      <td className="text-end">
                        <Button variant="outline-primary" size="sm" className="me-2" onClick={() => handleShowModal(client)}>
                          <Edit size={16} />
                        </Button>
                        <Button variant="outline-danger" size="sm" onClick={() => handleDelete(client.id)}>
                          <Trash2 size={16} />
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3" className="text-center py-4 text-muted">Aucun client trouvé.</td>
                  </tr>
                )}
              </tbody>
            </Table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="d-flex justify-content-center mt-4">
              <Pagination>
                <Pagination.Prev 
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))} 
                  disabled={currentPage === 1}
                />
                {[...Array(totalPages)].map((_, i) => (
                    <Pagination.Item 
                        key={i + 1} 
                        active={i + 1 === currentPage}
                        onClick={() => setCurrentPage(i + 1)}
                    >
                        {i + 1}
                    </Pagination.Item>
                ))}
                <Pagination.Next 
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} 
                  disabled={currentPage === totalPages}
                />
              </Pagination>
            </div>
          )}
        </>
      )}

      {/* Modale d'Ajout / Modification */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Form onSubmit={handleSubmit}>
          <Modal.Header closeButton>
            <Modal.Title>{editingId ? 'Modifier le Client' : 'Ajouter un Client'}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Nom complet</Form.Label>
              <Form.Control 
                type="text" 
                required 
                value={formData.nom}
                onChange={(e) => setFormData({...formData, nom: e.target.value})}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control 
                type="email" 
                required 
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Téléphone</Form.Label>
              <Form.Control 
                type="text" 
                required 
                value={formData.telephone}
                onChange={(e) => setFormData({...formData, telephone: e.target.value})}
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>Annuler</Button>
            <Button variant="primary" type="submit">
              {editingId ? 'Mettre à jour' : 'Créer'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
};

export default Clients;