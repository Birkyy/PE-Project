namespace PE_Group_Project.API.Models.DTO
{
    public class TaskCommentDTO
    {
        public Guid TaskCommentId { get; set; }
        public Guid ProjectTaskId { get; set; }
        public required string Comment { get; set; }
        public required Guid UserId { get; set; }
        public string? Username { get; set; }
        public DateTime CreatedAt { get; set; }
        public ICollection<CommentAttachmentDTO> Attachments { get; set; } =
            new List<CommentAttachmentDTO>();
    }

    public class CommentAttachmentDTO
    {
        public Guid Id { get; set; }
        public required string FileName { get; set; }
        public required string FileUrl { get; set; }
        public long FileSize { get; set; }
        public string? ContentType { get; set; }
        public DateTime UploadedAt { get; set; }
    }
}
