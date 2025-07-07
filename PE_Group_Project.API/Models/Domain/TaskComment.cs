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
    }
}
