// Service pour gérer les erreurs HTTP de façon centralisée
export const handleApiError = (error) => {
  console.error('API Error:', error);
  
  if (error.response) {
    // Le serveur a répondu avec un code d'erreur
    switch (error.response.status) {
      case 400:
        return "Données invalides. Vérifiez votre saisie.";
      case 401:
        return "Authentification requise. Vérifiez la configuration de sécurité du backend.";
      case 403:
        return "Accès refusé. Permissions insuffisantes.";
      case 404:
        return "Ressource non trouvée.";
      case 500:
        return "Erreur serveur interne. Consultez les logs du backend.";
      default:
        return `Erreur HTTP ${error.response.status}: ${error.response.data?.message || 'Erreur inconnue'}`;
    }
  } else if (error.request) {
    // La requête a été envoyée mais pas de réponse
    return "Impossible de se connecter au serveur. Vérifiez que le backend est démarré sur le port 8080.";
  } else {
    // Erreur lors de la configuration de la requête
    return `Erreur de configuration: ${error.message}`;
  }
};

// Ajouter un intercepteur Axios pour gérer les erreurs globalement
import axios from 'axios';

// Intercepteur pour les réponses
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    // Log automatique des erreurs
    console.error('❌ Erreur API:', {
      method: error.config?.method,
      url: error.config?.url,
      status: error.response?.status,
      message: error.message
    });
    
    return Promise.reject(error);
  }
);

export default { handleApiError };
