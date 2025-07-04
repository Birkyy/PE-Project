namespace PE_Group_Project.API.Models.DTO
{
    public class ProjectDTO
    {
        public Guid ProjectId { get; set; }
        public string ProjectName { get; set; } = null!;
        public DateTime Date { get; set; }
        public string Status { get; set; } = null!;
        public string PriorityLevel { get; set; } = null!;
        public Guid ProjectManagerInCharge { get; set; }
        public string? Description { get; set; }
        public List<ProjectAttachmentDTO> Attachments { get; set; } = new List<ProjectAttachmentDTO>();
    }

    public class ProjectAttachmentDTO
    {
        public Guid Id { get; set; }
        public string FileName { get; set; } = null!;
        public string ContentType { get; set; } = null!;
        public long FileSize { get; set; }
        public string Url { get; set; } = null!;
        public DateTime UploadedAt { get; set; }
    }
}
