import axios from 'axios';

const API_URL = "http://localhost:5018/api/ProjectTask";

export const fetchProjectTasks = async () => {
    try {
        const response = await axios.get(API_URL);
        return response.data;
    } catch (error) {
        console.error("Error fetching project tasks:", error);
        throw error;
    }
};

export const addProjectTask = async (projectTask) => {
    try {
        const response = await axios.post(API_URL, projectTask);
        return response.data;
    } catch (error) {
        console.error("Error adding project task:", error);
        throw error;
    }
};

export const editProjectTask = async (projectTaskId, updatedProjectTask) => {
    try {
        const response = await axios.put(`${API_URL}/${projectTaskId}`, updatedProjectTask);
        return response.data;
    } catch (error) {
        console.error("Error editing project task:", error);
        throw error;
    }
};

export const deleteProjectTask = async (projectTaskId) => {
    try {
        const response = await axios.delete(`${API_URL}/${projectTaskId}`);
        return response.data;
    } catch (error) {
        console.error("Error deleting project task:", error);
        throw error;
    }
};

export const getIfProjectTaskOverdue = async (projectTaskId) => {
    try {
        const response = await axios.get(`${API_URL}/${projectTaskId}/is-overdue`);
        return response.data;
    } catch (error) {
        console.error("Error checking if project task is overdue:", error);
        throw error;
    }
}; 