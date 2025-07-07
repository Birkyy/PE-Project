import React, { useEffect, useState } from "react";
import { FileText } from "lucide-react";

const TaskAttachments = ({ taskId }) => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchFiles() {
      setLoading(true);
      try {
        const response = await fetch(`/api/File/list/task/${taskId}`);
        const data = await response.json();
        setFiles(data);
      } catch (err) {
        setFiles([]);
      }
      setLoading(false);
    }
    if (taskId) fetchFiles();
  }, [taskId]);

  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <FileText className="w-5 h-5" />
        <span>Attachments ({files.length})</span>
      </div>
      <div>
        {loading ? (
          <div>Loading...</div>
        ) : files.length === 0 ? (
          <div className="text-gray-400">No attachments yet</div>
        ) : (
          <ul>
            {files.map((file) => (
              <li key={file.name} className="flex items-center gap-2 mb-1">
                <a
                  href={file.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:underline"
                >
                  {file.name}
                </a>
                <span className="text-xs text-gray-500">
                  ({(file.size / 1024).toFixed(1)} KB)
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default TaskAttachments;
