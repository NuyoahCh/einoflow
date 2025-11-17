import axios from 'axios';

const client = axios.create({
  baseURL: '/api',
  timeout: 8000
});

export default client;
