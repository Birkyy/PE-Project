import React, { useState } from "react";
import { useTheme } from "../context/ThemeContext";
import {
  Edit2,
  Trash2,
  Paperclip,
  Download,
  FileText,
  Image,
  File,
} from "lucide-react";

const Comment = ({
  comment,
  currentUser,
  onEdit,
  onDelete,
  canEdit = true,
  canDelete = true,
}) => {
  const { darkMode } = useTheme();
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(comment.comment);

  const isAuthor = currentUser && comment.userId === currentUser.userId;

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getFileIcon = (fileName) => {
    const extension = fileName.split(".").pop()?.toLowerCase();
    switch (extension) {
      case "pdf":
        return <FileText className="w-4 h-4" />;
      case "jpg":
      case "jpeg":
      case "png":
      case "gif":
      case "svg":
        return <Image className="w-4 h-4" />;
      case "doc":
      case "docx":
      case "txt":
      case "csv":
        return <FileText className="w-4 h-4" />;
      default:
        return <File className="w-4 h-4" />;
    }
  };

  const handleFileDownload = (attachment, event) => {
    event.preventDefault();
    event.stopPropagation();

    // For comment attachments, we can use the fileUrl directly
    if (attachment.fileUrl) {
      console.log(
        "Downloading file:",
        attachment.fileName,
        "from:",
        attachment.fileUrl
      );
      window.open(attachment.fileUrl, "_blank");
    } else if (attachment.url) {
      // Fallback for old format
      console.log(
        "Downloading file:",
        attachment.name,
        "from:",
        attachment.url
      );
      window.open(attachment.url, "_blank");
    }
  };

  const handleSave = () => {
    if (editText.trim()) {
      onEdit(comment.taskCommentId, { ...comment, comment: editText.trim() });
      setIsEditing(false);
    }
  };

  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this comment?")) {
      onDelete(comment.taskCommentId);
    }
  };

  return (
    <div
      className={`p-6 rounded-xl border-2 shadow-lg ${
        darkMode 
          ? "bg-gray-800 border-gray-600 shadow-gray-900/20" 
          : "bg-white border-gray-300 shadow-gray-200/50"
      } space-y-4 hover:shadow-xl transition-all duration-200`}
    >
      {/* Header */}
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-3">
          <div className={`text-base font-semibold ${
            darkMode ? "text-white" : "text-gray-900"
          }`}>
            {comment.username || comment.userId}
          </div>
          {comment.attachments && comment.attachments.length > 0 && (
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${
                darkMode
                  ? "bg-blue-500/30 text-blue-300 border border-blue-400/30"
                  : "bg-blue-100 text-blue-700 border border-blue-200"
              }`}
            >
              <Paperclip className="w-4 h-4" />
              {comment.attachments.length} files
            </span>
          )}
        </div>
        {isAuthor && !isEditing && (
          <div className="flex gap-3">
            {canEdit && (
              <button
                onClick={() => setIsEditing(true)}
                className={`p-2 rounded-lg transition-colors ${
                  darkMode
                    ? "hover:bg-gray-700 text-gray-400 hover:text-white"
                    : "hover:bg-gray-100 text-gray-500 hover:text-gray-700"
                }`}
              >
                <Edit2 className="w-5 h-5" />
              </button>
            )}
            {canDelete && (
              <button
                onClick={handleDelete}
                className={`p-2 rounded-lg transition-colors ${
                  darkMode
                    ? "hover:bg-red-900/30 text-red-400 hover:text-red-300"
                    : "hover:bg-red-50 text-red-500 hover:text-red-600"
                }`}
              >
                <Trash2 className="w-5 h-5" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Body */}
      {isEditing ? (
        <div className="space-y-3">
          <textarea
            className={`w-full p-4 border-2 rounded-lg text-base ${
              darkMode
                ? "bg-gray-700 border-gray-600 text-white focus:border-blue-500"
                : "bg-white border-gray-300 text-gray-900 focus:border-blue-500"
            } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            rows={4}
          />
          <div className="flex gap-3">
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all font-medium"
            >
              Save Changes
            </button>
            <button
              onClick={() => setIsEditing(false)}
              className={`px-4 py-2 rounded-lg border-2 font-medium transition-colors ${
                darkMode
                  ? "border-gray-600 text-gray-300 hover:bg-gray-700"
                  : "border-gray-300 text-gray-700 hover:bg-gray-50"
              }`}
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Only show comment text if it's not the default 'File attachment' or if there are no attachments */}
          {comment.comment &&
            (comment.comment !== "File attachment" ||
              !comment.attachments ||
              comment.attachments.length === 0) && (
              <div className={`text-base leading-relaxed p-4 rounded-lg ${
                darkMode ? "bg-gray-700/30 text-gray-200" : "bg-gray-50 text-gray-800"
              }`}>
                {comment.comment}
              </div>
            )}
          {/* Always show attachments if they exist */}
          {comment.attachments && comment.attachments.length > 0 && (
            <div className="space-y-3">
              <div
                className={`text-sm font-semibold flex items-center gap-2 ${
                  darkMode ? "text-gray-300" : "text-gray-700"
                }`}
              >
                <Paperclip className="w-4 h-4" />
                Attachments ({comment.attachments.length})
              </div>
              <div className="space-y-2">
                {comment.attachments.map((attachment, index) => (
                  <div
                    key={index}
                    className={`group flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                      darkMode
                        ? "bg-gray-700/50 border-gray-600 hover:bg-gray-600 hover:border-gray-500 hover:shadow-lg"
                        : "bg-gray-50 border-gray-300 hover:bg-blue-50 hover:border-blue-400 hover:shadow-md"
                    }`}
                    onClick={(e) => handleFileDownload(attachment, e)}
                    title={`Click to download ${
                      attachment.fileName || attachment.name
                    }`}
                  >
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <span
                        className={`transition-colors duration-200 ${
                          darkMode
                            ? "text-blue-400 group-hover:text-blue-300"
                            : "text-blue-600 group-hover:text-blue-700"
                        }`}
                      >
                        {getFileIcon(attachment.fileName || attachment.name)}
                      </span>
                      <div className="flex-1 min-w-0">
                        <span
                          className={`text-base font-medium truncate block ${
                            darkMode ? "text-gray-200" : "text-gray-800"
                          }`}
                        >
                          {attachment.fileName || attachment.name}
                        </span>
                        <span
                          className={`text-sm ${
                            darkMode ? "text-gray-400" : "text-gray-600"
                          }`}
                        >
                          {formatFileSize(
                            attachment.fileSize || attachment.size
                          )}
                        </span>
                      </div>
                    </div>
                    <Download
                      className={`w-5 h-5 transition-colors duration-200 ${
                        darkMode
                          ? "text-gray-400 group-hover:text-blue-300"
                          : "text-gray-500 group-hover:text-blue-600"
                      }`}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <div className={`text-sm font-medium ${
        darkMode ? "text-gray-400" : "text-gray-600"
      }`}>
        {formatDate(comment.createdAt)}
      </div>
    </div>
  );
};

export default Comment;
