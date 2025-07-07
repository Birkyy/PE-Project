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

  const isAuthor = currentUser && comment.userId === currentUser.id;

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
      className={`p-4 rounded-lg ${
        darkMode ? "bg-gray-700/50" : "bg-gray-50"
      } space-y-3`}
    >
      {/* Header */}
      <div className="flex justify-between">
        <div className="text-sm font-medium">{comment.userId}</div>
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
        <div className="text-sm">{comment.comment}</div>
      )}

      <div className="text-xs text-gray-400">
        {formatDate(comment.createdAt || comment.timestamp)}
      </div>
    </div>
  );
};

export default Comment;
