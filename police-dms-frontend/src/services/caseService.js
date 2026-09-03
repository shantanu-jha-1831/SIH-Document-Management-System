import api from "./api";

export const getOngoingCases = async () => {
    const response = await api.get("/cases/ongoing");
    return response.data;
};


export const getCompletedCases = async () => {
    const response = await api.get("/cases/completed");
    return response.data;
};


export const getMyCases = async () => {
    const response = await api.get("/cases/my");
    return response.data;
};


export const getCaseById = async (caseId) => {
    const response = await api.get(`/cases/${caseId}`);
    return response.data;
};