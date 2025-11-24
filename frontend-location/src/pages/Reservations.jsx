import { useState, useEffect } from 'react';
import { Table, Button, Form, InputGroup, Modal, Pagination, Alert, Spinner, Badge } from 'react-bootstrap';
import { Search, Plus, Edit, Trash2, Calendar, User, Car, Clock } from 'lucide-react';
import reservationService from '../services/reservationService';
import clientService from '../services/clientService';
import vehiculeService from '../services/vehiculeService';

const Reservations = () => {
  // États de base
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Recherche et Pagination
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [reservationsPerPage] = useState(8);

  // Modale
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    clientId: '',
    vehiculeId: '',
    dateDebut: '',
    dateFin: '',
    status: 'EN_ATTENTE'
  });

  // Clients et véhicules chargés depuis l'API
  const [clients, setClients] = useState([]);
  const [vehicules, setVehicules] = useState([]);

  // Chargement des données depuis l'API
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Charger les réservations, clients et véhicules en parallèle
      const [reservationsData, clientsData, vehiculesData] = await Promise.all([
        reservationService.getAllReservations().catch(error => {
          // Si aucune réservation trouvée, retourner un tableau vide au lieu de planter
          if (error.response?.status === 500 && error.response?.data?.message?.includes('Aucune réservation trouvée')) {
            return [];
          }
          throw error;
        }),
        clientService.getAllClients(),
        vehiculeService.getAllVehicules()
      ]);
      
      setReservations(reservationsData);
      setClients(clientsData);
      setVehicules(vehiculesData);
      setError(null);
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
      
      let errorMessage = "Impossible de charger les données.";
      if (error.response?.status === 401) {
        errorMessage = "Erreur 401: Authentification requise. Redémarrez le backend Spring Boot après avoir modifié la configuration de sécurité.";
      } else if (error.response?.status === 404) {
        errorMessage = "Erreur 404: API non trouvée. Vérifiez les routes du backend.";
      } else if (error.code === 'ERR_NETWORK') {
        errorMessage = "Erreur réseau: Impossible de se connecter au backend sur http://localhost:8080. Vérifiez que Spring Boot est démarré.";
      } else if (error.response) {
        errorMessage = `Erreur ${error.response.status}: ${error.response.data?.message || error.response.statusText}`;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Logique de recherche et pagination
  const filteredReservations = reservations.filter(reservation =>
    reservation.client?.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (reservation.vehicule?.marque + ' ' + reservation.vehicule?.modele).toLowerCase().includes(searchTerm.toLowerCase()) ||
    reservation.statusReservation.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const indexOfLastReservation = currentPage * reservationsPerPage;
  const indexOfFirstReservation = indexOfLastReservation - reservationsPerPage;
  const currentReservations = filteredReservations.slice(indexOfFirstReservation, indexOfLastReservation);
  const totalPages = Math.ceil(filteredReservations.length / reservationsPerPage);

  // Gestionnaires d'événements
  const handleShowModal = (reservation = null) => {
    if (reservation) {
      setEditingId(reservation.id);
      setFormData({
        clientId: reservation.client?.id?.toString() || '',
        vehiculeId: reservation.vehicule?.id?.toString() || '',
        dateDebut: reservation.dateDebut,
        dateFin: reservation.dateFin,
        status: mapBackendStatusToFrench(reservation.statusReservation)
      });
    } else {
      setEditingId(null);
      setFormData({
        clientId: '',
        vehiculeId: '',
        dateDebut: '',
        dateFin: '',
        status: 'EN_ATTENTE'
      });
    }
    setShowModal(true);
  };



  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (!editingId) {
        // Création d'une nouvelle réservation
        await reservationService.createReservation(
          parseInt(formData.clientId),
          parseInt(formData.vehiculeId),
          formData.dateDebut,
          formData.dateFin,
          formData.status
        );
      } else {
        // Modification: pour l'instant on ne supporte que l'annulation
        if (formData.status === 'ANNULEE') {
          await reservationService.cancelReservation(editingId);
        }
      }
      
      // Recharger toutes les données pour avoir les dernières informations
      await loadData();
      setShowModal(false);
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement:', error);
      alert("Erreur lors de l'enregistrement de la réservation");
    }
  };

  const handleEdit = (reservation) => {
    handleShowModal(reservation);
  };

  const handleDelete = async (reservation) => {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer la réservation de ${reservation.client?.nom} ?`)) {
      try {
        await reservationService.deleteReservation(reservation.id);
        await loadData();
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
        alert("Erreur lors de la suppression de la réservation");
      }
    }
  };

  const mapBackendStatusToFrench = (backendStatus) => {
    const mapping = {
      'PENDING': 'EN_ATTENTE',
      'CONFIRMED': 'CONFIRMEE',
      'CANCELLED': 'ANNULEE'
    };
    return mapping[backendStatus] || 'EN_ATTENTE';
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'EN_ATTENTE': { bg: 'warning', text: 'En attente' },
      'PENDING': { bg: 'warning', text: 'En attente' },
      'CONFIRMEE': { bg: 'success', text: 'Confirmée' },
      'CONFIRMED': { bg: 'success', text: 'Confirmée' },
      'TERMINEE': { bg: 'secondary', text: 'Terminée' },
      'ANNULEE': { bg: 'danger', text: 'Annulée' },
      'CANCELLED': { bg: 'danger', text: 'Annulée' }
    };
    
    const config = statusConfig[status] || { bg: 'secondary', text: status };
    return <Badge bg={config.bg}>{config.text}</Badge>;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">Gestion des Réservations</h2>
        <Button variant="primary" onClick={() => handleShowModal()}>
          <Plus size={18} className="me-2" /> Nouvelle Réservation
        </Button>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      {/* Barre de Recherche */}
      <div className="mb-3">
        <InputGroup>
          <InputGroup.Text><Search size={18} /></InputGroup.Text>
          <Form.Control
            placeholder="Rechercher par client, véhicule ou statut..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
          />
        </InputGroup>
      </div>

      {/* Tableau des réservations */}
      {loading ? (
        <div className="text-center p-5">
          <Spinner animation="border" variant="primary" />
        </div>
      ) : (
        <>
          <div className="table-responsive shadow-sm rounded bg-white">
            <Table hover className="mb-0 align-middle">
              <thead className="bg-light">
                <tr>
                  <th>Client</th>
                  <th>Véhicule</th>
                  <th>Période</th>
                  <th>Statut</th>
                  <th>Prix</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentReservations.length > 0 ? (
                  currentReservations.map((reservation) => (
                    <tr key={reservation.id}>
                      <td>
                        <div className="d-flex align-items-center">
                          <div className="bg-primary bg-opacity-10 p-2 rounded-circle me-3 text-primary">
                            <User size={18} />
                          </div>
                          <span className="fw-bold">{reservation.client?.nom}</span>
                        </div>
                      </td>
                      <td>
                        <div className="d-flex align-items-center">
                          <Car size={16} className="me-2 text-muted" />
                          <span className="small">{reservation.vehicule?.marque} {reservation.vehicule?.modele}</span>
                        </div>
                      </td>
                      <td>
                        <div className="small">
                          <div className="d-flex align-items-center gap-2 mb-1">
                            <Calendar size={14} className="text-success" />
                            <span>Début: {formatDate(reservation.dateDebut)}</span>
                          </div>
                          <div className="d-flex align-items-center gap-2">
                            <Clock size={14} className="text-danger" />
                            <span>Fin: {formatDate(reservation.dateFin)}</span>
                          </div>
                        </div>
                      </td>
                      <td>
                        {getStatusBadge(reservation.statusReservation)}
                      </td>
                      <td>
                        <span className="fw-bold text-primary">{reservation.montantTotal}€</span>
                      </td>
                      <td className="text-end">
                        <Button 
                          variant="outline-primary" 
                          size="sm" 
                          className="me-2" 
                          onClick={() => handleEdit(reservation)}
                          title="Modifier la réservation"
                        >
                          <Edit size={16} />
                        </Button>
                        <Button 
                          variant="outline-danger" 
                          size="sm" 
                          onClick={() => handleDelete(reservation)}
                          title="Supprimer la réservation"
                        >
                          <Trash2 size={16} />
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="text-center py-4 text-muted">Aucune réservation trouvée.</td>
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
      <Modal show={showModal} onHide={() => setShowModal(false)} centered size="lg">
        <Form onSubmit={handleSubmit}>
          <Modal.Header closeButton>
            <Modal.Title>{editingId ? 'Modifier la Réservation' : 'Nouvelle Réservation'}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {editingId && (
              <Alert variant="info" className="mb-3">
                <strong>Mode modification:</strong> Seul le statut de la réservation peut être modifié. Pour annuler une réservation, changez le statut à "Annulée".
              </Alert>
            )}
            <div className="row">
              <div className="col-md-6">
                <Form.Group className="mb-3">
                  <Form.Label>Client</Form.Label>
                  <Form.Select 
                    required
                    value={formData.clientId}
                    onChange={(e) => setFormData({...formData, clientId: e.target.value})}
                    disabled={editingId}
                  >
                    <option value="">Sélectionner un client</option>
                    {clients.map(client => (
                      <option key={client.id} value={client.id}>{client.nom}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </div>
              <div className="col-md-6">
                <Form.Group className="mb-3">
                  <Form.Label>Véhicule</Form.Label>
                  <Form.Select 
                    required
                    value={formData.vehiculeId}
                    onChange={(e) => setFormData({...formData, vehiculeId: e.target.value})}
                    disabled={editingId}
                  >
                    <option value="">Sélectionner un véhicule</option>
                    {vehicules.map(vehicule => (
                      <option key={vehicule.id} value={vehicule.id}>
                        {vehicule.marque} {vehicule.modele}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </div>
            </div>

            <div className="row">
              <div className="col-md-6">
                <Form.Group className="mb-3">
                  <Form.Label>Date de début</Form.Label>
                  <Form.Control 
                    type="date" 
                    required 
                    value={formData.dateDebut}
                    onChange={(e) => setFormData({...formData, dateDebut: e.target.value})}
                    disabled={editingId}
                  />
                </Form.Group>
              </div>
              <div className="col-md-6">
                <Form.Group className="mb-3">
                  <Form.Label>Date de fin</Form.Label>
                  <Form.Control 
                    type="date" 
                    required 
                    value={formData.dateFin}
                    onChange={(e) => setFormData({...formData, dateFin: e.target.value})}
                    disabled={editingId}
                  />
                </Form.Group>
              </div>
            </div>

            <Form.Group className="mb-3">
              <Form.Label>Statut</Form.Label>
              <Form.Select 
                value={formData.status}
                onChange={(e) => setFormData({...formData, status: e.target.value})}
              >
                <option value="EN_ATTENTE">En attente</option>
                <option value="CONFIRMEE">Confirmée</option>
                <option value="TERMINEE">Terminée</option>
                <option value="ANNULEE">Annulée</option>
              </Form.Select>
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

export default Reservations;
