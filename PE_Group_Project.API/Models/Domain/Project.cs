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
        public ICollection<UserProject> Contributors { get; set; } = new List<UserProject>();
    }
}
