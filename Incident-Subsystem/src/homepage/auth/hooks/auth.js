import axios from 'axios';
import { API_BASE_URL } from '../../../config/api';

export const authService = {
  
    getLocations: async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/locations`);
            return response.data;
        } catch (error) {
          
            return {
                success: true,
                puroks: [
                    { id: 1, number: '1', name: 'Purok 1' },
                    { id: 2, number: '2', name: 'Purok 2' },
                    { id: 3, number: '3', name: 'Purok 3' },
                    { id: 4, number: '4', name: 'Purok 4' },
                    { id: 5, number: '5', name: 'Purok 5' },
                    { id: 6, number: '6', name: 'Purok 6' },
                    { id: 7, number: '7', name: 'Purok 7' }
                ],
                streets: [
                    { id: 1, purok_id: 1, name: 'Sisa St.' },
                    { id: 2, purok_id: 1, name: 'Crisostomo St.' },
                    { id: 3, purok_id: 2, name: 'Ibarra St.' },
                    { id: 4, purok_id: 2, name: 'Elias St.' },
                    { id: 5, purok_id: 3, name: 'Maria Clara St.' },
                    { id: 6, purok_id: 3, name: 'Basilio St.' },
                    { id: 7, purok_id: 4, name: 'Salvi St.' },
                    { id: 8, purok_id: 4, name: 'Victoria St.' },
                    { id: 9, purok_id: 5, name: 'Tiago St.' },
                    { id: 10, purok_id: 5, name: 'Tasio St.' },
                    { id: 11, purok_id: 6, name: 'Guevarra St.' },
                    { id: 12, purok_id: 6, name: 'Sinang St.' },
                    { id: 13, purok_id: 7, name: 'Alfarez St.' },
                    { id: 14, purok_id: 7, name: 'Dona Victorina St.' }
                ],
                source: 'fallback'
            };
        }
    },

   
   checkHouseholdHead: async (params) => {
    try {
     
        if (!params.houseNumber || !params.street || !params.purok) {
            return { exists: false };
        }

        const response = await axios.get(`${API_BASE_URL}/households/check-head`, {
            params: {
                house_number: params.houseNumber,
                street_id: params.street,
                purok_id: params.purok
            }
        });

      
        return response.data; 

    } catch (error) {
        console.error('Check Head Error:', error);
        
    
    
        return { exists: false, error: true };
    }
},

    // 3. Register Resident
    register: async (formData) => {
    try {
        const data = new FormData();
        
        // Loop through all fields in formData
        Object.keys(formData).forEach(key => {
      
            if (key !== 'idFront' && key !== 'idBack') {
                let value = formData[key];

                // Convert boolean to 1 or 0 for Laravel
                if (typeof value === 'boolean') {
                    value = value ? 1 : 0;
                }

                if (value !== null && value !== undefined) {
                    data.append(key, value);
                }
            }
        });

        // Append Files
        if (formData.idFront) data.append('idFront', formData.idFront);
        if (formData.idBack) data.append('idBack', formData.idBack);

        const response = await axios.post(`${API_BASE_URL}/register`, data, {
            headers: { 
                'Content-Type': 'multipart/form-data',
                'Accept': 'application/json'
            }
        });
        
        return response.data;
    } catch (error) {
        console.error('Registration API Error:', error.response?.data || error.message);
        throw error;
    }
},
    // 4. Track Application
    track: async (trackingNumber) => {
        try {
            const cleanedNumber = trackingNumber.toUpperCase().trim();
            const response = await axios.get(`${API_BASE_URL}/track/${cleanedNumber}`);
            return response.data;
        } catch (error) {
            console.error('Tracking Error:', error.response?.data || error);
            throw error;
        }
    },

    // 5. Login (Simplified)
    login: async (username, password) => {
        try {
            const response = await axios.post(`${API_BASE_URL}/login`, { username, password });
            return response.data;
        } catch (error) {
            throw error;
        }
    }
};