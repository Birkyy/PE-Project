namespace PE_Group_Project.API.Models.DTO
{
    public class CreateTaskCommentRequestDTO
    {
        public Guid TaskCommentId { get; set; }
        public Guid ProjectTaskId { get; set; }
        public required string Comment { get; set; }
        public required Guid UserId { get; set; }
    }
}
