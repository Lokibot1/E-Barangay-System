const BASE_IP = "127.0.0.1"; 

const PORT_BACKEND = "8000";
const PORT_FRONTEND = "5173";

export const STORAGE_URL = `http://${BASE_IP}:${PORT_BACKEND}/storage`;
export const API_BASE_URL = `http://${BASE_IP}:${PORT_BACKEND}/api`;
export const VERIFY_URL  = `http://${BASE_IP}:${PORT_BACKEND}`; 
export const FRONTEND_URL = `http://${BASE_IP}:${PORT_FRONTEND}`;