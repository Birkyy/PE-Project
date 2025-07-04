namespace PE_Group_Project.API.Models.DTO
{
    public class CreateProjectTaskRequestDTO
    {
        public Guid ProjectTaskId { get; set; }
        public Guid ProjectId { get; set; }
        public required string TaskName { get; set; }
        public required Guid PIC { get; set; }
        public required DateTime Deadline { get; set; }
        public required string Description { get; set; }
        public required string Status { get; set; }
        public required string Priority { get; set; }
    }
} 