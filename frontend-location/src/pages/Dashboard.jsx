import { useState, useEffect } from 'react';
import { Card, Row, Col, Table, Badge } from 'react-bootstrap';
import { Users, Car, Calendar, DollarSign, TrendingUp, Clock } from 'lucide-react';
import clientService from '../services/clientService';
import vehiculeService from '../services/vehiculeService';
import reservationService from '../services/reservationService';

const StatCard = ({ title, value, icon, color, subtitle }) => (
  <Card className="h-100 shadow-sm border-0">
    <Card.Body>
      <div className="d-flex justify-content-between align-items-center">
        <div>
          <h6 className="card-subtitle mb-2 text-muted">{title}</h6>
          <h2 className="card-title mb-0 fw-bold">{value}</h2>
          {subtitle && <small className="text-muted">{subtitle}</small>}
        </div>
        <div className={`bg-${color} bg-opacity-10 p-3 rounded-circle text-${color}`}>
          {icon}
        </div>
      </div>
    </Card.Body>
  </Card>
);

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalClients: 0,
    totalVehicules: 0,
    reservationsActives: 0,
    revenus: 0
  });

  const [recentReservations, setRecentReservations] = useState([]);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        // Charger les données depuis les APIs
        const [clientsData, vehiculesData, reservationsData] = await Promise.all([
          clientService.getAllClients(),
          vehiculeService.getAllVehicules(),
          reservationService.getAllReservations()
        ]);

        // Calculer les statistiques
        const totalRevenus = reservationsData.reduce((sum, reservation) => 
          sum + (reservation.montantTotal || 0), 0);

        setStats({
          totalClients: clientsData.length,
          totalVehicules: vehiculesData.length,
          reservationsActives: reservationsData.filter(r => 
            r.statusReservation === 'CONFIRMEE' || r.statusReservation === 'EN_ATTENTE').length,
          revenus: totalRevenus
        });

        // Prendre les 3 réservations les plus récentes
        const sortedReservations = reservationsData
          .sort((a, b) => new Date(b.dateDebut) - new Date(a.dateDebut))
          .slice(0, 3)
          .map(reservation => ({
            id: reservation.id,
            client: reservation.client?.nom || 'Client non trouvé',
            vehicule: `${reservation.vehicule?.marque || ''} ${reservation.vehicule?.modele || ''}`.trim() || 'Véhicule non trouvé',
            dateDebut: reservation.dateDebut,
            status: reservation.statusReservation
          }));

        setRecentReservations(sortedReservations);    } catch (error) {
      console.error('Erreur lors du chargement du dashboard:', error);
      
      // Message d'erreur détaillé pour le debugging
      if (error.response?.status === 401) {
        console.warn("⚠️ Erreur 401 - Authentification requise. Vérifiez SecurityConfig.java et redémarrez Spring Boot.");
      } else if (error.code === 'ERR_NETWORK') {
        console.warn("⚠️ Erreur réseau - Backend Spring Boot non accessible sur localhost:8080");
      }
      
      // Garder les données par défaut en cas d'erreur
      setStats({
        totalClients: 0,
        totalVehicules: 0,
        reservationsActives: 0,
        revenus: 0
      });
      setRecentReservations([]);
    }
    };

    loadDashboardData();
  }, []);

  const getStatusBadge = (status) => {
    const statusConfig = {
      'EN_ATTENTE': { bg: 'warning', text: 'En attente' },
      'CONFIRMEE': { bg: 'success', text: 'Confirmée' },
      'TERMINEE': { bg: 'secondary', text: 'Terminée' },
      'ANNULEE': { bg: 'danger', text: 'Annulée' }
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
        <div>
          <h2 className="mb-1">Tableau de Bord</h2>
          <p className="text-muted mb-0">Vue d'ensemble de votre activité de location</p>
        </div>
        <div className="text-muted small">
          <Clock size={16} className="me-1" />
          Dernière mise à jour: {new Date().toLocaleString('fr-FR')}
        </div>
      </div>

      {/* Cartes de statistiques */}
      <Row className="mb-4">
        <Col lg={3} md={6} className="mb-4">
          <StatCard
            title="Clients"
            value={stats.totalClients}
            icon={<Users size={28} />}
            color="primary"
            subtitle="Total des clients"
          />
        </Col>
        <Col lg={3} md={6} className="mb-4">
          <StatCard
            title="Véhicules"
            value={stats.totalVehicules}
            icon={<Car size={28} />}
            color="success"
            subtitle="Flotte disponible"
          />
        </Col>
        <Col lg={3} md={6} className="mb-4">
          <StatCard
            title="Réservations"
            value={stats.reservationsActives}
            icon={<Calendar size={28} />}
            color="warning"
            subtitle="Actives ce mois"
          />
        </Col>
        <Col lg={3} md={6} className="mb-4">
          <StatCard
            title="Revenus"
            value={`${stats.revenus.toLocaleString('fr-FR')}€`}
            icon={<DollarSign size={28} />}
            color="info"
            subtitle="Ce mois"
          />
        </Col>
      </Row>

      <Row>
        {/* Réservations récentes */}
        <Col lg={8} className="mb-4">
          <Card className="shadow-sm border-0">
            <Card.Header className="bg-white border-bottom">
              <div className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0">Réservations Récentes</h5>
                <TrendingUp size={20} className="text-muted" />
              </div>
            </Card.Header>
            <Card.Body className="p-0">
              {recentReservations.length > 0 ? (
                <Table className="mb-0" hover>
                  <thead className="table-light">
                    <tr>
                      <th className="border-0 fw-semibold">Client</th>
                      <th className="border-0 fw-semibold">Véhicule</th>
                      <th className="border-0 fw-semibold">Date</th>
                      <th className="border-0 fw-semibold">Statut</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentReservations.map((reservation) => (
                      <tr key={reservation.id}>
                        <td className="border-0">
                          <div className="d-flex align-items-center">
                            <div className="bg-primary bg-opacity-10 p-2 rounded-circle me-3 text-primary">
                              <Users size={16} />
                            </div>
                            <span className="fw-medium">{reservation.client}</span>
                          </div>
                        </td>
                        <td className="border-0">
                          <div className="d-flex align-items-center">
                            <Car size={16} className="me-2 text-muted" />
                            <span>{reservation.vehicule}</span>
                          </div>
                        </td>
                        <td className="border-0">{formatDate(reservation.dateDebut)}</td>
                        <td className="border-0">{getStatusBadge(reservation.status)}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              ) : (
                <div className="text-center py-5 text-muted">
                  <Calendar size={48} className="mb-3 opacity-50" />
                  <p>Aucune réservation récente</p>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>

        {/* Activités récentes */}
        <Col lg={4} className="mb-4">
          <Card className="shadow-sm border-0">
            <Card.Header className="bg-white border-bottom">
              <h5 className="mb-0">Activités Récentes</h5>
            </Card.Header>
            <Card.Body>
              <div className="d-flex flex-column gap-3">
                <div className="d-flex align-items-start gap-3">
                  <div className="bg-success bg-opacity-10 p-2 rounded-circle text-success">
                    <Users size={16} />
                  </div>
                  <div className="flex-grow-1">
                    <p className="mb-1 small fw-medium">Nouveau client ajouté</p>
                    <p className="mb-0 text-muted small">Il y a 2 heures</p>
                  </div>
                </div>
                
                <div className="d-flex align-items-start gap-3">
                  <div className="bg-primary bg-opacity-10 p-2 rounded-circle text-primary">
                    <Calendar size={16} />
                  </div>
                  <div className="flex-grow-1">
                    <p className="mb-1 small fw-medium">Réservation confirmée</p>
                    <p className="mb-0 text-muted small">Il y a 4 heures</p>
                  </div>
                </div>
                
                <div className="d-flex align-items-start gap-3">
                  <div className="bg-warning bg-opacity-10 p-2 rounded-circle text-warning">
                    <Car size={16} />
                  </div>
                  <div className="flex-grow-1">
                    <p className="mb-1 small fw-medium">Véhicule en maintenance</p>
                    <p className="mb-0 text-muted small">Il y a 1 jour</p>
                  </div>
                </div>
                
                <div className="d-flex align-items-start gap-3">
                  <div className="bg-info bg-opacity-10 p-2 rounded-circle text-info">
                    <DollarSign size={16} />
                  </div>
                  <div className="flex-grow-1">
                    <p className="mb-1 small fw-medium">Paiement reçu</p>
                    <p className="mb-0 text-muted small">Il y a 2 jours</p>
                  </div>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
