import api from "./api";

export const loginUser = async (data) => {
    const response = await api.post("/auth/login", data);
    return response.data;
};


export const registerOfficer = async (data) => {
    const response = await api.post("/auth/register", data);
    return response.data;
};


export const logoutUser = async () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
};