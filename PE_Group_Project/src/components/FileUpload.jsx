import React, { useState, useRef } from "react";
import { useTheme } from "../context/ThemeContext";
import {
  Upload,
  X,
  File,
  CheckCircle,
  AlertCircle,
  Loader,
} from "lucide-react";
import { fileAPI } from "../API/apiService";

const FileUpload = ({
  onFileUploaded,
  category = null,
  relatedId = null,
  maxFiles = 5,
  acceptedTypes = "*",
  maxFileSize = 50 * 1024 * 1024, // 50MB default
  className = "",
}) => {
  const { darkMode } = useTheme();
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getFileIcon = (fileName) => {
    const extension = fileName.split(".").pop().toLowerCase();
    const imageExts = ["jpg", "jpeg", "png", "gif", "bmp", "webp", "svg"];
    const videoExts = ["mp4", "avi", "mov", "wmv", "flv", "webm"];
    const audioExts = ["mp3", "wav", "flac", "aac", "ogg"];
    const docExts = ["pdf", "doc", "docx", "txt", "rtf"];

    if (imageExts.includes(extension)) return "🖼️";
    if (videoExts.includes(extension)) return "🎥";
    if (audioExts.includes(extension)) return "🎵";
    if (docExts.includes(extension)) return "📄";
    return "📎";
  };

  const allowedExtensions = [
    "pdf",
    "doc",
    "docx",
    "txt",
    "jpg",
    "jpeg",
    "png",
    "gif",
    "mp4",
    "avi",
    "zip",
    "rar",
  ];

  const allowedMimeTypes = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "text/plain",
    "image/jpeg",
    "image/png",
    "image/gif",
    "video/mp4",
    "video/x-msvideo",
    "application/zip",
    "application/x-rar-compressed",
  ];

  const validateFile = (file) => {
    // Check file size
    if (file.size > maxFileSize) {
      return {
        valid: false,
        error: `File size exceeds the maximum limit of ${formatFileSize(
          maxFileSize
        )}`,
      };
    }

    // Check file type if specified
    if (acceptedTypes !== "*") {
      const acceptedTypesArray = acceptedTypes
        .split(",")
        .map((type) => type.trim());
      const fileExtension = "." + file.name.split(".").pop().toLowerCase();
      const fileType = file.type;

      const isAccepted = acceptedTypesArray.some((type) => {
        if (type.startsWith(".")) {
          return fileExtension === type.toLowerCase();
        } else {
          return fileType === type;
        }
      });

      if (!isAccepted) {
        return {
          valid: false,
          error: `File type not accepted. Allowed types: ${acceptedTypes}`,
        };
      }
    }

    return { valid: true };
  };

  const handleFileSelect = (selectedFiles) => {
    const newFiles = Array.from(selectedFiles).map((file) => ({
      file,
      id: Date.now() + Math.random(),
      name: file.name,
      size: file.size,
      status: "pending", // pending, uploading, success, error
      error: null,
      url: null,
    }));

    // Validate files
    const validFiles = [];
    const invalidFiles = [];

    newFiles.forEach((fileObj) => {
      const validation = validateFile(fileObj.file);
      if (validation.valid) {
        validFiles.push(fileObj);
      } else {
        fileObj.status = "error";
        fileObj.error = validation.error;
        invalidFiles.push(fileObj);
      }
    });

    // Check if adding these files would exceed maxFiles
    if (files.length + validFiles.length > maxFiles) {
      alert(`You can only upload a maximum of ${maxFiles} files.`);
      return;
    }

    setFiles((prev) => [...prev, ...validFiles, ...invalidFiles]);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files);
    }
  };

  const removeFile = (fileId) => {
    setFiles((prev) => prev.filter((f) => f.id !== fileId));
  };

  const uploadFiles = async () => {
    const pendingFiles = files.filter((f) => f.status === "pending");
    if (pendingFiles.length === 0) return;

    setUploading(true);

    try {
      for (const fileObj of pendingFiles) {
        // Update status to uploading
        setFiles((prev) =>
          prev.map((f) =>
            f.id === fileObj.id ? { ...f, status: "uploading" } : f
          )
        );

        try {
          let uploadResult;

          if (category === "project" && relatedId) {
            uploadResult = await fileAPI.uploadProjectFile(
              fileObj.file,
              relatedId
            );
          } else if (category === "task" && relatedId) {
            uploadResult = await fileAPI.uploadTaskFile(
              fileObj.file,
              relatedId
            );
          } else {
            uploadResult = await fileAPI.uploadFile(
              fileObj.file,
              category,
              relatedId
            );
          }

          // Update file with success status and URL
          setFiles((prev) =>
            prev.map((f) =>
              f.id === fileObj.id
                ? {
                    ...f,
                    status: "success",
                    url: uploadResult.url,
                    uploadedFileName: uploadResult.fileName,
                  }
                : f
            )
          );

          // Call the callback with the uploaded file info
          if (onFileUploaded) {
            onFileUploaded({
              ...uploadResult,
              originalFile: fileObj.file,
            });
          }
        } catch (error) {
          console.error("Error uploading file:", error);

          // Update file with error status
          setFiles((prev) =>
            prev.map((f) =>
              f.id === fileObj.id
                ? {
                    ...f,
                    status: "error",
                    error:
                      error.response?.data || error.message || "Upload failed",
                  }
                : f
            )
          );
        }
      }
    } finally {
      setUploading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "uploading":
        return <Loader className="w-4 h-4 animate-spin text-blue-500" />;
      case "success":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "error":
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <File className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "uploading":
        return "border-blue-500 bg-blue-50 dark:bg-blue-900/20";
      case "success":
        return "border-green-500 bg-green-50 dark:bg-green-900/20";
      case "error":
        return "border-red-500 bg-red-50 dark:bg-red-900/20";
      default:
        return "border-gray-300 bg-gray-50 dark:bg-gray-700 dark:border-gray-600";
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload Area */}
      <div
        className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          dragActive
            ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
            : darkMode
            ? "border-gray-600 bg-gray-800 hover:border-gray-500"
            : "border-gray-300 bg-gray-50 hover:border-gray-400"
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={acceptedTypes}
          onChange={(e) => handleFileSelect(e.target.files)}
          className="hidden"
        />

        <Upload
          className={`w-12 h-12 mx-auto mb-4 ${
            dragActive
              ? "text-blue-500"
              : darkMode
              ? "text-gray-400"
              : "text-gray-500"
          }`}
        />

        <p
          className={`text-lg font-medium mb-2 ${
            darkMode ? "text-white" : "text-gray-900"
          }`}
        >
          Drop files here or click to upload
        </p>

        <p
          className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}
        >
          Maximum {maxFiles} files, up to {formatFileSize(maxFileSize)} each
        </p>

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className={`mt-4 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            darkMode
              ? "bg-blue-600 hover:bg-blue-700 text-white"
              : "bg-blue-600 hover:bg-blue-700 text-white"
          }`}
        >
          Choose Files
        </button>
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4
              className={`text-sm font-medium ${
                darkMode ? "text-gray-300" : "text-gray-700"
              }`}
            >
              Selected Files ({files.length}/{maxFiles})
            </h4>

            {files.some((f) => f.status === "pending") && (
              <button
                onClick={uploadFiles}
                disabled={uploading}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  uploading
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : darkMode
                    ? "bg-green-600 hover:bg-green-700 text-white"
                    : "bg-green-600 hover:bg-green-700 text-white"
                }`}
              >
                {uploading ? "Uploading..." : "Upload Files"}
              </button>
            )}
          </div>

          <div className="space-y-2">
            {files.map((fileObj) => (
              <div
                key={fileObj.id}
                className={`flex items-center justify-between p-3 rounded-lg border ${getStatusColor(
                  fileObj.status
                )}`}
              >
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  {getStatusIcon(fileObj.status)}

                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-sm font-medium truncate ${
                        darkMode ? "text-white" : "text-gray-900"
                      }`}
                    >
                      {fileObj.name}
                    </p>
                    <p
                      className={`text-xs ${
                        darkMode ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      {formatFileSize(fileObj.size)}
                    </p>
                    {fileObj.error && (
                      <p className="text-xs text-red-500 mt-1">
                        {fileObj.error}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {fileObj.url && (
                    <a
                      href={fileObj.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`p-1 rounded transition-colors ${
                        darkMode
                          ? "hover:bg-gray-700 text-gray-400 hover:text-gray-300"
                          : "hover:bg-gray-200 text-gray-600 hover:text-gray-900"
                      }`}
                      title="Open file"
                    >
                      <File className="w-4 h-4" />
                    </a>
                  )}

                  <button
                    onClick={() => removeFile(fileObj.id)}
                    className={`p-1 rounded transition-colors ${
                      darkMode
                        ? "hover:bg-red-600/20 text-red-400 hover:text-red-300"
                        : "hover:bg-red-100 text-red-500 hover:text-red-700"
                    }`}
                    title="Remove file"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUpload;
