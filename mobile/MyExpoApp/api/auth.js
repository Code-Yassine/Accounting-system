import axios from 'axios';

const API_URL = 'http://localhost:5000/api'; // Replace with your backend URL

export const signInClient = async (email, password) => {
  try {
    const response = await axios.post(`${API_URL}/auth/signin`, {
      email,
      password,
      role: 'client' // Specify that this is a client login
    });
    
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Network error occurred' };
  }
};