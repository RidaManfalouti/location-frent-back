import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api";
const API_URL = `${API_BASE_URL}/client`;

const getAllClients = async () => {
  const response = await axios.get(API_URL);
  return response.data;
};

const createClient = async (clientData) => {
  const response = await axios.post(API_URL, clientData);
  return response.data;
};

const updateClient = async (id, clientData) => {
  const response = await axios.put(`${API_URL}/${id}`, clientData);
  return response.data;
};

const deleteClient = async (id) => {
  await axios.delete(`${API_URL}/${id}`);
};

export default {
  getAllClients,
  createClient,
  updateClient,
  deleteClient
};