import { useState, useEffect } from 'react';
import { Table, Button, Form, InputGroup, Modal, Pagination, Alert, Spinner, Badge } from 'react-bootstrap';
import { Search, Plus, Edit, Trash2, Car, Fuel, Calendar, Settings } from 'lucide-react';
import vehiculeService from '../services/vehiculeService';

const Vehicules = () => {
  // États de base
  const [vehicules, setVehicules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Recherche et Pagination
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [vehiculesPerPage] = useState(6);

  // Modale
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    marque: '',
    modele: '',
    prixParJour: '',
    disponible: true
  });

  // Chargement des données depuis l'API
  useEffect(() => {
    loadVehicules();
  }, []);

  const loadVehicules = async () => {
    try {
      setLoading(true);
      const data = await vehiculeService.getAllVehicules();
      setVehicules(data);
      setError(null);
    } catch (error) {
      console.error('Erreur lors du chargement des véhicules:', error);
      
      let errorMessage = "Impossible de charger les véhicules.";
      if (error.response?.status === 401) {
        errorMessage = "❌ Erreur 401: Le backend exige une authentification. Redémarrez Spring Boot après la modification de SecurityConfig.java";
      } else if (error.code === 'ERR_NETWORK') {
        errorMessage = "❌ Connexion impossible: Vérifiez que Spring Boot est démarré sur http://localhost:8080";
      } else if (error.response) {
        errorMessage = `❌ Erreur ${error.response.status}: ${error.response.statusText}`;
      }
      
      setError(errorMessage);
      setVehicules([]);
    } finally {
      setLoading(false);
    }
  };

  // Logique de recherche et pagination
  const filteredVehicules = vehicules.filter(vehicule =>
    vehicule.marque.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vehicule.modele.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const indexOfLastVehicule = currentPage * vehiculesPerPage;
  const indexOfFirstVehicule = indexOfLastVehicule - vehiculesPerPage;
  const currentVehicules = filteredVehicules.slice(indexOfFirstVehicule, indexOfLastVehicule);
  const totalPages = Math.ceil(filteredVehicules.length / vehiculesPerPage);

  // Gestionnaires d'événements
  const handleShowModal = (vehicule = null) => {
    if (vehicule) {
      setEditingId(vehicule.id);
      setFormData({
        marque: vehicule.marque,
        modele: vehicule.modele,
        prixParJour: vehicule.prixParJour.toString(),
        disponible: vehicule.disponible
      });
    } else {
      setEditingId(null);
      setFormData({
        marque: '',
        modele: '',
        prixParJour: '',
        disponible: true
      });
    }
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce véhicule ?")) {
      try {
        await vehiculeService.deleteVehicule(id);
        setVehicules(vehicules.filter(v => v.id !== id));
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
        let errorMessage = "Erreur lors de la suppression du véhicule";
        
        if (error.response?.status === 401) {
          errorMessage = "Erreur d'authentification. Vérifiez la configuration du backend.";
        } else if (error.code === 'ERR_NETWORK') {
          errorMessage = "Connexion au serveur impossible.";
        }
        
        alert(errorMessage);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const vehiculeData = {
        ...formData,
        prixParJour: parseFloat(formData.prixParJour)
      };
      
      if (editingId) {
        const updatedVehicule = await vehiculeService.updateVehicule(editingId, vehiculeData);
        setVehicules(vehicules.map(v => v.id === editingId ? updatedVehicule : v));
      } else {
        const newVehicule = await vehiculeService.createVehicule(vehiculeData);
        setVehicules([...vehicules, newVehicule]);
      }
      setShowModal(false);
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement:', error);
      let errorMessage = "Erreur lors de l'enregistrement du véhicule";
      
      if (error.response?.status === 401) {
        errorMessage = "Erreur d'authentification. Vérifiez la configuration de sécurité du backend.";
      } else if (error.response?.status === 403) {
        errorMessage = "Accès refusé. Permissions insuffisantes.";
      } else if (error.response?.status === 500) {
        errorMessage = "Erreur serveur. Vérifiez les logs du backend.";
      } else if (error.code === 'ERR_NETWORK') {
        errorMessage = "Impossible de se connecter au serveur. Vérifiez que le backend est démarré sur le port 8080.";
      }
      
      alert(errorMessage);
    }
  };

  const getStatusBadge = (disponible) => {
    return disponible ? (
      <Badge bg="success">Disponible</Badge>
    ) : (
      <Badge bg="danger">Indisponible</Badge>
    );
  };



  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">Gestion des Véhicules</h2>
        <Button variant="primary" onClick={() => handleShowModal()}>
          <Plus size={18} className="me-2" /> Nouveau Véhicule
        </Button>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      {/* Barre de Recherche */}
      <div className="mb-3">
        <InputGroup>
          <InputGroup.Text><Search size={18} /></InputGroup.Text>
          <Form.Control
            placeholder="Rechercher par marque ou modèle..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
          />
        </InputGroup>
      </div>

      {/* Grille des véhicules */}
      {loading ? (
        <div className="text-center p-5">
          <Spinner animation="border" variant="primary" />
        </div>
      ) : (
        <>
          <div className="row g-4 mb-4">
            {currentVehicules.map((vehicule) => (
              <div key={vehicule.id} className="col-md-6 col-lg-4">
                <div className="card shadow-sm h-100">
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-start mb-3">
                      <div className="d-flex align-items-center">
                        <div className="bg-primary bg-opacity-10 p-2 rounded-circle me-3 text-primary">
                          <Car size={24} />
                        </div>
                        <div>
                          <h5 className="card-title mb-0">{vehicule.marque}</h5>
                          <p className="card-text text-muted small">{vehicule.modele}</p>
                        </div>
                      </div>
                      {getStatusBadge(vehicule.disponible)}
                    </div>
                    
                    <div className="mb-3">
                      <div className="d-flex justify-content-between align-items-center">
                        <span className="small text-muted">Prix/jour:</span>
                        <span className="fw-bold text-primary">{vehicule.prixParJour}€</span>
                      </div>
                    </div>

                    <div className="d-flex gap-2">
                      <Button 
                        variant="outline-primary" 
                        size="sm" 
                        className="flex-fill"
                        onClick={() => handleShowModal(vehicule)}
                      >
                        <Edit size={16} className="me-1" /> Modifier
                      </Button>
                      <Button 
                        variant="outline-danger" 
                        size="sm"
                        onClick={() => handleDelete(vehicule.id)}
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {currentVehicules.length === 0 && !loading && (
            <div className="text-center py-5 text-muted">
              <Car size={48} className="mb-3 opacity-50" />
              <p>Aucun véhicule trouvé.</p>
            </div>
          )}

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
            <Modal.Title>{editingId ? 'Modifier le Véhicule' : 'Ajouter un Véhicule'}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <div className="row">
              <div className="col-md-6">
                <Form.Group className="mb-3">
                  <Form.Label>Marque</Form.Label>
                  <Form.Control 
                    type="text" 
                    required 
                    value={formData.marque}
                    onChange={(e) => setFormData({...formData, marque: e.target.value})}
                  />
                </Form.Group>
              </div>
              <div className="col-md-6">
                <Form.Group className="mb-3">
                  <Form.Label>Modèle</Form.Label>
                  <Form.Control 
                    type="text" 
                    required 
                    value={formData.modele}
                    onChange={(e) => setFormData({...formData, modele: e.target.value})}
                  />
                </Form.Group>
              </div>
            </div>
            
            <Form.Group className="mb-3">
              <Form.Label>Prix par jour (€)</Form.Label>
              <Form.Control 
                type="number" 
                required 
                min="0"
                step="0.01"
                value={formData.prixParJour}
                onChange={(e) => setFormData({...formData, prixParJour: e.target.value})}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Check 
                type="checkbox"
                label="Véhicule disponible"
                checked={formData.disponible}
                onChange={(e) => setFormData({...formData, disponible: e.target.checked})}
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

export default Vehicules;
