import axios from "axios";

export const pptApiClient = axios.create({
    baseURL: import.meta.env.VITE_API_URL + "/ppt"
})

