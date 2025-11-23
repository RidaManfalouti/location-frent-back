// Utilitaire de test pour vérifier la connectivité de l'API
// Ouvrez la console du navigateur (F12) et tapez: testApi()

window.testApi = async () => {
  const baseUrl = 'http://localhost:8080/api';
  
  console.log('🔍 Test de connectivité API...');
  
  const endpoints = [
    '/client',
    '/vehicule', 
    '/reservation'
  ];
  
  for (const endpoint of endpoints) {
    try {
      const response = await fetch(baseUrl + endpoint);
      console.log(`✅ ${endpoint}: Status ${response.status}`);
      
      if (response.ok) {
        const data = await response.json();
        console.log(`   Données:`, data);
      } else {
        console.log(`   Erreur: ${response.statusText}`);
      }
    } catch (error) {
      console.log(`❌ ${endpoint}: Erreur de connexion`, error.message);
    }
  }
  
  console.log('📋 Test terminé. Si vous voyez des erreurs 401, redémarrez Spring Boot.');
};

// Auto-test au chargement de la page (pour debugging)
console.log('🛠️ API Test disponible. Tapez testApi() dans la console pour tester manuellement.');

export default { testApi: window.testApi };
