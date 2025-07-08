namespace PE_Group_Project.API.Models.DTO
{
    public class CreateTaskCommentRequestDTO
    {
        public Guid ProjectTaskId { get; set; }
        public required string Comment { get; set; }
        public required Guid UserId { get; set; }
        public ICollection<CommentAttachmentRequestDTO>? Attachments { get; set; }
    }

    public class CommentAttachmentRequestDTO
    {
        public required string FileName { get; set; }
        public required string FileUrl { get; set; }
        public long FileSize { get; set; }
        public string? ContentType { get; set; }
    }
}
