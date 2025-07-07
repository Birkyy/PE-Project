namespace PE_Group_Project.API.Models.Domain
{
    public class Blob
    {
        public Guid BlobId { get; set; }
        public required string? Url { get; set; }
        public required string? Name { get; set; }
        public required string? ContentType { get; set; }
        public Stream? Content { get; set; }
        public Task? Task { get; set; } = null!;
    }
}
