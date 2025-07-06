import React, { useState, useRef } from 'react';
import { useTheme } from '../context/ThemeContext';
import { 
  Edit2, 
  Trash2, 
  Save, 
  X, 
  Paperclip, 
  Download, 
  File,
  Image,
  FileText,
  Video,
  Music
} from 'lucide-react';

const Comment = ({ 
  comment, 
  currentUser, 
  onEdit, 
  onDelete, 
  canEdit = true, 
  canDelete = true 
}) => {
  const { darkMode } = useTheme();
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(comment.text);
  const [attachments, setAttachments] = useState(comment.attachments || []);
  const fileInputRef = useRef(null);

  // Check if current user can modify this comment
  const isAuthor = currentUser && (
    comment.authorId === currentUser.id || 
    comment.author === currentUser.username || 
    comment.author === currentUser.email
  );

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString(undefined, { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (fileName) => {
    const extension = fileName.split('.').pop().toLowerCase();
    const imageExts = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg'];
    const videoExts = ['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm'];
    const audioExts = ['mp3', 'wav', 'flac', 'aac', 'ogg'];
    const docExts = ['pdf', 'doc', 'docx', 'txt', 'rtf'];

    if (imageExts.includes(extension)) return <Image className="w-4 h-4" />;
    if (videoExts.includes(extension)) return <Video className="w-4 h-4" />;
    if (audioExts.includes(extension)) return <Music className="w-4 h-4" />;
    if (docExts.includes(extension)) return <FileText className="w-4 h-4" />;
    return <File className="w-4 h-4" />;
  };

  const handleEdit = () => {
    if (!isAuthor || !canEdit) return;
    setIsEditing(true);
  };

  const handleSave = () => {
    if (editText.trim()) {
      onEdit(comment.id, {
        ...comment,
        text: editText.trim(),
        attachments,
        lastEdited: new Date().toISOString()
      });
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setEditText(comment.text);
    setAttachments(comment.attachments || []);
    setIsEditing(false);
  };

  const handleDelete = () => {
    if (!isAuthor || !canDelete) return;
    if (window.confirm('Are you sure you want to delete this comment?')) {
      onDelete(comment.id);
    }
  };

  const handleFileSelect = (event) => {
    const files = Array.from(event.target.files);
    const newAttachments = files.map(file => ({
      id: Date.now() + Math.random(),
      name: file.name,
      size: file.size,
      type: file.type,
      file: file, // Store the actual file object
      uploadedAt: new Date().toISOString()
    }));
    
    setAttachments(prev => [...prev, ...newAttachments]);
    event.target.value = ''; // Reset file input
  };

  const handleRemoveAttachment = (attachmentId) => {
    setAttachments(prev => prev.filter(att => att.id !== attachmentId));
  };

  const handleDownloadAttachment = (attachment) => {
    if (attachment.file) {
      // Create download link for the file
      const url = URL.createObjectURL(attachment.file);
      const a = document.createElement('a');
      a.href = url;
      a.download = attachment.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className={`p-4 rounded-lg ${
      darkMode ? 'bg-gray-700/50' : 'bg-gray-50'
    } space-y-3`}>
      {/* Comment Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-2">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            darkMode ? 'bg-blue-600' : 'bg-blue-500'
          } text-white text-sm font-medium`}>
            {comment.author.charAt(0).toUpperCase()}
          </div>
          <div>
            <span className={`font-medium text-sm ${
              darkMode ? 'text-gray-200' : 'text-gray-900'
            }`}>
              {comment.author}
            </span>
            <div className={`text-xs ${
              darkMode ? 'text-gray-400' : 'text-gray-500'
            }`}>
              {formatDate(comment.timestamp)}
              {comment.lastEdited && (
                <span className="ml-2">(edited)</span>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        {isAuthor && !isEditing && (
          <div className="flex space-x-1">
            {canEdit && (
              <button
                onClick={handleEdit}
                className={`p-1 rounded-full transition-colors ${
                  darkMode
                    ? 'hover:bg-gray-600 text-gray-400 hover:text-gray-300'
                    : 'hover:bg-gray-200 text-gray-500 hover:text-gray-700'
                }`}
                title="Edit comment"
              >
                <Edit2 className="w-4 h-4" />
              </button>
            )}
            {canDelete && (
              <button
                onClick={handleDelete}
                className={`p-1 rounded-full transition-colors ${
                  darkMode
                    ? 'hover:bg-red-600/20 text-red-400 hover:text-red-300'
                    : 'hover:bg-red-100 text-red-500 hover:text-red-700'
                }`}
                title="Delete comment"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Comment Content */}
      {isEditing ? (
        <div className="space-y-3">
          <textarea
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            className={`w-full p-3 rounded-lg border resize-none ${
              darkMode
                ? 'bg-gray-600 border-gray-500 text-white placeholder-gray-400 focus:border-blue-500'
                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500'
            } focus:outline-none focus:ring-1 focus:ring-blue-500`}
            rows={3}
            placeholder="Edit your comment..."
          />

          {/* File Attachment Section for Editing */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <button
                onClick={() => fileInputRef.current?.click()}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-colors ${
                  darkMode
                    ? 'bg-gray-600 hover:bg-gray-500 text-gray-300'
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                }`}
              >
                <Paperclip className="w-4 h-4" />
                Attach Files
              </button>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                onChange={handleFileSelect}
                className="hidden"
                accept="*/*"
              />
            </div>

            {/* Show attachments being edited */}
            {attachments.length > 0 && (
              <div className="space-y-1">
                {attachments.map((attachment) => (
                  <div
                    key={attachment.id}
                    className={`flex items-center justify-between p-2 rounded border ${
                      darkMode
                        ? 'bg-gray-600 border-gray-500'
                        : 'bg-white border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      {getFileIcon(attachment.name)}
                      <span className={`text-sm truncate ${
                        darkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        {attachment.name}
                      </span>
                      <span className={`text-xs ${
                        darkMode ? 'text-gray-400' : 'text-gray-500'
                      }`}>
                        ({formatFileSize(attachment.size)})
                      </span>
                    </div>
                    <button
                      onClick={() => handleRemoveAttachment(attachment.id)}
                      className={`p-1 rounded-full transition-colors ${
                        darkMode
                          ? 'hover:bg-red-600/20 text-red-400'
                          : 'hover:bg-red-100 text-red-500'
                      }`}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Edit Actions */}
          <div className="flex space-x-2">
            <button
              onClick={handleSave}
              disabled={!editText.trim()}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-colors ${
                editText.trim()
                  ? darkMode
                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                  : darkMode
                    ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              <Save className="w-4 h-4" />
              Save
            </button>
            <button
              onClick={handleCancel}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-colors ${
                darkMode
                  ? 'bg-gray-600 hover:bg-gray-500 text-gray-300'
                  : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
              }`}
            >
              <X className="w-4 h-4" />
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Comment Text */}
          <p className={`text-sm leading-relaxed ${
            darkMode ? 'text-gray-300' : 'text-gray-700'
          }`}>
            {comment.text}
          </p>

          {/* Attachments Display */}
          {(comment.attachments && comment.attachments.length > 0) && (
            <div className="space-y-2">
              <h5 className={`text-xs font-medium ${
                darkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Attachments ({comment.attachments.length})
              </h5>
              <div className="grid grid-cols-1 gap-1">
                {comment.attachments.map((attachment) => (
                  <div
                    key={attachment.id}
                    className={`flex items-center justify-between p-2 rounded border ${
                      darkMode
                        ? 'bg-gray-600/50 border-gray-600'
                        : 'bg-white border-gray-200'
                    }`}
                  >
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      {getFileIcon(attachment.name)}
                      <span className={`text-sm truncate ${
                        darkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        {attachment.name}
                      </span>
                      <span className={`text-xs ${
                        darkMode ? 'text-gray-400' : 'text-gray-500'
                      }`}>
                        ({formatFileSize(attachment.size)})
                      </span>
                    </div>
                    <button
                      onClick={() => handleDownloadAttachment(attachment)}
                      className={`p-1 rounded-full transition-colors ${
                        darkMode
                          ? 'hover:bg-gray-500 text-gray-400 hover:text-gray-300'
                          : 'hover:bg-gray-200 text-gray-500 hover:text-gray-700'
                      }`}
                      title="Download file"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Comment; 