import { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { X, Upload, Trash2, File } from 'lucide-react';

function EditProjectModal({ isOpen, onClose, onSubmit, project }) {
    const { darkMode } = useTheme();
    const [formData, setFormData] = useState({
        projectName: '',
        description: '',
        status: '',
        priorityLevel: '',
        date: '',
        files: []
    });
    const [dragActive, setDragActive] = useState(false);
    const [fileError, setFileError] = useState('');

    useEffect(() => {
        if (project) {
            setFormData({
                projectName: project.name || '',
                description: project.description || '',
                status: project.status || '',
                priorityLevel: project.priority || '',
                date: project.dueDate || '',
                files: project.attachments || []
            });
        }
    }, [project]);

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const validateFile = (file) => {
        const maxSize = 5 * 1024 * 1024; // 5MB
        if (file.size > maxSize) {
            setFileError(`File ${file.name} is too large. Maximum size is 5MB.`);
            return false;
        }
        return true;
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        setFileError('');

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const files = Array.from(e.dataTransfer.files);
            const validFiles = files.filter(validateFile);
            
            if (validFiles.length > 0) {
                setFormData(prev => ({
                    ...prev,
                    files: [...prev.files, ...validFiles.map(file => ({
                        id: Date.now() + Math.random(),
                        name: file.name,
                        size: file.size,
                        type: file.type,
                        file: file
                    }))]
                }));
            }
        }
    };

    const handleFileInput = (e) => {
        setFileError('');
        const files = Array.from(e.target.files);
        const validFiles = files.filter(validateFile);

        if (validFiles.length > 0) {
            setFormData(prev => ({
                ...prev,
                files: [...prev.files, ...validFiles.map(file => ({
                    id: Date.now() + Math.random(),
                    name: file.name,
                    size: file.size,
                    type: file.type,
                    file: file
                }))]
            }));
        }
    };

    const removeFile = (fileId) => {
        setFormData(prev => ({
            ...prev,
            files: prev.files.filter(f => f.id !== fileId)
        }));
    };

    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen p-4">
                <div className="fixed inset-0 bg-black opacity-50"></div>
                
                <div className={`relative w-full max-w-2xl p-6 rounded-lg shadow-lg ${
                    darkMode ? 'bg-gray-800' : 'bg-white'
                }`}>
                    <div className="flex justify-between items-center mb-4">
                        <h2 className={`text-xl font-semibold ${
                            darkMode ? 'text-white' : 'text-gray-900'
                        }`}>
                            Edit Project
                        </h2>
                        <button
                            onClick={onClose}
                            className={`p-1 rounded-full ${
                                darkMode 
                                    ? 'hover:bg-gray-700 text-gray-400' 
                                    : 'hover:bg-gray-100 text-gray-600'
                            }`}
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className={`block mb-1 ${
                                darkMode ? 'text-gray-300' : 'text-gray-700'
                            }`}>
                                Project Name
                            </label>
                            <input
                                type="text"
                                value={formData.projectName}
                                onChange={(e) => setFormData(prev => ({
                                    ...prev,
                                    projectName: e.target.value
                                }))}
                                className={`w-full p-2 border rounded-lg ${
                                    darkMode
                                        ? 'bg-gray-700 border-gray-600 text-white'
                                        : 'bg-white border-gray-300 text-gray-900'
                                }`}
                                required
                            />
                        </div>

                        <div>
                            <label className={`block mb-1 ${
                                darkMode ? 'text-gray-300' : 'text-gray-700'
                            }`}>
                                Description
                            </label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData(prev => ({
                                    ...prev,
                                    description: e.target.value
                                }))}
                                className={`w-full p-2 border rounded-lg ${
                                    darkMode
                                        ? 'bg-gray-700 border-gray-600 text-white'
                                        : 'bg-white border-gray-300 text-gray-900'
                                }`}
                                rows="3"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className={`block mb-1 ${
                                    darkMode ? 'text-gray-300' : 'text-gray-700'
                                }`}>
                                    Status
                                </label>
                                <select
                                    value={formData.status}
                                    onChange={(e) => setFormData(prev => ({
                                        ...prev,
                                        status: e.target.value
                                    }))}
                                    className={`w-full p-2 border rounded-lg ${
                                        darkMode
                                            ? 'bg-gray-700 border-gray-600 text-white'
                                            : 'bg-white border-gray-300 text-gray-900'
                                    }`}
                                    required
                                >
                                    <option value="">Select Status</option>
                                    <option value="Todo">Todo</option>
                                    <option value="In Progress">In Progress</option>
                                    <option value="Completed">Completed</option>
                                </select>
                            </div>

                            <div>
                                <label className={`block mb-1 ${
                                    darkMode ? 'text-gray-300' : 'text-gray-700'
                                }`}>
                                    Priority Level
                                </label>
                                <select
                                    value={formData.priorityLevel}
                                    onChange={(e) => setFormData(prev => ({
                                        ...prev,
                                        priorityLevel: e.target.value
                                    }))}
                                    className={`w-full p-2 border rounded-lg ${
                                        darkMode
                                            ? 'bg-gray-700 border-gray-600 text-white'
                                            : 'bg-white border-gray-300 text-gray-900'
                                    }`}
                                    required
                                >
                                    <option value="">Select Priority</option>
                                    <option value="low">Low</option>
                                    <option value="medium">Medium</option>
                                    <option value="high">High</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className={`block mb-1 ${
                                darkMode ? 'text-gray-300' : 'text-gray-700'
                            }`}>
                                Due Date
                            </label>
                            <input
                                type="date"
                                value={formData.date}
                                onChange={(e) => setFormData(prev => ({
                                    ...prev,
                                    date: e.target.value
                                }))}
                                className={`w-full p-2 border rounded-lg ${
                                    darkMode
                                        ? 'bg-gray-700 border-gray-600 text-white'
                                        : 'bg-white border-gray-300 text-gray-900'
                                }`}
                                required
                            />
                        </div>

                        {/* File Upload Section */}
                        <div>
                            <label className={`block mb-1 ${
                                darkMode ? 'text-gray-300' : 'text-gray-700'
                            }`}>
                                Attachments
                            </label>
                            <div
                                onDragEnter={handleDrag}
                                onDragLeave={handleDrag}
                                onDragOver={handleDrag}
                                onDrop={handleDrop}
                                className={`border-2 border-dashed rounded-lg p-4 transition-colors ${
                                    dragActive
                                        ? darkMode
                                            ? 'border-blue-500 bg-blue-500/10'
                                            : 'border-blue-500 bg-blue-50'
                                        : darkMode
                                            ? 'border-gray-600 hover:border-gray-500'
                                            : 'border-gray-300 hover:border-gray-400'
                                }`}
                            >
                                <div className="flex flex-col items-center justify-center gap-2">
                                    <Upload className={`w-8 h-8 ${
                                        darkMode ? 'text-gray-400' : 'text-gray-500'
                                    }`} />
                                    <p className={`text-sm ${
                                        darkMode ? 'text-gray-400' : 'text-gray-600'
                                    }`}>
                                        Drag and drop files here, or
                                    </p>
                                    <label className={`px-4 py-2 rounded-lg cursor-pointer ${
                                        darkMode
                                            ? 'bg-blue-600 hover:bg-blue-700 text-white'
                                            : 'bg-blue-500 hover:bg-blue-600 text-white'
                                    }`}>
                                        Browse Files
                                        <input
                                            type="file"
                                            className="hidden"
                                            multiple
                                            onChange={handleFileInput}
                                        />
                                    </label>
                                </div>
                            </div>

                            {fileError && (
                                <p className="mt-2 text-sm text-red-500">
                                    {fileError}
                                </p>
                            )}

                            {/* File List */}
                            {formData.files.length > 0 && (
                                <div className="mt-4 space-y-2">
                                    {formData.files.map(file => (
                                        <div
                                            key={file.id}
                                            className={`flex items-center justify-between p-2 rounded-lg ${
                                                darkMode
                                                    ? 'bg-gray-700'
                                                    : 'bg-gray-50'
                                            }`}
                                        >
                                            <div className="flex items-center gap-2">
                                                <File className={`w-4 h-4 ${
                                                    darkMode ? 'text-gray-400' : 'text-gray-500'
                                                }`} />
                                                <div>
                                                    <p className={`text-sm font-medium ${
                                                        darkMode ? 'text-white' : 'text-gray-900'
                                                    }`}>
                                                        {file.name}
                                                    </p>
                                                    <p className={`text-xs ${
                                                        darkMode ? 'text-gray-400' : 'text-gray-500'
                                                    }`}>
                                                        {formatFileSize(file.size)}
                                                    </p>
                                                </div>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => removeFile(file.id)}
                                                className={`p-1 rounded-full ${
                                                    darkMode
                                                        ? 'hover:bg-gray-600 text-gray-400'
                                                        : 'hover:bg-gray-200 text-gray-500'
                                                }`}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="flex justify-end gap-3 mt-6">
                            <button
                                type="button"
                                onClick={onClose}
                                className={`px-4 py-2 rounded-lg ${
                                    darkMode
                                        ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                                        : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                                }`}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className={`px-4 py-2 rounded-lg ${
                                    darkMode
                                        ? 'bg-blue-600 hover:bg-blue-700 text-white'
                                        : 'bg-blue-500 hover:bg-blue-600 text-white'
                                }`}
                            >
                                Save Changes
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default EditProjectModal; 