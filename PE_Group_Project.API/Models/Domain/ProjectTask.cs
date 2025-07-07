using System.ComponentModel.DataAnnotations;

namespace PE_Group_Project.API.Models.Domain
{
    public class ProjectTask
    {
        public Guid ProjectTaskId { get; set; }
        public Guid ProjectId { get; set; } // Foreign key to Project
        public required string TaskName { get; set; }
        public required Guid PIC { get; set; }
        public required DateTime Deadline { get; set; }
        public required string Description { get; set; }
        public required string Status { get; set; }
        public required string Priority { get; set; }
        public ICollection<Blob> Blobs { get; set; } = new List<Blob>();
    }
}
