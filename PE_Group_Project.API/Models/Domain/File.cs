namespace PE_Group_Project.API.Models.Domain
{
    public class File
    {
        public Guid Id { get; set; }
        public string Name { get; set; }
        public string Url { get; set; }
        public long Size { get; set; }
        public string Type { get; set; }
        public DateTime UploadedAt { get; set; }
        public Guid RelatedId { get; set; }
        public string Category { get; set; }
    }
}
