import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api/";

const publicApi = axios.create({
  baseURL: BASE_URL,
});

export default publicApi;
