import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api";
const API_URL = `${API_BASE_URL}/vehicule`;

const getAllVehicules = async () => {
  const response = await axios.get(API_URL);
  return response.data;
};

const getVehiculeById = async (id) => {
  const response = await axios.get(`${API_URL}/${id}`);
  return response.data;
};

const createVehicule = async (vehiculeData) => {
  const response = await axios.post(API_URL, vehiculeData);
  return response.data;
};

const updateVehicule = async (id, vehiculeData) => {
  const response = await axios.put(`${API_URL}/${id}`, vehiculeData);
  return response.data;
};

const deleteVehicule = async (id) => {
  await axios.delete(`${API_URL}/${id}`);
};

const getVehiculesDisponibles = async () => {
  const response = await axios.get(`${API_URL}/disponibles`);
  return response.data;
};

const setVehiculeDisponibilite = async (id, disponible) => {
  await axios.put(`${API_URL}/${id}/disponibilite?disponible=${disponible}`);
};

export default {
  getAllVehicules,
  getVehiculeById,
  createVehicule,
  updateVehicule,
  deleteVehicule,
  getVehiculesDisponibles,
  setVehiculeDisponibilite
};
