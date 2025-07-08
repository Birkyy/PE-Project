using System.ComponentModel.DataAnnotations;

namespace PE_Group_Project.API.Models.Domain
{
    public class TaskComment
    {
        public Guid TaskCommentId { get; set; }
        public Guid ProjectTaskId { get; set; }
        public required string Comment { get; set; }
        public required Guid UserId { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public ICollection<CommentAttachment> Attachments { get; set; } =
            new List<CommentAttachment>();
    }

    public class CommentAttachment
    {
        public Guid Id { get; set; }
        public required string FileName { get; set; }
        public required string FileUrl { get; set; }
        public long FileSize { get; set; }
        public string? ContentType { get; set; }
        public DateTime UploadedAt { get; set; } = DateTime.UtcNow;
        public Guid TaskCommentId { get; set; }
        public TaskComment TaskComment { get; set; } = null!;
    }
}
