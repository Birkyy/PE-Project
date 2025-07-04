import axios from 'axios';

const API_URL = "http://localhost:5022/api/Project";

export const fetchProjects = async () => {
    try {
        const response = await axios.get(API_URL);
        return response.data;
    } catch (error) {
        console.error("Error fetching projects:", error);
        throw error;
    }
};

export const addProject = async (project) => {
    try {
        const response = await axios.post(API_URL, project);
        return response.data;
    } catch (error) {
        console.error("Error adding project:", error);
        throw error;
    }
};

export const editProject = async (projectId, updatedProject) => {
    try {
        const response = await axios.put(`${API_URL}/${projectId}`, updatedProject);
        return response.data;
    } catch (error) {
        console.error("Error editing project:", error);
        throw error;
    }
};

export const deleteProject = async (projectId) => {
    try {
        const response = await axios.delete(`${API_URL}/${projectId}`);
        return response.data;
    } catch (error) {
        console.error("Error deleting project:", error);
        throw error;
    }
};

export const getIfProjectOverdue = async (projectId) => {
    try {
        const response = await axios.get(`${API_URL}/${projectId}/is-overdue`);
        return response.data;
    } catch (error) {
        console.error("Error checking if project is overdue:", error);
        throw error;
    }
}; 