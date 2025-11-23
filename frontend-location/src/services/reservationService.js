import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api";
const API_URL = `${API_BASE_URL}/reservation`;

const getAllReservations = async () => {
  const response = await axios.get(API_URL);
  return response.data;
};

const getReservationById = async (id) => {
  const response = await axios.get(`${API_URL}/${id}`);
  return response.data;
};

const createReservation = async (clientId, vehiculeId, dateDebut, dateFin, statusReservation = 'PENDING') => {
  const response = await axios.post(API_URL, {
    clientId,
    vehiculeId,
    dateDebut,
    dateFin,
    statusReservation
  });
  return response.data;
};

const getReservationsByStatus = async (status) => {
  const response = await axios.get(`${API_URL}/status/${status}`);
  return response.data;
};

export default {
  getAllReservations,
  getReservationById,
  createReservation,
  getReservationsByStatus
};
