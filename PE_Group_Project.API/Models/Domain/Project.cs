namespace PE_Group_Project.API.Models.Domain
{
    public class Project
    {
        public Guid ProjectId { get; set; }
        public required string ProjectName { get; set; }
        public required DateTime Date { get; set; }
        public required string Status { get; set; }
        public required string PriorityLevel { get; set; }
        public required Guid ProjectManagerInCharge { get; set; }
        public string? Description { get; set; }
        public ICollection<ProjectAttachment> Attachments { get; set; } = new List<ProjectAttachment>();
        public ICollection<UserProject> Contributors { get; set; } = new List<UserProject>();
    }

    public class ProjectAttachment
    {
        public Guid Id { get; set; }
        public required string FileName { get; set; }
        public required string ContentType { get; set; }
        public required long FileSize { get; set; }
        public required string FilePath { get; set; }
        public DateTime UploadedAt { get; set; }
        public Guid ProjectId { get; set; }
        public Project Project { get; set; } = null!;
    }
}
