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
      className={`p-4 rounded-lg ${
        darkMode ? "bg-gray-700/50" : "bg-gray-50"
      } space-y-3`}
    >
      {/* Header */}
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-2">
          <div className="text-sm font-medium">
            {comment.username || comment.userId}
          </div>
          {comment.attachments && comment.attachments.length > 0 && (
            <span
              className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${
                darkMode
                  ? "bg-blue-500/20 text-blue-300"
                  : "bg-blue-100 text-blue-700"
              }`}
            >
              <Paperclip className="w-3 h-3" />
              {comment.attachments.length}
            </span>
          )}
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
          {/* Only show comment text if it's not the default 'File attachment' or if there are no attachments */}
          {comment.comment &&
            (comment.comment !== "File attachment" ||
              !comment.attachments ||
              comment.attachments.length === 0) && (
              <div className="text-sm">{comment.comment}</div>
            )}
          {/* Always show attachments if they exist */}
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
                    className={`group flex items-center justify-between p-3 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                      darkMode
                        ? "bg-gray-600/50 border-gray-500 hover:bg-gray-500 hover:border-gray-400 hover:shadow-lg"
                        : "bg-gray-50 border-gray-300 hover:bg-blue-50 hover:border-blue-300 hover:shadow-md"
                    }`}
                    onClick={(e) => handleFileDownload(attachment, e)}
                    title={`Click to download ${
                      attachment.fileName || attachment.name
                    }`}
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
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
                          className={`text-sm font-medium truncate block ${
                            darkMode ? "text-gray-200" : "text-gray-700"
                          }`}
                        >
                          {attachment.fileName || attachment.name}
                        </span>
                        <span
                          className={`text-xs ${
                            darkMode ? "text-gray-400" : "text-gray-500"
                          }`}
                        >
                          {formatFileSize(
                            attachment.fileSize || attachment.size
                          )}
                        </span>
                      </div>
                    </div>
                    <Download
                      className={`w-4 h-4 transition-colors duration-200 ${
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

      <div className="text-xs text-gray-400">
        {formatDate(comment.createdAt)}
      </div>
    </div>
  );
};

export default Comment;
