namespace PE_Group_Project.API.Models.Domain
{
    public class Blob
    {
        public Guid BlobId { get; set; }
        public Guid ProjectTaskId { get; set; }
        public required string? Url { get; set; }
        public required string? Name { get; set; }
        public required string? ContentType { get; set; }
        public string? Status { get; set; }
        public bool Error { get; set; }
        public Stream? Content { get; set; }
        public ProjectTask ProjectTask { get; set; } = null!;
    }
}
