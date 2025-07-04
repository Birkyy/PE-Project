import axios from 'axios';

const API_URL = "http://localhost:5018/api/Project";

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
        const formData = new FormData();
        
        // Add basic project data
        formData.append('projectName', project.projectName);
        formData.append('date', project.date);
        formData.append('status', project.status);
        formData.append('priorityLevel', project.priorityLevel);
        formData.append('description', project.description || '');

        // Add files if any
        if (project.files) {
            project.files.forEach(file => {
                formData.append('newAttachments', file);
            });
        }

        const response = await axios.post(API_URL, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data;
    } catch (error) {
        console.error("Error adding project:", error);
        throw error;
    }
};

export const editProject = async (projectId, updatedProject) => {
    try {
        const formData = new FormData();
        
        // Add basic project data
        formData.append('projectName', updatedProject.projectName);
        formData.append('date', updatedProject.date);
        formData.append('status', updatedProject.status);
        formData.append('priorityLevel', updatedProject.priorityLevel);
        formData.append('description', updatedProject.description || '');

        // Add new files if any
        if (updatedProject.files) {
            updatedProject.files.forEach(file => {
                if (file.file) { // New file to upload
                    formData.append('newAttachments', file.file);
                }
            });
        }

        // Add files to remove if any
        if (updatedProject.attachmentsToRemove) {
            updatedProject.attachmentsToRemove.forEach(attachmentId => {
                formData.append('attachmentsToRemove', attachmentId);
            });
        }

        const response = await axios.put(`${API_URL}/${projectId}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
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