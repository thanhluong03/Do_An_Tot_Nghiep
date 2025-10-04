
import axios from 'axios';
const API_BASE_URL = 'http://localhost:3001'; 

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
});

export default apiClient;