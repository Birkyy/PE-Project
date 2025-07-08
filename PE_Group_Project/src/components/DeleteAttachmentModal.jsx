import { X, AlertTriangle, Trash2, File } from "lucide-react";
import { useTheme } from "../context/ThemeContext";

const DeleteAttachmentModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  fileName,
  fileSize = null,
  isLoading = false 
}) => {
  const { darkMode } = useTheme();

  const formatFileSize = (bytes) => {
    if (!bytes) return "";
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/20 backdrop-blur-sm transition-all duration-300"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div
          className={`relative w-full max-w-md rounded-lg shadow-xl ${
            darkMode ? "bg-gray-800" : "bg-white"
          } p-6`}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            disabled={isLoading}
            className={`absolute right-4 top-4 p-1 rounded-full transition-colors ${
              isLoading ? "opacity-50 cursor-not-allowed" : ""
            } ${
              darkMode
                ? "hover:bg-gray-700 text-gray-400 hover:text-gray-300"
                : "hover:bg-gray-100 text-gray-600 hover:text-gray-900"
            }`}
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header */}
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-full bg-red-500/10">
              <Trash2 className="w-5 h-5 text-red-500" />
            </div>
            <h3
              className={`text-xl font-semibold ${
                darkMode ? "text-white" : "text-gray-900"
              }`}
            >
              Delete Attachment
            </h3>
          </div>

          {/* Warning Message */}
          <div
            className={`mb-6 p-4 rounded-lg ${
              darkMode
                ? "bg-red-900/20 border border-red-800"
                : "bg-red-50 border border-red-100"
            }`}
          >
            <div className="flex gap-3">
              <AlertTriangle
                className={`w-5 h-5 mt-0.5 ${
                  darkMode ? "text-red-400" : "text-red-600"
                }`}
              />
              <div>
                <h4
                  className={`font-medium mb-1 ${
                    darkMode ? "text-red-400" : "text-red-600"
                  }`}
                >
                  Warning: This action cannot be undone
                </h4>
                <p
                  className={`text-sm ${
                    darkMode ? "text-red-300" : "text-red-500"
                  }`}
                >
                  You are about to permanently delete this attachment from the system.
                </p>
              </div>
            </div>
          </div>

          {/* File Info */}
          <div
            className={`mb-6 p-4 rounded-lg ${
              darkMode ? "bg-gray-900" : "bg-gray-50"
            }`}
          >
            <h4
              className={`text-sm font-medium mb-2 ${
                darkMode ? "text-gray-400" : "text-gray-600"
              }`}
            >
              Attachment to be deleted:
            </h4>
            <div className="flex items-center gap-3">
              <File
                className={`w-5 h-5 ${
                  darkMode ? "text-blue-400" : "text-blue-600"
                }`}
              />
              <div>
                <p
                  className={`font-medium ${
                    darkMode ? "text-white" : "text-gray-900"
                  }`}
                >
                  {fileName}
                </p>
                {fileSize && (
                  <p
                    className={`text-sm ${
                      darkMode ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    Size: {formatFileSize(fileSize)}
                  </p>
                )}
              </div>
            </div>
          </div>

          <p
            className={`mb-6 ${
              darkMode ? "text-gray-300" : "text-gray-600"
            }`}
          >
            Are you sure you want to delete this attachment? This action cannot be reversed.
          </p>

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              disabled={isLoading}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                isLoading ? "opacity-50 cursor-not-allowed" : ""
              } ${
                darkMode
                  ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={isLoading}
              className={`px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors flex items-center gap-2 ${
                isLoading ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4" />
                  Delete Attachment
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteAttachmentModal; 