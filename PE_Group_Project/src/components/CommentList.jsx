import React, { useState } from "react";
import { useTheme } from "../context/ThemeContext";
import { Send, MessageSquare } from "lucide-react";
import Comment from "./Comment";

const CommentList = ({
  comments = [],
  currentUser,
  onAddComment,
  onEditComment,
  onDeleteComment,
  taskId,
}) => {
  const { darkMode } = useTheme();
  const [newCommentText, setNewCommentText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmitComment = async () => {
    if (!newCommentText.trim()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const commentData = {
        projectTaskId: taskId,
        comment: newCommentText.trim(),
        userId: currentUser?.userId || currentUser?.id,
      };

      console.log("Submitting comment with data:", commentData);

      await onAddComment(taskId, commentData);
      setNewCommentText("");
    } catch (error) {
      console.error("Error submitting comment:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyPress = (event) => {
    if (event.key === "Enter" && (event.ctrlKey || event.metaKey)) {
      event.preventDefault();
      handleSubmitComment();
    }
  };

  const sortedComments = [...comments].sort(
    (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
  );

  return (
    <div className="space-y-4">
      {/* Comments Header */}
      <div className="flex items-center gap-2">
        <MessageSquare
          className={`w-5 h-5 ${darkMode ? "text-gray-400" : "text-gray-600"}`}
        />
        <h4
          className={`text-lg font-medium ${
            darkMode ? "text-gray-200" : "text-gray-900"
          }`}
        >
          Comments
        </h4>
        <span
          className={`text-sm px-2 py-1 rounded-full ${
            darkMode ? "bg-gray-700 text-gray-300" : "bg-gray-200 text-gray-600"
          }`}
        >
          {comments.length}
        </span>
      </div>

      {/* Add New Comment */}
      <div
        className={`p-4 rounded-lg border ${
          darkMode ? "bg-gray-800 border-gray-600" : "bg-white border-gray-200"
        }`}
      >
        <div className="space-y-3">
          {/* Comment Input */}
          <div className="flex gap-2">
            <textarea
              value={newCommentText}
              onChange={(e) => setNewCommentText(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Add a comment... (Ctrl+Enter to submit)"
              className={`flex-1 p-3 rounded-lg border resize-none ${
                darkMode
                  ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500"
                  : "bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500"
              } focus:outline-none focus:ring-1 focus:ring-blue-500`}
              rows={3}
            />
            <button
              onClick={handleSubmitComment}
              disabled={isSubmitting || !newCommentText.trim()}
              className={`px-4 py-2 rounded-lg transition-colors ${
                darkMode
                  ? "bg-blue-600 hover:bg-blue-700 text-white disabled:bg-gray-700 disabled:text-gray-500"
                  : "bg-blue-500 hover:bg-blue-600 text-white disabled:bg-gray-200 disabled:text-gray-400"
              } disabled:cursor-not-allowed`}
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Comments List */}
      <div className="space-y-4">
        {sortedComments.map((comment) => (
          <Comment
            key={comment.taskCommentId}
            comment={comment}
            currentUser={currentUser}
            onEdit={onEditComment}
            onDelete={onDeleteComment}
          />
        ))}
        {sortedComments.length === 0 && (
          <p
            className={`text-center py-4 ${
              darkMode ? "text-gray-400" : "text-gray-500"
            }`}
          >
            No comments yet. Be the first to comment!
          </p>
        )}
      </div>
    </div>
  );
};

export default CommentList;
