namespace PE_Group_Project.API.Models.Domain
{
    public class Project
    {
        public Guid ProjectId { get; set; }
        public required string Name { get; set; }
        public DateTime CreatedAt { get; set; }
        public required string Status { get; set; }

        public virtual ICollection<UserProject> UserProjects { get; set; } =
            new List<UserProject>();
    }
}
