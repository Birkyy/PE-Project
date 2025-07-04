namespace PE_Group_Project.API.Models.Domain
{
    public class Project
    {
        public Guid ProjectId { get; set; }
        public required string Name { get; set; }
        public string? Description { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime DueDate { get; set; }
        public required string Priority { get; set; }
        public required string Status { get; set; }

        public virtual ICollection<UserProject> UserProjects { get; set; } =
            new List<UserProject>();
    }
}
