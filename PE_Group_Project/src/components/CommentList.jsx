import React, { useState, useRef } from 'react';
import { useTheme } from '../context/ThemeContext';
import { Send, Paperclip, X, MessageSquare } from 'lucide-react';
import Comment from './Comment';

const CommentList = ({ 
  comments = [], 
  currentUser, 
  onAddComment, 
  onEditComment, 
  onDeleteComment,
  taskId 
}) => {
  const { darkMode } = useTheme();
  const [newCommentText, setNewCommentText] = useState('');
  const [newCommentAttachments, setNewCommentAttachments] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef(null);

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

    if (imageExts.includes(extension)) return '🖼️';
    if (videoExts.includes(extension)) return '🎥';
    if (audioExts.includes(extension)) return '🎵';
    if (docExts.includes(extension)) return '📄';
    return '📎';
  };

  const handleFileSelect = (event) => {
    const files = Array.from(event.target.files);
    const newAttachments = files.map(file => ({
      id: Date.now() + Math.random(),
      name: file.name,
      size: file.size,
      type: file.type,
      file: file,
      uploadedAt: new Date().toISOString()
    }));
    
    setNewCommentAttachments(prev => [...prev, ...newAttachments]);
    event.target.value = '';
  };

  const handleRemoveAttachment = (attachmentId) => {
    setNewCommentAttachments(prev => prev.filter(att => att.id !== attachmentId));
  };

  const handleSubmitComment = async () => {
    if (!newCommentText.trim() && newCommentAttachments.length === 0) return;
    
    setIsSubmitting(true);
    
    try {
      const comment = {
        id: Date.now() + Math.random(),
        text: newCommentText.trim(),
        author: currentUser?.username || currentUser?.email || 'Anonymous',
        authorId: currentUser?.id,
        timestamp: new Date().toISOString(),
        attachments: newCommentAttachments,
        taskId: taskId
      };

      await onAddComment(comment);
      
      // Reset form
      setNewCommentText('');
      setNewCommentAttachments([]);
    } catch (error) {
      console.error('Error adding comment:', error);
      // You might want to show an error message to the user here
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
      event.preventDefault();
      handleSubmitComment();
    }
  };

  const sortedComments = [...comments].sort((a, b) => 
    new Date(a.timestamp) - new Date(b.timestamp)
  );

  return (
    <div className="space-y-4">
      {/* Comments Header */}
      <div className="flex items-center gap-2">
        <MessageSquare className={`w-5 h-5 ${
          darkMode ? 'text-gray-400' : 'text-gray-600'
        }`} />
        <h4 className={`text-lg font-medium ${
          darkMode ? 'text-gray-200' : 'text-gray-900'
        }`}>
          Comments
        </h4>
        <span className={`text-sm px-2 py-1 rounded-full ${
          darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-600'
        }`}>
          {comments.length}
        </span>
      </div>

      {/* Add New Comment */}
      <div className={`p-4 rounded-lg border ${
        darkMode 
          ? 'bg-gray-800 border-gray-600' 
          : 'bg-white border-gray-200'
      }`}>
        <div className="space-y-3">
          {/* Comment Input */}
          <textarea
            value={newCommentText}
            onChange={(e) => setNewCommentText(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Add a comment... (Ctrl+Enter to submit)"
            className={`w-full p-3 rounded-lg border resize-none ${
              darkMode
                ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500'
                : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500'
            } focus:outline-none focus:ring-1 focus:ring-blue-500`}
            rows={3}
          />

          {/* File Attachments Section */}
          <div className="space-y-2">
            {/* Attach Files Button */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isSubmitting}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-colors ${
                  darkMode
                    ? 'bg-gray-700 hover:bg-gray-600 text-gray-300 disabled:bg-gray-800 disabled:text-gray-500'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700 disabled:bg-gray-50 disabled:text-gray-400'
                } disabled:cursor-not-allowed`}
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

            {/* Show selected attachments */}
            {newCommentAttachments.length > 0 && (
              <div className="space-y-1">
                <div className={`text-xs font-medium ${
                  darkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Files to attach ({newCommentAttachments.length}):
                </div>
                {newCommentAttachments.map((attachment) => (
                  <div
                    key={attachment.id}
                    className={`flex items-center justify-between p-2 rounded border ${
                      darkMode
                        ? 'bg-gray-700 border-gray-600'
                        : 'bg-gray-50 border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <span className="text-sm">{getFileIcon(attachment.name)}</span>
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
                      disabled={isSubmitting}
                      className={`p-1 rounded-full transition-colors ${
                        darkMode
                          ? 'hover:bg-red-600/20 text-red-400 disabled:text-gray-600'
                          : 'hover:bg-red-100 text-red-500 disabled:text-gray-400'
                      } disabled:cursor-not-allowed`}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex justify-between items-center">
            <div className={`text-xs ${
              darkMode ? 'text-gray-400' : 'text-gray-500'
            }`}>
              Tip: Press Ctrl+Enter to submit quickly
            </div>
            <button
              onClick={handleSubmitComment}
              disabled={(!newCommentText.trim() && newCommentAttachments.length === 0) || isSubmitting}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                (!newCommentText.trim() && newCommentAttachments.length === 0) || isSubmitting
                  ? darkMode
                    ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : darkMode
                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              <Send className="w-4 h-4" />
              {isSubmitting ? 'Adding...' : 'Add Comment'}
            </button>
          </div>
        </div>
      </div>

      {/* Comments List */}
      <div className="space-y-3">
        {sortedComments.length === 0 ? (
          <div className={`text-center py-8 ${
            darkMode ? 'text-gray-400' : 'text-gray-500'
          }`}>
            <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No comments yet. Be the first to comment!</p>
          </div>
        ) : (
          sortedComments.map((comment) => (
            <Comment
              key={comment.id}
              comment={comment}
              currentUser={currentUser}
              onEdit={onEditComment}
              onDelete={onDeleteComment}
              canEdit={true}
              canDelete={true}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default CommentList; 