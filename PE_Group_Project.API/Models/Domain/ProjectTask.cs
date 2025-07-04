using System.ComponentModel.DataAnnotations;

namespace PE_Group_Project.API.Models.Domain
{
    public class ProjectTask
    {
        public Guid ProjectTaskId { get; set; }
        public required string TaskName { get; set; }
        public required Guid PIC { get; set; }
        public required DateTime Deadline { get; set; }
        public required string Description { get; set; }
        public required string Status { get; set; }
    }
} 