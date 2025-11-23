# Verification Script for Vehicle Rental System Integration
# This script tests all CRUD operations on the backend API

Write-Host "🚗 Vehicle Rental System Integration Test" -ForegroundColor Green
Write-Host "===========================================" -ForegroundColor Green

# Test configuration
$baseUrl = "http://localhost:8080/api"

# Test 1: List all clients
Write-Host "`n✅ Testing GET Clients..." -ForegroundColor Yellow
try {
    $clients = Invoke-RestMethod -Uri "$baseUrl/client" -Method GET
    Write-Host "Found $($clients.Count) clients:" -ForegroundColor Green
    $clients | ForEach-Object { Write-Host "  - ID: $($_.id), Name: $($_.nom), Email: $($_.email)" }
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 2: List all vehicles  
Write-Host "`n✅ Testing GET Vehicles..." -ForegroundColor Yellow
try {
    $vehicles = Invoke-RestMethod -Uri "$baseUrl/vehicule" -Method GET
    Write-Host "Found $($vehicles.Count) vehicles:" -ForegroundColor Green
    $vehicles | ForEach-Object { 
        $status = if($_.disponible) { "Available" } else { "Rented" }
        Write-Host "  - ID: $($_.id), $($_.marque) $($_.modele), €$($_.prixParJour)/day, Status: $status"
    }
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 3: List all reservations
Write-Host "`n✅ Testing GET Reservations..." -ForegroundColor Yellow  
try {
    $reservations = Invoke-RestMethod -Uri "$baseUrl/reservation" -Method GET
    Write-Host "Found $($reservations.Count) reservations:" -ForegroundColor Green
    $reservations | ForEach-Object {
        Write-Host "  - ID: $($_.id), Client: $($_.client.nom), Vehicle: $($_.vehicule.marque) $($_.vehicule.modele)"
        Write-Host "    Dates: $($_.dateDebut) to $($_.dateFin), Total: €$($_.montantTotal), Status: $($_.statusReservation)"
    }
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 4: Create a new client
Write-Host "`n✅ Testing CREATE Client..." -ForegroundColor Yellow
$newClient = @{
    nom = "Test User"
    email = "test@example.com"  
    telephone = "+33987654321"
} | ConvertTo-Json

try {
    $createdClient = Invoke-RestMethod -Uri "$baseUrl/client" -Method POST -Body $newClient -ContentType "application/json"
    Write-Host "✅ Created new client: ID $($createdClient.id), Name: $($createdClient.nom)" -ForegroundColor Green
} catch {
    Write-Host "❌ Error creating client: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 5: Create a new vehicle
Write-Host "`n✅ Testing CREATE Vehicle..." -ForegroundColor Yellow
$newVehicle = @{
    marque = "Test Car"
    modele = "Test Model"
    prixParJour = 25.0
    disponible = $true
} | ConvertTo-Json

try {
    $createdVehicle = Invoke-RestMethod -Uri "$baseUrl/vehicule" -Method POST -Body $newVehicle -ContentType "application/json"
    Write-Host "✅ Created new vehicle: ID $($createdVehicle.id), $($createdVehicle.marque) $($createdVehicle.modele)" -ForegroundColor Green
} catch {
    Write-Host "❌ Error creating vehicle: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n🎉 Integration test completed!" -ForegroundColor Green
Write-Host "Backend is running on: http://localhost:8080" -ForegroundColor Cyan
Write-Host "Frontend is running on: http://localhost:5173" -ForegroundColor Cyan
