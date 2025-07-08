import React, { useState } from "react";
import { useTheme } from "../context/ThemeContext";
import { Edit2, Trash2 } from "lucide-react";

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
      className={`p-7 rounded-2xl border-2 shadow-xl ${
        darkMode 
          ? "bg-gray-800 border-gray-500 shadow-gray-900/30 hover:border-gray-400" 
          : "bg-white border-gray-400 shadow-gray-300/60 hover:border-gray-500"
      } space-y-5 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1`}
    >
      {/* Header */}
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-3">
          <div className={`text-lg font-bold ${
            darkMode ? "text-blue-300" : "text-blue-700"
          }`}>
            {comment.username || comment.userId}
          </div>
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
          <div className={`text-lg leading-relaxed p-5 rounded-xl border-l-4 font-medium ${
            darkMode 
              ? "bg-gray-700/50 text-white border-l-blue-400 shadow-lg" 
              : "bg-white text-gray-900 border-l-blue-500 shadow-md border border-gray-200"
          }`}>
            {comment.comment}
          </div>
        </div>
      )}

      <div className={`text-sm font-semibold px-3 py-1 rounded-lg inline-block ${
        darkMode 
          ? "text-gray-300 bg-gray-700/50" 
          : "text-gray-700 bg-gray-100"
      }`}>
        {formatDate(comment.createdAt)}
      </div>
    </div>
  );
};

export default Comment;
