namespace PE_Group_Project.API.Models.DTO
{
    public class TaskCommentDTO
    {
        public Guid TaskCommentId { get; set; }
        public Guid ProjectTaskId { get; set; }
        public required string Comment { get; set; }
        public required Guid UserId { get; set; }
        public string? Username { get; set; } // Add this
        public DateTime CreatedAt { get; set; } // Add this
    }
}
