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

  const handleFileDownload = (file) => {
    // Extract the filename from the URL path
    const urlParts = file.url.split("/");
    const fileName = urlParts[urlParts.length - 1];
    const taskId = urlParts[urlParts.length - 2];

    // Construct the download URL
    const downloadUrl = `http://localhost:5022/api/File/download/tasks/${taskId}/${fileName}`;

    // Open in new tab for download
    window.open(downloadUrl, "_blank");
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
      className={`p-4 rounded-lg ${
        darkMode ? "bg-gray-700/50" : "bg-gray-50"
      } space-y-3`}
    >
      {/* Header */}
      <div className="flex justify-between">
        <div className="text-sm font-medium">
          {comment.username || comment.userId}
        </div>
        {isAuthor && !isEditing && (
          <div className="flex gap-2">
            {canEdit && (
              <Edit2
                onClick={() => setIsEditing(true)}
                className="w-4 h-4 cursor-pointer"
              />
            )}
            {canDelete && (
              <Trash2
                onClick={handleDelete}
                className="w-4 h-4 cursor-pointer text-red-500"
              />
            )}
          </div>
        )}
      </div>

      {/* Body */}
      {isEditing ? (
        <div className="space-y-2">
          <textarea
            className="w-full p-2 border rounded"
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
          />
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              className="px-3 py-1 bg-blue-600 text-white rounded"
            >
              Save
            </button>
            <button
              onClick={() => setIsEditing(false)}
              className="px-3 py-1 bg-gray-300 rounded"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="text-sm">{comment.comment}</div>

          {/* File Attachments */}
          {comment.attachments && comment.attachments.length > 0 && (
            <div className="space-y-2">
              <div
                className={`text-xs font-medium flex items-center gap-1 ${
                  darkMode ? "text-gray-300" : "text-gray-600"
                }`}
              >
                <Paperclip className="w-3 h-3" />
                Attachments ({comment.attachments.length})
              </div>
              <div className="space-y-1">
                {comment.attachments.map((attachment, index) => (
                  <div
                    key={index}
                    className={`flex items-center justify-between p-2 rounded border cursor-pointer transition-colors ${
                      darkMode
                        ? "bg-gray-600 border-gray-500 hover:bg-gray-500"
                        : "bg-gray-100 border-gray-300 hover:bg-gray-200"
                    }`}
                    onClick={() => handleFileDownload(attachment)}
                  >
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <span
                        className={`${
                          darkMode ? "text-gray-300" : "text-gray-600"
                        }`}
                      >
                        {getFileIcon(attachment.name)}
                      </span>
                      <span
                        className={`text-sm truncate ${
                          darkMode ? "text-gray-200" : "text-gray-700"
                        }`}
                      >
                        {attachment.name}
                      </span>
                      <span
                        className={`text-xs ${
                          darkMode ? "text-gray-400" : "text-gray-500"
                        }`}
                      >
                        ({formatFileSize(attachment.size)})
                      </span>
                    </div>
                    <Download
                      className={`w-4 h-4 ${
                        darkMode ? "text-gray-400" : "text-gray-500"
                      }`}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="text-xs text-gray-400">
        {formatDate(comment.createdAt)}
      </div>
    </div>
  );
};

export default Comment;
